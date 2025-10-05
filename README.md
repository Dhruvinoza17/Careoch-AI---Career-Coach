# AI Career Coach – Resume Builder & Cover Letters

A full‑stack Next.js application that helps users build standout resumes and AI‑powered cover letters. It includes a structured resume editor with markdown preview/PDF export, “Improve with AI” suggestions, and a cover‑letter workflow with history and detail views – all backed by Prisma and Clerk authentication.

## Tech Stack
- Next.js (App Router)
- React, React Hook Form, Zod
- Tailwind CSS + shadcn/ui components
- Prisma ORM (PostgreSQL or any Prisma‑supported DB)
- Clerk for authentication
- Google Generative AI (Gemini) for content improvements
- html2pdf.js + html2canvas for PDF export

## Features (Highlights)
- Resume builder with sections:
  - Contact Info, Summary, Skills, Experience, Education, Projects
  - Live Markdown preview and downloadable PDF (A4)
  - Clickable links in PDFs (mailto/tel/LinkedIn/GitHub)
- “Improve with AI”
  - One‑click enhancements for Summary, Skills, and entry descriptions
  - Industry‑aware prompts using stored user data
- Cover letters
  - Generate cover letters with Gemini
  - List view with delete, detail page with markdown preview
  - Safe routing for missing ids and user isolation
- Account & data
  - Clerk user auth
  - Prisma models for users, resumes, and cover letters
- DX
  - Zod validation, toasts, clean UX, responsive layout

## Project Structure (Important Paths)
- `app/(main)/resume/_components/` – Resume UI (builder, entry form)
- `app/(main)/ai-cover-letter/` – Cover letter list, generator, detail page
- `actions/` – Server actions (`resume.js`, `cover-letter.js`)
- `app/lib/` – Schemas and helpers
- `components/ui/` – shadcn/ui primitives
- `prisma/` – Prisma schema and migrations

## Prerequisites
- Node.js 18+
- A PostgreSQL database (or Prisma‑compatible DB)
- Clerk account + keys
- Google Generative AI API key (Gemini)

## Environment Variables
Create an `.env` (or `.env.local`) file at the project root. Use `env.example` as reference.

Required keys:
- `DATABASE_URL` – Prisma connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `GEMINI_API_KEY` – Google Generative AI key

Optional:
- Any additional Next.js/Clerk settings you use

## Install & Run
```bash
# 1) Install deps
npm install

# 2) Set up database (adjust as needed)
npx prisma migrate deploy
# or for dev: npx prisma migrate dev

# 3) Generate Prisma client (usually done by migrate)
npx prisma generate

# 4) Start the dev server
npm run dev
```
The app should be available at http://localhost:3000.

## Development Scripts
```bash
# Start dev server
npm run dev

# Lint
npm run lint

# Build
npm run build

# Start production server (after build)
npm start

# Prisma
npx prisma studio         # Browse DB
npx prisma migrate dev    # Dev migrations
```

## Usage Overview
- Resume
  - Go to `/resume`, add entries in each section, preview markdown, and download PDF.
  - Use “Improve with AI” buttons on summary/skills and inside entry descriptions.
  - Save persists the combined markdown into the database.
- Cover Letters
  - Go to `/ai-cover-letter` to see your list.
  - Click “Create New” to generate a letter. You’ll be redirected to the detail page.
  - Delete from the list when no longer needed.

## Notes & Gotchas
- PDF Generation
  - The app renders a hidden off‑screen markdown container for robust html2canvas snapshots.
  - Links (mailto/tel/LinkedIn/GitHub) are rendered as clickable in the PDF.
- Hydration
  - The cover‑letter generator is rendered as a Client Component to avoid hydration issues.
- Security
  - All server actions check Clerk auth and scope queries by `userId`.

## Roadmap Ideas
- More resume templates and layouts
- Export to DOCX
- Versioning for resumes and cover letters
- Richer prompts and tuning per industry/role

## Contributing
PRs are welcome! If you find a bug or want to propose a feature:
1. Fork this repo
2. Create a feature branch
3. Open a PR with a clear description

## License
MIT
