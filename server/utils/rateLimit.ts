import type { H3Event } from "h3";

const tracker = new Map<string, { count: number; expiresAt: number }>();

export const checkRateLimit = (
  event: H3Event,
  { limit = 5, windowMs = 60000 }: { limit?: number; windowMs?: number },
) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || "127.0.0.1";
  const path = getRequestURL(event).pathname;
  const key = `${ip}:${path}`;
  const now = Date.now();

  const record = tracker.get(key);

  if (!record || now > record.expiresAt) {
    tracker.set(key, { count: 1, expiresAt: now + windowMs });
    return;
  }

  if (record.count >= limit) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too many requests. Please try again later.",
    });
  }

  record.count++;
};
