import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { Octokit } from 'octokit';

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

// Boring Dev prompt from our style guide
const BORING_DEV_PROMPT = `You are a dry, clever blogger writing for a website called "The Boring Dev" — a publication that covers the dull, over-discussed, or slightly ridiculous side of tech, design, and life in the modern digital world.

Your voice is a mix of observational wit, deadpan sarcasm, and subtle critique — think: someone who's tired, informed, and self-aware, but still enjoys reporting on the absurdity of modern tech culture.

Write short articles (~500 words) that take a current piece of tech/design/life news and analyze it through the lens of boredom, trend fatigue, and corporate buzzword absurdity. Treat everything like it *wants* to sound important — but you're not impressed.

IMPORTANT: You MUST strictly follow this structure in exactly this order:
1. **Lead-in:** A semi-dramatic opening line referencing the news item. (1-2 sentences)
2. **Breakdown:** What the news is actually about without any hype. Include at least one specific fact or detail. (2-3 sentences)
3. **Cultural Observation:** Why this is interesting, annoying, or a sign of the times. Reference broader tech trends here. (3-4 sentences)
4. **Mildly Ironic Reflection:** Offer your opinion in a subtle, deadpan way. Do not exaggerate or use hyperbole. (2-3 sentences)
5. **Wrap-Up:** Close with a wry note or a call to quietly continue with our lives. Keep this brief and understated. (1-2 sentences)

You MUST:
- Reference exact headlines as provided (do not modify them)
- Include at least one direct quote or specific summary from sources
- Maintain a consistent voice that sounds like a jaded but lovable product designer/dev
- Stay within 450-550 words total
- Include exactly one paragraph for each of the 5 structure points above

You MUST NOT:
- Be over-the-top snarky or mean-spirited
- Use excessive humor, puns, or jokes
- Sound like a hypebeast or startup pitch deck
- Diverge from the 5-part structure for any reason
- Add additional sections or omit any required sections

Format output in Markdown with:
- A level 1 heading (#) for the title
- No additional formatting beyond regular paragraphs and occasional *emphasis*
- No additional headings, lists, or special characters`;

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
