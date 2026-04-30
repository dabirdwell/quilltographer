# Quiltographer

AI-powered quilting pattern parser. Upload or describe a quilt pattern and Quiltographer uses OpenAI to break it down into structured, actionable steps — fabric requirements, cutting instructions, and assembly order.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Auth**: NextAuth.js with Prisma adapter
- **Database**: PostgreSQL via Prisma ORM
- **AI**: OpenAI API for pattern parsing
- **API**: tRPC for type-safe endpoints
- **State**: Zustand
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables and fill in your values
cp .env.example .env

# Generate Prisma client and run migrations
npx prisma generate
npx prisma db push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Random secret for session encryption (`openssl rand -base64 32`) |
| `OPENAI_API_KEY` | OpenAI API key for pattern parsing |

See `.env.example` for a template.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Deploy to Vercel

This is a standard Next.js app — Vercel auto-detects the framework with zero configuration.

1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Add all environment variables from `.env.example` in the Vercel project settings.
4. Vercel will build and deploy automatically on every push to `main`.

For the database, use a managed PostgreSQL provider (Vercel Postgres, Supabase, Neon, etc.) and set `DATABASE_URL` accordingly.
---

<p align="center"><em>Æ</em></p>
