/**
 * Simple in-memory rate limiter
 * Note: In a serverless environment like Vercel, this state is not shared across lambdas.
 * For production at scale, use Redis (e.g., Upstash) or a database.
 */

const rateLimitMap = new Map();

export function rateLimit({ interval, uniqueTokenPerInterval }) {
  return {
    check: (limit, token) => {
      const now = Date.now();
      const windowStart = now - interval;

      const tokenCount = rateLimitMap.get(token) || [];

      // Filter out old timestamps
      const validTimestamps = tokenCount.filter(
        (timestamp) => timestamp > windowStart
      );

      if (validTimestamps.length >= limit) {
        return false; // Rate limit exceeded
      }

      validTimestamps.push(now);
      rateLimitMap.set(token, validTimestamps);

      // Cleanup old entries periodically (simple garbage collection)
      if (rateLimitMap.size > uniqueTokenPerInterval) {
        const keysToDelete = [];
        for (const [key, timestamps] of rateLimitMap.entries()) {
          const valid = timestamps.filter((t) => t > windowStart);
          if (valid.length === 0) {
            keysToDelete.push(key);
          } else {
            rateLimitMap.set(key, valid);
          }
        }
        keysToDelete.forEach((k) => rateLimitMap.delete(k));
      }

      return true; // Request allowed
    },
  };
}
