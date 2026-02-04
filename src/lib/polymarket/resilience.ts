/**
 * Resilience Layer
 * Circuit breaker pattern and fallback strategies
 */

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  threshold: number;      // Number of failures before opening
  timeout: number;        // Time in ms before attempting recovery
  name: string;           // Name for logging
}

/**
 * Circuit Breaker implementation
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private state: CircuitState = 'CLOSED';
  private readonly config: CircuitBreakerConfig;
  
  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      threshold: config.threshold ?? 3,
      timeout: config.timeout ?? 30000,
      name: config.name ?? 'default',
    };
  }
  
  /**
   * Execute a function with circuit breaker protection
   */
  async call<T>(
    fn: () => Promise<T>,
    fallback: () => T | Promise<T>
  ): Promise<T> {
    // Check if circuit is open
    if (this.state === 'OPEN') {
      // Check if timeout has passed
      if (Date.now() - this.lastFailure > this.config.timeout) {
        this.state = 'HALF_OPEN';
        console.log(`[CircuitBreaker:${this.config.name}] Attempting recovery (HALF_OPEN)`);
      } else {
        console.warn(`[CircuitBreaker:${this.config.name}] Circuit OPEN, returning fallback`);
        return fallback();
      }
    }
    
    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure(error);
      return fallback();
    }
  }
  
  private recordFailure(error: unknown): void {
    this.failures++;
    this.lastFailure = Date.now();
    
    console.error(`[CircuitBreaker:${this.config.name}] Failure ${this.failures}/${this.config.threshold}:`, error);
    
    if (this.failures >= this.config.threshold) {
      this.state = 'OPEN';
      console.warn(`[CircuitBreaker:${this.config.name}] Circuit OPENED after ${this.failures} failures`);
    }
  }
  
  private reset(): void {
    if (this.state === 'HALF_OPEN') {
      console.log(`[CircuitBreaker:${this.config.name}] Recovery successful, circuit CLOSED`);
    }
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  getState(): CircuitState {
    return this.state;
  }
  
  getFailures(): number {
    return this.failures;
  }
}

// Pre-configured circuit breakers for each API
export const gammaCircuitBreaker = new CircuitBreaker({
  threshold: 3,
  timeout: 30000,
  name: 'Gamma',
});

export const clobCircuitBreaker = new CircuitBreaker({
  threshold: 3,
  timeout: 30000,
  name: 'CLOB',
});

export const openaiCircuitBreaker = new CircuitBreaker({
  threshold: 2,
  timeout: 60000,
  name: 'OpenAI',
});

export const redisCircuitBreaker = new CircuitBreaker({
  threshold: 5,
  timeout: 10000,
  name: 'Redis',
});

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000 } = options;
  
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) break;
      
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      console.warn(`[Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Execute with timeout
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  fallback?: () => T | Promise<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (fallback) {
        Promise.resolve(fallback()).then(resolve).catch(reject);
      } else {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }
    }, timeoutMs);
    
    fn()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        if (fallback) {
          Promise.resolve(fallback()).then(resolve).catch(reject);
        } else {
          reject(error);
        }
      });
  });
}

/**
 * Rate limiter (token bucket algorithm)
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  
  constructor(
    private readonly maxTokens: number,
    private readonly refillRate: number // tokens per second
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }
  
  async acquire(): Promise<boolean> {
    this.refill();
    
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    
    return false;
  }
  
  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const newTokens = elapsed * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
    this.lastRefill = now;
  }
}

// API rate limiters
export const gammaRateLimiter = new RateLimiter(10, 2);  // 10 requests, 2/sec refill
export const clobRateLimiter = new RateLimiter(20, 5);   // 20 requests, 5/sec refill
export const openaiRateLimiter = new RateLimiter(3, 0.2); // 3 requests, 1 per 5 sec
