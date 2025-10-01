"use client";

import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border border-border-muted/70 bg-surface/95 p-8 text-center shadow-soft">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-text-primary">Create your memory space</h1>
          <p className="text-sm text-text-secondary">
            Set up your account and start capturing the moments that matter.
          </p>
        </div>
        <SignUp routing="hash" signInUrl="/sign-in" afterSignUpUrl="/dashboard" />
        <p className="text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-primary hover:text-primary-dark">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
