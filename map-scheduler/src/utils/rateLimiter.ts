/**
 * Rate limiter to prevent API abuse and infinite loops
 */

interface RateLimitConfig {
  maxCalls: number;
  windowMs: number;
}

class RateLimiter {
  private calls: Map<string, number[]> = new Map();
  
  canMakeCall(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const calls = this.calls.get(key) || [];
    
    // Remove calls outside the time window
    const recentCalls = calls.filter(time => now - time < config.windowMs);
    
    if (recentCalls.length >= config.maxCalls) {
      console.error(`[RateLimiter] Rate limit exceeded for ${key}: ${recentCalls.length} calls in ${config.windowMs}ms`);
      return false;
    }
    
    recentCalls.push(now);
    this.calls.set(key, recentCalls);
    return true;
  }
  
  reset(key: string) {
    this.calls.delete(key);
  }
  
  resetAll() {
    this.calls.clear();
  }
}

export const rateLimiter = new RateLimiter();

// Specific limits for different operations
export const RATE_LIMITS = {
  // Max 5 reads per second per rep
  READ_APPOINTMENTS: { maxCalls: 5, windowMs: 1000 },
  // Max 1 write per second
  WRITE_APPOINTMENT: { maxCalls: 1, windowMs: 1000 },
  // Max 10 reads total per 10 seconds
  TOTAL_READS: { maxCalls: 10, windowMs: 10000 },
};
