# Prompt Architect

A web-based prompt proxy that wraps user input with system personas and hidden developer rules before sending it to OpenAI's Chat Completion API with dynamic temperature control.

Built for **GenAI — Theories & Practices**, Spring 2026.

## How to Run

**Prerequisites:** [Node.js](https://nodejs.org/) v18+ and an OpenAI API key.

```bash
git clone https://github.com/donovanbonner/Assignment-2---Prompt-Architect.git
cd Assignment-2---Prompt-Architect
npm install
cp .env.example .env
```

Open `.env` and paste your API key:

```
VITE_OPENAI_API_KEY=sk-your-key-here
```

Start the app:

```bash
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173`).

## Project Files

| File            | Purpose                                                        |
|-----------------|----------------------------------------------------------------|
| `index.html`    | Single-page UI — persona dropdown, textarea, slider, result card |
| `style.css`     | shadcn/ui-inspired styling with dark/light mode                  |
| `main.js`       | Prompt assembly, OpenAI API call, loading/error states           |
| `config.js`     | 8 persona definitions and hardcoded developer rules              |
| `markdown.js`   | Lightweight markdown-to-HTML renderer for responses              |
| `.env.example`  | Template for the required `VITE_OPENAI_API_KEY` variable         |
