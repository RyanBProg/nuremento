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
    <header className="sticky top-0 z-20 border-b /70 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="app-container flex min-h-[70px] items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold">
            Nm
          </span>
          <span className="text-base md:text-lg">Nuremento</span>
        </Link>

        <nav
          className="hidden items-center gap-6 text-sm md:flex"
          aria-label="Primary">
          <Link href="#features">Features</Link>
          <Link href="#how-it-works">How it works</Link>
          <Link href="#security">Security</Link>
        </nav>

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button
                type="button"
                className="rounded-full border border-transparent px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2">
                Create account
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="rounded-full border border-transparent px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2">
              Dashboard
            </Link>
            <UserButton showName afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
