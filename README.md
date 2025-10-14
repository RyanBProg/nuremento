# Nuremento

Mindful memory keeping for the modern web.

Nuremento is a full-stack Next.js application that helps people capture, revisit, and celebrate meaningful moments. It blends traditional journaling with playful experiences—floating messages in a note lake, sealing letters inside time capsules, and enhancing stories with AI-generated prose.

---

## Feature Highlights

- **Memories dashboard** – Log rich entries with titles, dates, moods, locations, and photos. Media uploads go to S3, and Sharp generates fast-loading thumbnails.
- **Time capsules** – Schedule future unlocks for letters to your future self. Capsules stay locked until their release date, at which point you can fetch and read the message.
- **Note Lake experience** – Drop notes into a serene lake and retrieve one mindful message per day.
- **AI writing assistant** – Refine a memory with a single click using Google’s Gemini API, ideal for portfolio demos of generative AI in a realistic workflow.
- **Authentication & personalization** – Clerk secures every flow. Signed-in users get a dashboard, while visitors can explore preview experiences on the marketing page.
- **Responsive, whimsical UI** – Built with Tailwind CSS v4, CSS Modules, and bespoke SVG/Canvas-inspired scenes to spotlight front-end craft.

---

## Tech Stack

**Frontend**

- Next.js 15 (App Router) + React 19 + Typescript
- Tailwind CSS v4, CSS Modules, Lucide icons

**Backend & APIs**

- Next.js Route Handlers for RESTful endpoints
- Drizzle ORM with Neon PostgreSQL
- Clerk for auth, sessions, and webhook syncing
- Google Generative AI (Gemini) for copy assistance

**Storage & Media Pipeline**

- AWS S3 for originals and thumbnails
- Sharp for server-side image resizing
- Deterministic daily note selection with Node crypto utilities

**Tooling**

- TypeScript 5, ESLint 9
- Drizzle Kit for migrations and database introspection
- npm scripts for a streamlined developer workflow

---

## Getting Started

1. **Install prerequisites**

   - Node.js 20+
   - npm 9+
   - An AWS S3 bucket with programmatic access
   - A Neon (or compatible Postgres) database
   - Clerk application (publishable + secret keys)
   - Google Gemini API key for the AI helper

2. **Clone & install**

   ```bash
   git clone https://github.com/your-username/nuremento.git
   cd ./nuremento
   npm install
   ```

3. **Configure environment**
   Create a `.env` file at the project root and populate the variables listed below.

4. **Apply database schema**

   ```bash
   npm run db:push
   ```

5. **Start the dev server**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) to explore the marketing site. Authenticated areas live under `/dashboard`.

---

## Environment Variables

| Variable                                              | Description                                           |
| ----------------------------------------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`                   | Clerk publishable key for frontend widgets.           |
| `CLERK_SECRET_KEY`                                    | Clerk secret key for server-side auth.                |
| `CLERK_SIGN_IN_URL` & `CLERK_SIGN_UP_URL`             | Auth route overrides (e.g., `/sign-in`).              |
| `CLERK_AFTER_SIGN_IN_URL` & `CLERK_AFTER_SIGN_UP_URL` | Post-auth redirects.                                  |
| `DATABASE_URL`                                        | Connection string for Neon/Postgres, used by Drizzle. |
| `AWS_REGION`                                          | Region that hosts your S3 bucket.                     |
| `AWS_BUCKET_NAME`                                     | S3 bucket where images are stored.                    |
| `AWS_USER_ACCESS_KEY` & `AWS_USER_SECRET_KEY`         | Credentials for uploads/thumbnails.                   |
| `GEMINI_API_KEY`                                      | (Optional) Enables the AI description helper.         |

---

## Database & Storage

- **Schema management** – Drizzle ORM defines tables for users, memories, time capsules, and lake notes (`src/db/schema.ts`).
- **Migrations** – Use `npm run db:generate` to emit SQL migrations or `npm run db:push` for direct schema sync during prototyping.
- **Storage pipeline** – Image uploads stream to S3 and generate thumbnail variants. Failed uploads trigger cleanup to avoid orphaned files.
- **Clerk webhooks** – `/api/webhooks/clerk` keeps the local `users` table in sync with Clerk events (create/update/delete).

---

## Development Scripts

| Script                | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `npm run dev`         | Start the Next.js development server.                |
| `npm run build`       | Create a production build.                           |
| `npm start`           | Serve the compiled build.                            |
| `npm run lint`        | Lint the project with ESLint.                        |
| `npm run db:generate` | Generate SQL migrations via Drizzle Kit.             |
| `npm run db:push`     | Apply the current schema to the configured database. |

---

## Project Structure

```
src/
├─ app/
│  ├─ page.tsx                # Marketing landing page
│  ├─ dashboard/              # Authenticated experiences
│  ├─ note-lake/              # Daily bottle reveal scene
│  └─ api/                    # Route handlers (memories, lake notes, capsules, AI)
├─ components/
│  ├─ memories/               # Lists, cards, filters
│  ├─ memory-form/            # Create/edit form + AI helper
│  ├─ time-capsule/           # Time capsule widgetry
│  └─ MessageModal.tsx        # Custom dialog note styling
├─ db/                        # Drizzle schema & client
├─ lib/                       # Utilities (S3 helpers, formatting)
└─ styles/                    # Tailwind + CSS modules
```

---

## Deployment Notes

- Run `npm run build` to generate the production bundle.
- Supply the same environment variables to your hosting provider (Vercel, AWS, custom VPS, etc.).
- Ensure the runtime has access to Node 20+, supports the Edge runtime where needed, and can reach Neon + S3.
- For portfolio demos, seed the database with a handful of memories, lake notes, and time capsules to showcase each flow.

---

Enjoy exploring Nuremento—and feel free to reach out with questions or ideas!
