import { isIP } from "node:net";
import { readJsonObject } from "./request-json";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  backend: "upstash" | "memory";
}

const MAX_MEMORY_KEYS = 10_000;
const rateState = globalThis as typeof globalThis & {
  pricePulseRateState?: {
    buckets: Map<string, { count: number; resetAt: number }>;
    nextCleanup: number;
  };
};
const memory = rateState.pricePulseRateState ??= { buckets: new Map(), nextCleanup: 0 };

function checkMemory(key: string, limit: number, window: number): RateLimitResult {
  const now = Math.floor(Date.now() / 1000);
  const { buckets } = memory;
  if (now >= memory.nextCleanup) {
    for (const [id, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(id);
    memory.nextCleanup = now + 60;
  }

  const bucketKey = buckets.size >= MAX_MEMORY_KEYS && !buckets.has(key) ? "overflow" : key;
  let bucket = buckets.get(bucketKey);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + window };
    buckets.set(bucketKey, bucket);
  }
  const allowed = bucket.count < limit;
  if (allowed) bucket.count++;
  return { allowed, limit, remaining: limit - bucket.count, resetAt: bucket.resetAt, backend: "memory" };
}

// The counter and expiration are initialized in the same Redis operation.
const INCREMENT = `
  local count = redis.call('INCR', KEYS[1])
  if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
  return {count, redis.call('TTL', KEYS[1])}
`;

async function checkUpstash(key: string, limit: number, window: number, url: string, token: string) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["EVAL", INCREMENT, 1, `rl:pricepulse:v2:${key}`, window]),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(1_200),
    });
    if (!response.ok) {
      void response.body?.cancel().catch(() => {});
      return null;
    }
    const { result, error } = await readJsonObject(response, 2_048);
    if (error || !Array.isArray(result)) return null;
    const [count, ttl] = result;
    if (!Number.isSafeInteger(count) || count < 1 || !Number.isInteger(ttl) || ttl < 0 || ttl > window) {
      return null;
    }
    return {
      allowed: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      resetAt: Math.floor(Date.now() / 1000) + Math.max(1, ttl),
      backend: "upstash",
    } as const;
  } catch {
    return null;
  }
}

export function extractClientIp(request: Request): string {
  // Vercel sets this header at its edge. Local deployments use a shared bucket.
  const ip = process.env.VERCEL === "1"
    ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() || ""
    : "";
  const family = isIP(ip);
  if (family === 4) return ip;
  if (family === 6 && !ip.includes("%")) return new URL(`http://[${ip}]/`).hostname;
  return "unknown";
}

export async function enforceRateLimit(
  key: string,
  limit = 5,
  window = 3600,
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/+$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (url && token) {
    const result = await checkUpstash(key, limit, window, url, token);
    if (result) {
      if (result.allowed) checkMemory(key, limit, window);
      return result;
    }
  }
  return checkMemory(key, limit, window);
}
