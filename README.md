# The Boring Dev - Story Generator

A minimal frontend app for generating and scheduling automated **Boring Stories** in **Tech, Design, and Life** for "The Boring Dev". Built with Vite, React, TypeScript, and TailwindCSS.

## Features

- ✅ Simple UI for generating stories on-demand
- ✅ Category selection (Tech, Design, Life)
- ✅ API integration with OpenAI GPT-4 
- ✅ Automatic sourcing of relevant news headlines
- ✅ Auto-saving of generated stories to GitHub repository
- ✅ Daily automated story generation via GitHub Actions

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Vercel account
- OpenAI API key
- News API key
- GitHub personal access token

### Environment Variables

1. Frontend env (`.env`):
   ```
   VITE_API_BASE_URL=/api
   ```

2. Vercel Dashboard (for API):
   ```
   OPENAI_API_KEY=sk-...
   NEWS_API_KEY=your-news-api-key
   GITHUB_TOKEN=ghp_...
   REPO_NAME=username/theboringdev
   ```

3. GitHub Secrets (for Action):
   ```
   GENERATE_TOKEN=your-auth-token
   ```

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/boring-stories-generator.git
   cd boring-stories-generator
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start development server
   ```
   npm run dev
   ```

### Deployment

Deploy to Vercel:
```
npx vercel
```

## Usage

1. Select a category (Tech, Design, Life)
2. Click "Generate" to create a new boring story
3. The story will be displayed and automatically saved to your GitHub repository

## License

MIT
