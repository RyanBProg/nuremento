"use client";

import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border border-border-muted/70 bg-surface/95 p-8 text-center shadow-soft">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-text-primary">Welcome back</h1>
          <p className="text-sm text-text-secondary">
            Sign in to continue building your living memory archive.
          </p>
        </div>
        <SignIn routing="hash" signUpUrl="/sign-up" afterSignInUrl="/dashboard" />
        <p className="text-sm text-text-secondary">
          New here?{" "}
          <Link href="/sign-up" className="font-semibold text-primary hover:text-primary-dark">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
