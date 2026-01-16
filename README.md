DriverRate Next.js MVP
======================

What's included:
- Next.js app with:
  - Authentication (register/login) using cookies + JWT
  - Driver creation (dashboard)
  - File upload endpoint (stores under public/uploads)
  - Public driver profile pages (SSR)
  - SQLite DB using better-sqlite3

Run locally:
1. Install dependencies
   npm install

2. Run dev server
   npm run dev

Notes:
- The app creates a SQLite DB file at the project root: driverrate.sqlite
- For uploads, POST multipart to /api/uploads (field name "file"). Files are stored in /public/uploads.
- JWT secret: set env var JWT_SECRET for security. For local dev defaults to a dev secret.
- NEXT_PUBLIC_ORIGIN can be set when using SSR profile pages (e.g., http://localhost:3000)

Security & next steps:
- Add server-side auth checks for dashboard pages (currently client-side)
- Add rate-limiting & spam prevention
- Add email verification / magic link
- Move uploads to S3/Supabase in production
- Replace bcrypt sync calls with async variants for performance

