import type { Metadata } from "next";
import { MemoryOceanExperience } from "./MemoryOceanExperience";

export const metadata: Metadata = {
  title: "Memory Ocean • Messages adrift",
  description:
    "Set your memories afloat and rediscover the ones meant to return. A calming shoreline for reflective journaling.",
};

export default function MemoryOceanPage() {
  return <MemoryOceanExperience />;
}
