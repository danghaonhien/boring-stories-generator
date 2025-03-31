# Minimal Frontend AI Story Generator Setup (Boring Stories: Tech, Design, Life)

A step-by-step guide to build a **minimal frontend app** for generating and scheduling automated **Boring Stories** in **Tech, Design, and Life** for "The Boring Dev", using **Vite + React + TailwindCSS** and **JavaScript/TypeScript**, with **secure API integration**, automatic saving, and publishing to your site `theboringdev.com`.

---

## 🧱 Stack Overview

- **Frontend**: Vite + React + TailwindCSS
- **Backend/API**: Vercel Serverless Functions (Node.js/TypeScript)
- **AI**: OpenAI GPT-4 API
- **News Source**: NewsAPI (headlines by category)
- **Storage**: Auto-save as Markdown files to GitHub
- **Scheduler**: GitHub Actions (daily trigger)
- **Security**: Environment variables via Vercel Dashboard

---

## 1. 🚀 Project Initialization

### Create Vite Project
```bash
npm create vite@latest the-boring-dev-generator --template react-ts
cd the-boring-dev-generator
```

### Install TailwindCSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Configure Tailwind (`tailwind.config.ts`)
```ts
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}"
]
```

### Add Tailwind to `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Install Axios
```bash
npm install axios
```

---

## 2. 🔐 Environment Variables

### In Root Project
Create `.env`:
```
VITE_API_BASE_URL=/api
```

### In Vercel Dashboard (Project > Settings > Environment Variables):
```
OPENAI_API_KEY=sk-...
NEWS_API_KEY=your-news-api-key
GITHUB_TOKEN=ghp_...
REPO_NAME=username/theboringdev
```

Do **NOT** store your actual API keys in `.env` files in the frontend — use Vercel’s env variables for serverless functions.

---

## 3. 🧠 Create Frontend UI

### Pages
- `src/pages/Generate.tsx` — story generator page

### Example: `Generate.tsx`
```tsx
import axios from 'axios';
import { useState } from 'react';

export default function Generate() {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('tech');
  const [story, setStory] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/generate`, {
      category,
    });
    setStory(res.data.story);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Generate Boring Story</h1>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="tech">Boring Tech</option>
        <option value="design">Boring Design</option>
        <option value="life">Boring Life</option>
      </select>
      <button className="ml-4 bg-black text-white px-4 py-2 rounded" onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>
      {story && <pre className="mt-4 bg-gray-100 p-4 rounded whitespace-pre-wrap">{story}</pre>}
    </div>
  );
}
```

---

## 4. 🧩 Add Serverless API (Vercel)

Create `/api/generate.ts` in root:
```ts
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
      model: 'gpt-4-1106-preview',
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

  const octokit = new Octokit({ auth: GITHUB_TOKEN });
  await octokit.rest.repos.createOrUpdateFileContents({
    owner: REPO_NAME.split('/')[0],
    repo: REPO_NAME.split('/')[1],
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

  res.status(200).json({ story });
}
```

---

## 5. 📆 Add Scheduler (GitHub Actions)

Create `.github/workflows/schedule.yml`:
```yaml
name: Daily Boring Story

on:
  schedule:
    - cron: '0 15 * * *' # 3PM UTC daily

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Curl Trigger
        run: |
          curl -X POST "https://theboringdev.com/api/generate" -H "Authorization: Bearer ${{ secrets.GENERATE_TOKEN }}" -H "Content-Type: application/json" -d '{"category":"tech"}'
```

You can duplicate this for each category, or rotate randomly with logic in your backend.

---

## 6. 📦 Deploy to Vercel

### Deploy your app:
```bash
npx vercel
```

- Connect your GitHub repo
- Set environment variables via Vercel Dashboard
- Ensure your `/stories` folder is rendered by your blog engine

---

## ✅ Final Notes

- Generates Boring Tech, Design, or Life stories
- Prompts are tailored per theme to stay relevant and on-brand
- Markdown files are auto-saved to GitHub and deployed to `theboringdev.com`
- API keys and tokens are secured with Vercel + GitHub secrets
- GitHub Actions handles scheduled posting

Let your dry, witty, Boring Dev content flow 🥱🚀

