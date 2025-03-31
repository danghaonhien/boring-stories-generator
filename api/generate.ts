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
    // Fallback to default prompt if file read fails
    return `You are a dry, clever blogger writing for a website called "The Boring Dev"...`;
  }
};

const getPromptForCategory = (category: string, headlines: string) => {
  const categoryCues: Record<Category, string> = {
    tech: 'Focus on **Boring Tech**: Trends that feel recycled (e.g. AI everything, overengineered tools).',
    design: 'Focus on **Boring Design**: Design trends that are performative, dated, or over-analyzed.',
    life: 'Focus on **Boring Life**: Remote work, productivity hacks, burnout culture, digital rituals.',
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
          { role: 'user', content: promptContent },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const story = gptRes.data.choices[0].message.content;
    const title = story.split('\n')[0].replace(/^#+\s*/, '').trim();
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
          content: Buffer.from(story).toString('base64'),
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

    res.status(200).json({ story });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to generate story' });
  }
};

// Default export
export default handler; 
