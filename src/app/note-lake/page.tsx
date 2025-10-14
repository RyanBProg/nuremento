import type { Metadata } from "next";
import { NoteLakeClient } from "./NoteLakeClient";

export const metadata: Metadata = {
  title: "Note Lake | Nuremento",
  description:
    "Visit the Note Lake to retrieve a single message from your past self each day, or add new notes to cast into the water.",
  openGraph: {
    title: "Note Lake | Nuremento",
    description:
      "Retrieve one mindful message per day and add new memories to your lake.",
  },
  twitter: {
    card: "summary",
    title: "Note Lake | Nuremento",
    description:
      "Retrieve one mindful message per day and cast new memories into the water.",
  },
};

export default function NoteLakePage() {
  return <NoteLakeClient />;
}
