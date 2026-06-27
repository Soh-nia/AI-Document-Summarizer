# Summ — AI Document Summariser & Comparison Tool

> Summarise any document in seconds. Compare two documents to find what's similar, different, and what matters.

## What it does

**Single mode** — paste any text (article, report, contract, research paper) and get a structured summary:
- TL;DR (one sentence)
- Key points (3–6 bullets)
- Detailed breakdown (2–3 paragraphs)
- Action items (if any)
- Live word-count reduction bar showing % compression

**Compare mode** — paste two documents and get:
- Individual summary of each document
- Side-by-side comparison analysis
- What they agree on
- Key differences (formatted as a table)
- Which document is more complete/detailed
- Bottom line synthesis

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Google Gemini API (`gemini-2.5-flash`)
- Deployed on Vercel

## Getting started

```bash
git clone https://github.com/Soh-nia/AI-Document-Summarizer.git
cd summ
npm install
cp .env.example .env.local
# Add VITE_ANTHROPIC_API_KEY to .env.local
npm run dev
```

## Environment variables

```
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

## Prompt engineering

**Summary prompt** — structured output with fixed section headers (TL;DR, Key Points, Details, Action Items). Forces Claude to be specific — names, numbers, dates — and prohibits hallucination.

**Comparison prompt** — produces a markdown table for differences, structured sections for agreements, and a bottom-line synthesis. Instructs Claude to be analytical rather than descriptive.

## Deployment

```bash
npm run build
vercel --prod
```

## Planned features

- [ ] PDF upload support
- [ ] URL input (summarise web articles)
- [ ] Export summaries as PDF
- [ ] Multiple document comparison (3+)
- [ ] Summary length control (brief / standard / detailed)
- [ ] Ask questions about the document after summarising

## License

MIT
