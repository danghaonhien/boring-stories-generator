import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { Octokit } from 'octokit';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_NAME = process.env.REPO_NAME;

const categoryMap = {
  tech: 'technology',
  design: 'design', // Design could be UX/UI news
  life: 'general',
};

const getPromptForCategory = (category: string, headlines: string) => {
  const base = `Write a short blog post for a site called \"The Boring Dev\". Use a dry, mildly sarcastic, yet clever tone.`;

  const topics = {
    tech: `${base} The topic is Boring Tech. Focus on mundane or over-discussed tech trends. Base it on these news headlines:\n\n${headlines}`,
    design: `${base} The topic is Boring Design. Highlight outdated trends, design system drama, or designer fatigue. Base it on these headlines:\n\n${headlines}`,
    life: `${base} The topic is Boring Life. Relate to remote work struggles, mundane routines, or productivity myths. Base it on these headlines:\n\n${headlines}`,
  };

  return topics[category] || base;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { category = 'tech' } = req.body;
    const newsCategory = categoryMap[category] || 'technology';

    const newsRes = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        category: newsCategory,
        language: 'en',
        pageSize: 3,
        apiKey: NEWS_API_KEY,
      },
    });

    const headlines = newsRes.data.articles.map((a: any) => `- ${a.title}`).join('\n');
    const prompt = getPromptForCategory(category, headlines);

    const gptRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a dry but witty blogger.' },
          { role: 'user', content: prompt },
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
} 