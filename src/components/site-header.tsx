"use client";

import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border-muted/70 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="app-container flex min-h-[70px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-text-primary">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-soft to-primary text-sm font-bold text-primary-foreground shadow-soft">
            Nm
          </span>
          <span className="text-base md:text-lg">Nuremento</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-text-secondary md:flex" aria-label="Primary">
          <Link className="transition hover:text-text-primary" href="#features">
            Features
          </Link>
          <Link className="transition hover:text-text-primary" href="#how-it-works">
            How it works
          </Link>
          <Link className="transition hover:text-text-primary" href="#security">
            Security
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button
                type="button"
                className="rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-text-secondary transition hover:border-border-muted hover:bg-primary-soft/10 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="rounded-full bg-gradient-to-r from-primary-soft to-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:from-primary hover:to-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Create account
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-text-secondary transition hover:border-border-muted hover:bg-primary-soft/10 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Dashboard
            </Link>
            <UserButton showName afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
