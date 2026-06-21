# TikTok Post Organizer

A modern web app that analyzes your images and videos with AI to generate TikTok captions, hashtags, and content ideas.

## Features

- Drag-and-drop upload for images and videos
- AI-powered content analysis via OpenAI GPT-4o Vision
- Generated captions, hashtags, and follow-up content ideas
- One-click copy buttons for each section
- Mobile-first, TikTok-inspired UI with loading states

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure OpenAI API key

Copy the example env file and add your key:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
OPENAI_API_KEY=sk-your-key-here
```

Get an API key at [platform.openai.com](https://platform.openai.com/api-keys).

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS 4**
- **OpenAI API** (GPT-4o with vision)

## How It Works

1. Upload an image or video (drag-and-drop or tap to browse)
2. Click **Generate TikTok Content**
3. AI analyzes your media and returns a caption, hashtags, and content ideas
4. Copy any section with one click

Videos are analyzed by extracting a key frame and sending it to the vision model.

## Supported Formats

- **Images:** JPG, PNG, WebP, GIF
- **Videos:** MP4, WebM, MOV
- **Max file size:** 20MB
