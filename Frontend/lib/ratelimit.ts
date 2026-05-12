/**
 * Rate limiting using Upstash Redis
 * Environment variables needed:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Fallback in-memory rate limit if Redis not configured
const inMemoryLimits = new Map<string, { count: number; resetTime: number }>();

async function redisCall(command: string[], isWrite = false): Promise<any> {
  if (!REDIS_URL || !REDIS_TOKEN) {
    return null;
  }

  try {
    const response = await fetch(REDIS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command }),
    });

    if (!response.ok) {
      console.error('Redis error:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return null;
  }
}

export async function rateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();

  // Try Redis first
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      const result = await redisCall(['GET', key]);
      let data = result ? JSON.parse(result) : null;

      if (!data || data.resetTime < now) {
        // New window
        data = { count: 1, resetTime: now + windowSeconds * 1000 };
      } else if (data.count >= limit) {
        // Rate limited
        return {
          success: false,
          remaining: 0,
          resetTime: data.resetTime,
        };
      } else {
        // Increment
        data.count += 1;
      }

      await redisCall(['SET', key, JSON.stringify(data), 'EX', String(windowSeconds + 1)], true);

      return {
        success: true,
        remaining: Math.max(0, limit - data.count),
        resetTime: data.resetTime,
      };
    } catch (error) {
      console.error('Redis rate limit failed, falling back to memory:', error);
    }
  }

  // Fallback: in-memory rate limiting
  let data = inMemoryLimits.get(key);

  if (!data || data.resetTime < now) {
    data = { count: 1, resetTime: now + windowSeconds * 1000 };
  } else if (data.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: data.resetTime,
    };
  } else {
    data.count += 1;
  }

  inMemoryLimits.set(key, data);

  // Clean up old entries
  if (inMemoryLimits.size > 10000) {
    for (const [k, v] of inMemoryLimits.entries()) {
      if (v.resetTime < now) {
        inMemoryLimits.delete(k);
      }
    }
  }

  return {
    success: true,
    remaining: Math.max(0, limit - data.count),
    resetTime: data.resetTime,
  };
}

/**
 * Specific rate limiters for different endpoints
 */
export const rateLimiters = {
  // 10 requests per minute
  generateQuestion: (userId: string) => rateLimit(`question:${userId}`, 10, 60),

  // 5 requests per minute
  evaluateAnswer: (userId: string) => rateLimit(`evaluate:${userId}`, 5, 60),

  // 3 requests per day
  uploadResume: (userId: string) => rateLimit(`resume:${userId}`, 3, 86400),

  // 20 requests per minute per IP
  publicEndpoint: (ip: string) => rateLimit(`ip:${ip}`, 20, 60),
};
