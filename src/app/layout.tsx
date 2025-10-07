import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";

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
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: "#000",
          colorText: "#0f172a",
          colorBackground: "#fff",
          borderRadius: "1px",
          colorBorder: "#000",
        },
      }}>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col`}>
          <div className="site-shell">
            <SiteHeader />
            <main className="flex-1 flex flex-col">{children}</main>
            <footer className="border-t py-12 text-sm px-4 xs:px-8">
              <div className="mx-auto max-w-6xl flex flex-col justify-center items-center gap-4 text-sm">
                <p className="text-center">
                  <strong className="font-semibold mr-2">Nuremento</strong>
                  <span>
                    Built for people who want their stories to stay vivid.
                  </span>
                </p>
                <span className="text-center">
                  &copy; {new Date().getFullYear()} Nuremento. All rights
                  reserved.
                </span>
              </div>
            </footer>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
