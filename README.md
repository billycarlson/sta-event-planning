# Stay Event Planning - Minimal Scaffold

This repository contains a minimal Next.js + Express + PostgreSQL scaffold for event planning with Google Drive media integration planned. A dashboard on the home page lets you filter events by date range and category.

Quick start

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `BASIC_PASSWORD` and Google credentials when ready.
2. Install dependencies:

```bash
npm install
```

If the dev server complains about missing packages such as `express`, run `npm install` again to ensure all dependencies are installed.

3. Create database and run migrations:

```bash
# Example (for local Postgres)
export DATABASE_URL=postgres://user:pass@localhost:5432/stay
npm run migrate
```

4. Start dev server:

```bash
npm run dev
```

Notes

- Authentication is a simple password cookie for demo purposes. Replace with proper auth for production.
- Google Drive integration is scaffolded as API endpoints; to enable uploads add service account / OAuth2 code and set environment vars.
