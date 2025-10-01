import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nuremento • Preserve the moments that matter",
  description:
    "Capture memories, weave stories, and revisit the moments that make you who you are.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#1d4ed8",
          colorText: "#0f172a",
          colorBackground: "#ffffff",
        },
      }}>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <div className="site-shell">
            <SiteHeader />
            <main className="site-main">{children}</main>
            <footer className="site-footer">
              <div className="app-container flex flex-wrap items-center gap-2 text-sm">
                <strong className="font-semibold text-text-primary">
                  Nuremento
                </strong>
                <span className="text-text-secondary">
                  Built for people who want their stories to stay vivid.
                </span>
              </div>
            </footer>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
