# Boring Stories Collection

This directory contains all the generated boring stories from "The Boring Dev" story generator. Stories are automatically saved here when generated through the application.

## File Structure

The stories follow this naming convention:
```
YYYY-MM-DD-category-title-slug.md
```

For example:
```
2025-03-31-tech-another-framework-nobody-asked-for.md
2025-03-31-design-the-inevitable-return-of-skeuomorphism.md
2025-03-31-life-the-art-of-pretending-to-work-from-home.md
```

## Categories

Stories are categorized into three main topics:

1. **Tech** (💻) - Mundane or over-discussed tech trends
2. **Design** (🎨) - Outdated trends, design system drama, or designer fatigue
3. **Life** (🌿) - Remote work struggles, mundane routines, or productivity myths

## Story Format

Each story is saved as a Markdown file with the following structure:

```markdown
# Title of the Boring Story

Content of the story with a dry, mildly sarcastic, yet clever tone...

Based on current news headlines in the category.
```

## Usage

These stories are meant to be published on [theboringdev.com](https://theboringdev.com) and can be automatically processed by any static site generator that supports Markdown.

## Automation

New stories are generated:
1. On-demand through the web interface
2. Automatically every day at 3PM UTC via GitHub Actions 