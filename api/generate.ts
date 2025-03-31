import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { Octokit } from 'octokit';
import * as fs from 'fs';
import * as path from 'path';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_NAME = process.env.REPO_NAME;

type Category = 'tech' | 'design' | 'life';

const categoryMap: Record<Category, string> = {
  tech: 'technology',
  design: 'design', // Design could be UX/UI news
  life: 'general',
};

// Function to read the prompt from product-docs/prompts.md
const readPromptFromFile = (): string => {
  try {
    const promptPath = path.join(process.cwd(), 'product-docs', 'prompts.md');
    const fileContent = fs.readFileSync(promptPath, 'utf8');
    
    // Extract the system prompt part (everything between the title and the Example Use section)
    const promptMatch = fileContent.match(/🧠 ✍️ The Boring Dev – GPT Writing Style Prompt[\s\S]+?(?=🧪 Example Use in Code)/);
    
    if (promptMatch && promptMatch[0]) {
      // Clean up the prompt by removing markdown code block markers and meta text
      return promptMatch[0]
        .replace(/text\s+Copy\s+Edit/g, '')
        .replace(/^🧠 ✍️ The Boring Dev – GPT Writing Style Prompt\s+/g, '')
        .trim();
    }
    
    throw new Error('Could not parse prompt from file');
  } catch (error) {
    console.error('Error reading prompt file:', error);
    // Fallback to comprehensive default prompt if file read fails
    return `You are writing for a website called "The Boring Dev" — a dry, witty, and observational publication that documents the quietly absurd side of modern tech, design, and work culture.

Your tone is professional-journalist-meets-burned-out-designer. Your writing should sound serious on the surface, but is clearly mocking the topic with a straight face. Imagine if *The Onion* and *Wired* had a very tired baby.

Write short blog articles (~400–600 words) based on current news headlines, following this structure:

1. **Headline**: A funny-yet-serious title. Example: *The Art of Pretending to Work From Home*
2. **Lead Paragraph**: A research-sounding or deadpan statement revealing the core absurdity. Include fake institutions or stats.
3. **Body**:
   - Detail the "findings" or describe the event as if you're seriously reporting on it.
   - Use fake expert quotes or clearly staged insights.
   - Mention real products or companies when relevant (to ground it).
   - Use specific, relatable examples of the behavior being mocked.
4. **Reflection**: Mild irony or existential reflection about how we got here. Include phrases like "unsurprisingly," "according to nobody," or "what this means for the future of work/design/tech."
5. **Wrap-up**: End on a dry note or call to action that no one will follow. Be witty, but never break character.

Markdown format. Use \`#\` for the title. Use real news headlines (provided below) as inspiration, but reframe them into Boring Dev themes.

Your story should fall into one of these categories:
- **Boring Tech**: Overhyped tools, AI fatigue, corporate buzzword soup
- **Boring Design**: Design systems wars, trends that died but live on, everything now looks the same
- **Boring Life**: Productivity hacks, remote work rituals, Slack status theater

Stay subtle. No punchlines. Let the absurdity speak for itself.

Format output in Markdown with:
- A level 1 heading (#) for the title
- No additional formatting beyond regular paragraphs and occasional *emphasis*
- No additional headings, lists, or special characters`;
  }
};

const getPromptForCategory = (category: string, headlines: string) => {
  const categoryCues: Record<Category, string> = {
    tech: 'Focus on **Boring Tech**: Overhyped tools, AI fatigue, corporate buzzword soup.',
    design: 'Focus on **Boring Design**: Design systems wars, trends that died but live on, everything now looks the same.',
    life: 'Focus on **Boring Life**: Productivity hacks, remote work rituals, Slack status theater.',
  };

  return `${categoryCues[category as Category] || ''}\n\nHere are today's headlines:\n${headlines}`;
};

// Using ES Module export syntax
export const handler = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { category = 'tech' } = req.body;
    const newsCategory = categoryMap[category as Category] || 'technology';

    // Get system prompt from file
    const BORING_DEV_PROMPT = readPromptFromFile();

    const newsRes = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        category: newsCategory,
        language: 'en',
        pageSize: 3,
        apiKey: NEWS_API_KEY,
      },
    });

    const headlines = newsRes.data.articles.map((a: any) => `- ${a.title}`).join('\n');
    const promptContent = getPromptForCategory(category, headlines);

    const gptRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: BORING_DEV_PROMPT },
          { role: 'user', content: promptContent + '\n\nMake sure to include a catchy, ironic headline as a level 1 markdown heading (# Your Headline Here) at the start of your article.' },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const story = gptRes.data.choices[0].message.content;
    
    // Make sure the story starts with a proper Markdown heading
    let processedStory = story;
    if (!story.trim().startsWith('#')) {
      const firstLineBreak = story.indexOf('\n');
      if (firstLineBreak > -1) {
        const title = story.substring(0, firstLineBreak).trim();
        const restOfStory = story.substring(firstLineBreak);
        processedStory = `# ${title}${restOfStory}`;
      } else {
        processedStory = `# ${story.trim()}`;
      }
    }
    
    const title = processedStory.split('\n')[0].replace(/^#+\s*/, '').trim();
    const filename = `stories/${new Date().toISOString().split('T')[0]}-${category}-${title.replace(/\s+/g, '-').toLowerCase()}.md`;

    if (GITHUB_TOKEN && REPO_NAME) {
      const [owner, repo] = REPO_NAME.split('/');
      
      if (owner && repo) {
        const octokit = new Octokit({ auth: GITHUB_TOKEN });
        await octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: filename,
          message: `Auto-generate ${category} story: ${title}`,
          content: Buffer.from(processedStory).toString('base64'),
          committer: {
            name: 'The Boring Bot',
            email: 'noreply@theboringdev.com',
          },
          author: {
            name: 'The Boring Bot',
            email: 'noreply@theboringdev.com',
          },
        });
      } else {
        console.warn('Invalid REPO_NAME format. Expected format: "owner/repo"');
      }
    } else {
      console.warn('GITHUB_TOKEN or REPO_NAME not provided. Skipping GitHub file creation.');
    }

    res.status(200).json({ story: processedStory });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to generate story' });
  }
};

// Default export
export default handler; 
