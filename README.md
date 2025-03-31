# The Boring Dev - Stories Generator

A minimal frontend app for generating and scheduling automated Boring Stories in Tech, Design, and Life.

## Checklist

### Project Setup
- [x] Initialize Vite project with React + TypeScript
- [x] ~~Install TailwindCSS and configure~~ (Using inline styles instead due to configuration issues)
- [x] Install Axios

### Environment Variables
- [x] Create `.env` file with API URL
- [x] Prepare for Vercel deployment environment variables

### Frontend UI
- [x] Create Generate page
- [x] Implement story generation UI
- [x] Add category selection

### Serverless API
- [x] Create API endpoint for story generation
- [x] Implement OpenAI integration
- [x] Implement NewsAPI integration
- [x] Add GitHub storage for stories

### Scheduler
- [x] Set up GitHub Actions workflow for daily generation

### Deployment
- [x] Set up Vercel configuration

### Security
- [x] Add API key authentication
- [x] Implement rate limiting
- [x] Add request validation
- [x] Secure environment variables

## How to use

1. Clone this repository
2. Install dependencies with `npm install`
3. Create a local `.env` file based on `.env.example`
4. Set up environment variables:
   - In the local `.env` file: `VITE_API_BASE_URL=/api`
   - In Vercel Dashboard:
     - `OPENAI_API_KEY` - Your OpenAI API key
     - `NEWS_API_KEY` - Your NewsAPI API key
     - `GITHUB_TOKEN` - GitHub personal access token
     - `REPO_NAME` - Your repository in format "username/repo"
     - `API_SECRET_KEY` - Secret key for authenticating API requests
5. Run locally with `npm run dev`
6. Deploy to Vercel by connecting your GitHub repository

## API Endpoints

- `/api/generate` - POST request with JSON body `{"category": "tech|design|life"}`
  - Requires Authorization header: `Authorization: Bearer YOUR_API_SECRET_KEY`
  - Rate limited to 5 requests per minute per IP address

## Security Notes

- API keys and tokens are stored in Vercel environment variables, not in the code
- The `.env` file is excluded from git to prevent accidental exposure of secrets
- API endpoints are protected with authentication and rate limiting
- Use a secure, random string for `API_SECRET_KEY` (e.g., generate with `openssl rand -hex 32`)
- For GitHub Actions, add `API_SECRET_KEY` as a repository secret

## Implementation Notes

Due to configuration issues with Tailwind CSS and PostCSS, this implementation uses inline styles instead. The functionality remains identical to the original requirements.
