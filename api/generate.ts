import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { Octokit } from 'octokit';

// Environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_NAME = process.env.REPO_NAME;
const API_SECRET_KEY = process.env.API_SECRET_KEY; // New secret key for API auth

// In-memory rate limiting (will reset on server restart)
// In a production app, use Redis or another persistent store
const requestCache: Record<string, { count: number, timestamp: number }> = {};
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute

const categoryMap = {
  tech: 'technology',
  design: 'technology', // Design may not have direct category, use tech for now
  life: 'general',
};

const getPromptForCategory = (category: string, headlines: string) => {
  const base = `Write a short blog post for a site called \"The Boring Dev\". Use a dry, mildly sarcastic, yet clever tone.`;

  const topics = {
    tech: `${base} The topic is Boring Tech. Focus on mundane or over-discussed tech trends. Base it on these news headlines:\n\n${headlines}`,
    design: `${base} The topic is Boring Design. Highlight outdated trends, design system drama, or designer fatigue. Base it on these headlines:\n\n${headlines}`,
    life: `${base} The topic is Boring Life. Relate to remote work struggles, mundane routines, or productivity myths. Base it on these headlines:\n\n${headlines}`,
  };

  return topics[category as keyof typeof topics] || base;
};

// Security utility functions
const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const userRequest = requestCache[ip];
  
  if (!userRequest) {
    requestCache[ip] = { count: 1, timestamp: now };
    return true;
  }
  
  // Reset count if outside window
  if (now - userRequest.timestamp > RATE_LIMIT_WINDOW) {
    requestCache[ip] = { count: 1, timestamp: now };
    return true;
  }
  
  // Increment count if within limit
  if (userRequest.count < RATE_LIMIT_MAX) {
    userRequest.count++;
    return true;
  }
  
  return false; // Rate limit exceeded
};

const verifyApiKey = (req: VercelRequest): boolean => {
  // Skip auth for local development
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode - skipping auth');
    return true;
  }
  
  // For GitHub Actions or other automation
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader);
  console.log('Expected API key:', API_SECRET_KEY);
  
  if (!authHeader) {
    console.log('No authorization header provided');
    return false;
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    console.log('Authorization header does not start with Bearer');
    return false;
  }
  
  const token = authHeader.substring(7);
  const isValid = token === API_SECRET_KEY;
  console.log('Token validation result:', isValid);
  
  return isValid;
};

const validateRequest = (category: string): boolean => {
  const validCategories = ['tech', 'design', 'life'];
  return validCategories.includes(category);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Environment check:', {
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasNewsAPI: !!process.env.NEWS_API_KEY,
      hasGithub: !!process.env.GITHUB_TOKEN,
      hasRepoName: !!process.env.REPO_NAME,
      hasApiSecret: !!process.env.API_SECRET_KEY
    });
    
    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Check request method
    if (req.method !== 'POST') {
      console.log('Method not allowed:', req.method);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
    
    // Check IP-based rate limiting
    const clientIp = req.headers['x-forwarded-for'] || 'unknown-ip';
    const ipString = Array.isArray(clientIp) ? clientIp[0] : clientIp.split(',')[0];
    
    if (!checkRateLimit(ipString)) {
      return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
    }
    
    // Verify API key for production requests
    if (!verifyApiKey(req)) {
      console.log('API key verification failed');
      return res.status(401).json({ error: 'Unauthorized. Invalid or missing API key.' });
    }
    
    // Extract and validate category
    const { category = 'tech' } = req.body;
    console.log('Received category:', category);
    
    if (!validateRequest(category)) {
      return res.status(400).json({ error: 'Invalid category. Must be tech, design, or life.' });
    }
    
    const newsCategory = categoryMap[category as keyof typeof categoryMap] || 'technology';

    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY || !process.env.NEWS_API_KEY) {
      console.error('Missing required API keys:', {
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        hasNewsAPI: !!process.env.NEWS_API_KEY
      });
      return res.status(500).json({ error: 'Server configuration error: Missing API keys' });
    }
    
    // Get news headlines
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

    // Generate story with OpenAI
    const gptRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-1106-preview',
        messages: [
          { role: 'system', content: 'You are a dry but witty blogger.' },
          { role: 'user', content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const story = gptRes.data.choices[0].message.content;
    const title = story.split('\n')[0].replace(/^#+\s*/, '').trim();
    const filename = `stories/${new Date().toISOString().split('T')[0]}-${category}-${title.replace(/\s+/g, '-').toLowerCase()}.md`;

    // Save to GitHub if credentials are available
    if (GITHUB_TOKEN && REPO_NAME) {
      const octokit = new Octokit({ auth: GITHUB_TOKEN });
      const [owner, repo] = (REPO_NAME || '').split('/');
      
      if (owner && repo) {
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
      }
    }

    res.status(200).json({ story });
  } catch (error: any) {
    console.error('Error in handler:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 