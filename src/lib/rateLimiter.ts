// src/lib/rateLimiter.ts
import { RateLimiterMemory } from 'rate-limiter-flexible';

// IP 기반 Rate Limiter
// 1시간에 3번만 허용
const rateLimiter = new RateLimiterMemory({
  points: 3, // 허용 횟수
  duration: 60 * 60, // 1시간 (초 단위)
  blockDuration: 60 * 60, // 차단 시간: 1시간
});

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    await rateLimiter.consume(ip);
    return { allowed: true };
  } catch (rejRes: any) {
    const retryAfter = Math.round(rejRes.msBeforeNext / 1000) || 1;
    return { 
      allowed: false, 
      retryAfter 
    };
  }
}

// 폼 제출 시도 Rate Limiter (더 엄격)
// 5분에 1번만 허용
const submissionLimiter = new RateLimiterMemory({
  points: 1,
  duration: 5 * 60, // 5분
  blockDuration: 15 * 60, // 15분 차단
});

export async function checkSubmissionLimit(ip: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    await submissionLimiter.consume(ip);
    return { allowed: true };
  } catch (rejRes: any) {
    const retryAfter = Math.round(rejRes.msBeforeNext / 1000) || 1;
    return { 
      allowed: false, 
      retryAfter 
    };
  }
}