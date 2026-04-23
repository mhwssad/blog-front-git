/**
 * 限流工具类
 * 提供多种限流算法，适用于不同场景
 */

type AnyFunction = (this: any, ...args: any[]) => any
type DecoratedMethod = (this: any, ...args: any[]) => any

function assertPositiveNumber(value: number, message: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(message)
  }
}

function getDecoratorKey(instance: unknown, fallback: object): object {
  if ((typeof instance === 'object' && instance !== null) || typeof instance === 'function') {
    return instance as object
  }
  return fallback
}

/**
 * 限流结果接口
 */
export interface RateLimitResult {
  /** 是否允许通过 */
  allowed: boolean
  /** 剩余请求数 */
  remaining: number
  /** 重置时间戳（毫秒） */
  resetTime: number
  /** 等待时间（毫秒） */
  waitTime: number
}

/**
 * 固定窗口计数器限流器
 * 在固定时间窗口内限制请求数量
 */
export class FixedWindowRateLimiter {
  private readonly maxRequests: number
  private readonly windowMs: number
  private requests: number
  private windowStart: number

  constructor(maxRequests: number, windowMs: number) {
    assertPositiveNumber(maxRequests, '最大请求数必须大于0')
    assertPositiveNumber(windowMs, '时间窗口必须大于0')

    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.requests = 0
    this.windowStart = Date.now()
  }

  limit(): RateLimitResult {
    const now = Date.now()
    const elapsed = now - this.windowStart

    if (elapsed >= this.windowMs) {
      this.requests = 0
      this.windowStart = now
    }

    if (this.requests >= this.maxRequests) {
      const resetTime = this.windowStart + this.windowMs
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        waitTime: resetTime - now
      }
    }

    this.requests += 1
    return {
      allowed: true,
      remaining: this.maxRequests - this.requests,
      resetTime: this.windowStart + this.windowMs,
      waitTime: 0
    }
  }

  reset(): void {
    this.requests = 0
    this.windowStart = Date.now()
  }

  getCurrentRequests(): number {
    const now = Date.now()
    if (now - this.windowStart >= this.windowMs) {
      return 0
    }
    return this.requests
  }

  getRemainingRequests(): number {
    return Math.max(0, this.maxRequests - this.getCurrentRequests())
  }
}

/**
 * 滑动窗口计数器限流器
 * 使用滑动窗口提供更平滑的限流
 */
export class SlidingWindowRateLimiter {
  private readonly maxRequests: number
  private readonly windowMs: number
  private requests: number[]

  constructor(maxRequests: number, windowMs: number) {
    assertPositiveNumber(maxRequests, '最大请求数必须大于0')
    assertPositiveNumber(windowMs, '时间窗口必须大于0')

    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.requests = []
  }

  limit(): RateLimitResult {
    const now = Date.now()
    const windowStart = now - this.windowMs
    this.requests = this.requests.filter((time) => time > windowStart)

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0]
      if (oldestRequest === undefined) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: now + this.windowMs,
          waitTime: this.windowMs
        }
      }

      const resetTime = oldestRequest + this.windowMs
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        waitTime: Math.max(0, resetTime - now)
      }
    }

    this.requests.push(now)

    return {
      allowed: true,
      remaining: this.maxRequests - this.requests.length,
      resetTime: now + this.windowMs,
      waitTime: 0
    }
  }

  reset(): void {
    this.requests = []
  }

  getCurrentRequests(): number {
    const now = Date.now()
    const windowStart = now - this.windowMs
    return this.requests.filter((time) => time > windowStart).length
  }

  getRemainingRequests(): number {
    return Math.max(0, this.maxRequests - this.getCurrentRequests())
  }
}

/**
 * 令牌桶限流器
 * 允许短时突发流量，平滑处理请求
 */
export class TokenBucketRateLimiter {
  private readonly capacity: number
  private tokens: number
  private readonly refillRate: number
  private readonly refillMs: number
  private lastRefill: number

  constructor(capacity: number, refillRate: number, refillMs: number) {
    assertPositiveNumber(capacity, '桶容量必须大于0')
    assertPositiveNumber(refillRate, '补充速率必须大于0')
    assertPositiveNumber(refillMs, '补充间隔必须大于0')

    this.capacity = capacity
    this.tokens = capacity
    this.refillRate = refillRate
    this.refillMs = refillMs
    this.lastRefill = Date.now()
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    if (elapsed < this.refillMs) {
      return
    }

    const intervals = Math.floor(elapsed / this.refillMs)
    this.tokens = Math.min(this.capacity, this.tokens + intervals * this.refillRate)
    this.lastRefill += intervals * this.refillMs
  }

  limit(tokens = 1): RateLimitResult {
    assertPositiveNumber(tokens, '消耗令牌数必须大于0')
    this.refill()

    if (this.tokens < tokens) {
      const needed = tokens - this.tokens
      const refillIntervals = Math.ceil(needed / this.refillRate)
      const waitTime = refillIntervals * this.refillMs
      return {
        allowed: false,
        remaining: Math.floor(this.tokens),
        resetTime: this.lastRefill + waitTime,
        waitTime
      }
    }

    this.tokens -= tokens

    return {
      allowed: true,
      remaining: Math.floor(this.tokens),
      resetTime: this.lastRefill + this.refillMs,
      waitTime: 0
    }
  }

  reset(): void {
    this.tokens = this.capacity
    this.lastRefill = Date.now()
  }

  getTokens(): number {
    this.refill()
    return Math.floor(this.tokens)
  }

  addTokens(tokens: number): void {
    assertPositiveNumber(tokens, '添加令牌数必须大于0')
    this.refill()
    this.tokens = Math.min(this.capacity, this.tokens + tokens)
  }
}

/**
 * 漏桶限流器
 * 以恒定速率处理请求，平滑流量
 */
export class LeakyBucketRateLimiter {
  private readonly capacity: number
  private currentVolume: number
  private readonly leakRate: number
  private readonly leakMs: number
  private lastLeak: number

  constructor(capacity: number, leakRate: number, leakMs: number) {
    assertPositiveNumber(capacity, '桶容量必须大于0')
    assertPositiveNumber(leakRate, '漏出速率必须大于0')
    assertPositiveNumber(leakMs, '漏出间隔必须大于0')

    this.capacity = capacity
    this.currentVolume = 0
    this.leakRate = leakRate
    this.leakMs = leakMs
    this.lastLeak = Date.now()
  }

  private leak(): void {
    const now = Date.now()
    const elapsed = now - this.lastLeak
    if (elapsed < this.leakMs) {
      return
    }

    const intervals = Math.floor(elapsed / this.leakMs)
    this.currentVolume = Math.max(0, this.currentVolume - intervals * this.leakRate)
    this.lastLeak += intervals * this.leakMs
  }

  limit(volume = 1): RateLimitResult {
    assertPositiveNumber(volume, '添加体积必须大于0')
    this.leak()

    if (this.currentVolume + volume > this.capacity) {
      const overflow = this.currentVolume + volume - this.capacity
      const leakIntervals = Math.ceil(overflow / this.leakRate)
      const waitTime = leakIntervals * this.leakMs
      return {
        allowed: false,
        remaining: Math.max(0, this.capacity - this.currentVolume),
        resetTime: this.lastLeak + waitTime,
        waitTime
      }
    }

    this.currentVolume += volume

    return {
      allowed: true,
      remaining: Math.max(0, this.capacity - this.currentVolume),
      resetTime: this.lastLeak + this.leakMs,
      waitTime: 0
    }
  }

  reset(): void {
    this.currentVolume = 0
    this.lastLeak = Date.now()
  }

  getCurrentVolume(): number {
    this.leak()
    return this.currentVolume
  }

  getRemainingCapacity(): number {
    this.leak()
    return Math.max(0, this.capacity - this.currentVolume)
  }
}

/**
 * 节流函数类型
 */
export type ThrottledFunction<T extends AnyFunction> = ((
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => ReturnType<T> | undefined) & {
  cancel: () => void
  flush: () => ReturnType<T> | undefined
}

/**
 * 节流函数
 * 在指定时间间隔内最多执行一次函数
 */
export function throttle<T extends AnyFunction>(func: T, wait: number): ThrottledFunction<T> {
  assertPositiveNumber(wait, '等待时间必须大于0')

  let timeout: ReturnType<typeof setTimeout> | null = null
  let lastInvokeTime = 0
  let lastArgs: Parameters<T> | undefined
  let pendingInvoke: (() => ReturnType<T>) | undefined
  let result: ReturnType<T> | undefined

  const invoke = (time: number) => {
    lastInvokeTime = time
    const invokePending = pendingInvoke as () => ReturnType<T>
    lastArgs = undefined
    pendingInvoke = undefined
    result = invokePending()
    return result
  }

  const remainingWait = (time: number) => wait - (time - lastInvokeTime)

  const shouldInvoke = (time: number) => {
    if (lastInvokeTime === 0) {
      return true
    }

    const sinceLastInvoke = time - lastInvokeTime
    return sinceLastInvoke >= wait || sinceLastInvoke < 0
  }

  const timerExpired = () => {
    timeout = null
    if (!lastArgs) {
      return
    }

    const time = Date.now()
    if (shouldInvoke(time)) {
      invoke(time)
      return
    }

    timeout = setTimeout(timerExpired, remainingWait(time))
  }

  const throttled = function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const time = Date.now()
    lastArgs = args
    pendingInvoke = () => func.apply(this, args) as ReturnType<T>

    if (shouldInvoke(time)) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      return invoke(time)
    }

    if (!timeout) {
      timeout = setTimeout(timerExpired, remainingWait(time))
    }

    return result
  } as ThrottledFunction<T>

  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    lastInvokeTime = 0
    lastArgs = undefined
    pendingInvoke = undefined
  }

  throttled.flush = () => {
    if (!timeout || !lastArgs) {
      return result
    }

    clearTimeout(timeout)
    timeout = null
    return invoke(Date.now())
  }

  return throttled
}

/**
 * 防抖函数类型
 */
export type DebouncedFunction<T extends AnyFunction> = ((
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => ReturnType<T> | undefined) & {
  cancel: () => void
  flush: () => ReturnType<T> | undefined
  pending: () => boolean
}

/**
 * 防抖函数
 * 在函数停止调用指定时间后才执行
 */
export function debounce<T extends AnyFunction>(func: T, wait: number): DebouncedFunction<T> {
  assertPositiveNumber(wait, '等待时间必须大于0')

  let timeout: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | undefined
  let pendingInvoke: (() => ReturnType<T>) | undefined
  let result: ReturnType<T> | undefined

  const invoke = () => {
    const invokePending = pendingInvoke as () => ReturnType<T>
    lastArgs = undefined
    pendingInvoke = undefined
    result = invokePending()
    return result
  }

  const debounced = function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    lastArgs = args
    pendingInvoke = () => func.apply(this, args) as ReturnType<T>

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      timeout = null
      if (lastArgs) {
        invoke()
      }
    }, wait)

    return result
  } as DebouncedFunction<T>

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    lastArgs = undefined
    pendingInvoke = undefined
  }

  debounced.flush = () => {
    if (!timeout || !lastArgs) {
      return result
    }

    clearTimeout(timeout)
    timeout = null
    return invoke()
  }

  debounced.pending = () => timeout !== null

  return debounced
}

/**
 * 限流装饰器工厂函数
 * 用于类方法的限流
 */
export function rateLimit(maxRequests: number, windowMs: number) {
  assertPositiveNumber(maxRequests, '最大请求数必须大于0')
  assertPositiveNumber(windowMs, '时间窗口必须大于0')

  const limiters = new WeakMap<object, FixedWindowRateLimiter>()
  const fallbackKey = {}

  return function (_target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as DecoratedMethod
    if (typeof originalMethod !== 'function') {
      throw new TypeError(`@rateLimit 只能用于方法: ${propertyKey}`)
    }

    descriptor.value = function (this: unknown, ...args: unknown[]) {
      const key = getDecoratorKey(this, fallbackKey)
      let limiter = limiters.get(key)

      if (!limiter) {
        limiter = new FixedWindowRateLimiter(maxRequests, windowMs)
        limiters.set(key, limiter)
      }

      const result = limiter.limit()
      if (!result.allowed) {
        console.warn(`[RateLimit] ${propertyKey} 被限流，请等待 ${result.waitTime}ms`)
        return undefined
      }

      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

/**
 * 节流装饰器工厂函数
 * 用于类方法的节流
 */
export function throttleDecorator(wait: number) {
  assertPositiveNumber(wait, '等待时间必须大于0')

  const instances = new WeakMap<object, ThrottledFunction<DecoratedMethod>>()
  const fallbackKey = {}

  return function (_target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as DecoratedMethod
    if (typeof originalMethod !== 'function') {
      throw new TypeError(`@throttleDecorator 只能用于方法: ${propertyKey}`)
    }

    descriptor.value = function (this: unknown, ...args: unknown[]) {
      const key = getDecoratorKey(this, fallbackKey)
      let wrapped = instances.get(key)

      if (!wrapped) {
        wrapped = throttle(function (this: unknown, ...innerArgs: unknown[]) {
          return originalMethod.apply(this, innerArgs)
        }, wait)
        instances.set(key, wrapped)
      }

      return wrapped.apply(this, args)
    }

    return descriptor
  }
}

/**
 * 防抖装饰器工厂函数
 * 用于类方法的防抖
 */
export function debounceDecorator(wait: number) {
  assertPositiveNumber(wait, '等待时间必须大于0')

  const instances = new WeakMap<object, DebouncedFunction<DecoratedMethod>>()
  const fallbackKey = {}

  return function (_target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as DecoratedMethod
    if (typeof originalMethod !== 'function') {
      throw new TypeError(`@debounceDecorator 只能用于方法: ${propertyKey}`)
    }

    descriptor.value = function (this: unknown, ...args: unknown[]) {
      const key = getDecoratorKey(this, fallbackKey)
      let wrapped = instances.get(key)

      if (!wrapped) {
        wrapped = debounce(function (this: unknown, ...innerArgs: unknown[]) {
          return originalMethod.apply(this, innerArgs)
        }, wait)
        instances.set(key, wrapped)
      }

      return wrapped.apply(this, args)
    }

    return descriptor
  }
}

// 导出默认实例
export default {
  FixedWindowRateLimiter,
  SlidingWindowRateLimiter,
  TokenBucketRateLimiter,
  LeakyBucketRateLimiter,
  throttle,
  debounce,
  rateLimit,
  throttleDecorator,
  debounceDecorator
}
