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
            className="mr-2 flex items-center gap-2 font-semibold tracking-tight rounded-full px-4 py-1 transition hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2">
            <span className="text-xl sm:text-sm md:text-base font-bold">
              Nm
            </span>
            <span className="hidden sm:inline text-base md:text-lg">
              Nuremento
            </span>
          </Link>
          <Link href="/#features" className="hidden md:inline button-plain">
            Features
          </Link>
          <Link href="/#purpose" className="hidden md:inline button-plain">
            Purpose
          </Link>
          <Link href="/memory-ocean" className="hidden md:inline button-plain">
            Memory Ocean
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button type="button" className="button-filled">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button type="button" className="button-border">
                Create account
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link href="/dashboard" className="button-border mr-4">
              Dashboard
            </Link>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
