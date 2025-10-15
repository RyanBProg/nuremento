import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

const aiToolsLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  prefix: "nuremento:ai-tools",
});

const memoriesLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(6, "1 h"),
  prefix: "nuremento:memories",
});

export async function checkAiToolsRateLimit(identifier: string) {
  return aiToolsLimiter.limit(identifier);
}

export async function checkMemoriesRateLimit(identifier: string) {
  return memoriesLimiter.limit(identifier);
}
