# Vercel Deployment Guide

This guide provides step-by-step instructions to deploy the Boring Stories Generator application to Vercel.

## Prerequisites

- A Vercel account
- The Vercel CLI installed (`npm i -g vercel`)
- OpenAI API key
- NewsAPI key
- GitHub personal access token

## Steps to Deploy

### 1. Login to Vercel
```
vercel login
```

### 2. Deploy the Application
From the root of the project, run:
```
vercel
```

### 3. Configure Environment Variables

After the initial deployment, set the following environment variables in the Vercel Dashboard:

1. Go to your project settings on the Vercel Dashboard
2. Navigate to the "Environment Variables" section
3. Add the following variables:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `NEWS_API_KEY` - Your NewsAPI key
   - `GITHUB_TOKEN` - Your GitHub personal access token
   - `REPO_NAME` - Your GitHub username/repository (e.g., `yourusername/theboringdev`)

### 4. Redeploy After Setting Environment Variables
```
vercel --prod
```

## Troubleshooting

If the application is not visible after deployment:

1. Check that the build was successful in the Vercel Dashboard
2. Verify that all environment variables are correctly set
3. Check the function logs for any API errors
4. If needed, run `vercel logs` to troubleshoot issues

## Custom Domain (Optional)

To set up a custom domain:

1. Go to your project settings on the Vercel Dashboard
2. Navigate to the "Domains" section
3. Add your domain name and follow the provided instructions

## GitHub Actions Integration

To ensure the daily story generation works properly:

1. Configure GitHub Actions in your repository
2. Add the `GENERATE_TOKEN` secret to your GitHub repository settings
3. Update the API endpoint in the GitHub Actions workflow file (.github/workflows/schedule.yml) to match your deployed Vercel URL 