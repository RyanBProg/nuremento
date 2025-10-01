# Nuremento

A Next.js application for capturing and revisiting meaningful memories. Users can sign up, sign in, and explore a protected dashboard that surfaces highlighted moments and quick actions for building a personal archive.

## Prerequisites

- Node.js 18.18 or newer (recommended to avoid engine warnings)
- npm 9+
- Clerk account with publishable and secret keys

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file (already scaffolded with placeholders) and add your Clerk keys:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key
   CLERK_SECRET_KEY=sk_live_your_key
   CLERK_SIGN_IN_URL=/sign-in
   CLERK_SIGN_UP_URL=/sign-up
   CLERK_AFTER_SIGN_IN_URL=/dashboard
   CLERK_AFTER_SIGN_UP_URL=/dashboard
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view the landing page.

## Project Structure

- `src/app/page.tsx` – Marketing landing page with feature highlights.
- `src/app/(auth)/sign-in` and `src/app/(auth)/sign-up` – Clerk-hosted auth flows.
- `src/app/dashboard` – Protected dashboard that requires authentication.
- `src/middleware.ts` – Clerk middleware enforcing protection for authenticated routes.
- `src/components/site-header.tsx` – Global navigation with adaptive auth controls.
- `src/app/globals.css` & `tailwind.config.ts` – Tailwind CSS setup and design tokens.

## Authentication

Clerk handles sign-in, sign-up, session management, and sign-out. The dashboard route is protected via middleware, and authenticated users see a user menu with profile and sign-out actions.

## Scripts

- `npm run dev` – Start the Next.js development server.
- `npm run build` – Create an optimized production build.
- `npm start` – Run the production build.
- `npm run lint` – Lint the project with ESLint.

## Deployment

When deploying (e.g., to Vercel), remember to configure the same Clerk environment variables in your hosting provider.
