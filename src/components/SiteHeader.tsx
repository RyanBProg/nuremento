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
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="px-4 xs:px-8 mx-auto max-w-6xl flex min-h-[70px] items-center justify-between gap-4">
        <nav className="flex gap-2 items-center text-sm" aria-label="Primary">
          <Link
            href="/"
            className="mr-2 flex items-center gap-2 button button-plain tracking-tight px-4 py-1">
            <span className="text-xl sm:text-sm md:text-base font-bold">
              Nm
            </span>
            <span className="hidden sm:inline text-base md:text-lg">
              Nuremento
            </span>
          </Link>

          <SignedIn>
            <Link
              href="/dashboard/memories"
              className="hidden md:inline button button-plain">
              My Memories
            </Link>
            <Link
              href="/memory-lake"
              className="hidden md:inline button button-plain">
              Memory Lake
            </Link>
          </SignedIn>
          <SignedOut>
            <Link
              href="/#features"
              className="hidden md:inline button button-plain">
              Features
            </Link>
            <Link
              href="/#purpose"
              className="hidden md:inline button button-plain">
              Purpose
            </Link>
          </SignedOut>
        </nav>

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button type="button" className="button button-filled">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button type="button" className="button button-border">
                Create account
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link href="/dashboard" className="button button-border mr-4">
              Dashboard
            </Link>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
