/**
 * 定时任务工具类
 * 提供延迟执行、间隔执行等定时任务管理功能
 */

/**
 * 定时任务类型
 */
export enum ScheduleType {
  /** 一次性任务 */
  ONCE = 'once',
  /** 重复任务 */
  INTERVAL = 'interval',
  /** 延迟任务（一次性） */
  DELAY = 'delay'
}

/**
 * 定时任务配置
 */
export interface ScheduleOptions {
  /** 任务类型 */
  type?: ScheduleType
  /** 延迟时间（毫秒） */
  delay?: number
  /** 间隔时间（毫秒） */
  interval?: number
  /** 执行次数（仅对重复任务有效，-1 表示无限次） */
  times?: number
  /** 是否立即执行第一次（仅对重复任务有效） */
  immediate?: boolean
  /** 任务名称 */
  name?: string
  /** 错误回调 */
  onError?: (error: Error) => void
  /** 完成回调（仅对有限次重复任务有效） */
  onComplete?: () => void
}

/**
 * 定时任务信息
 */
export interface ScheduleTask {
  /** 任务ID */
  id: string
  /** 任务名称 */
  name: string
  /** 任务类型 */
  type: ScheduleType
  /** 任务回调 */
  callback: () => void | Promise<void>
  /** 定时器ID */
  timerId: number | null
  /** 已执行次数 */
  executedCount: number
  /** 总执行次数（-1 表示无限次） */
  totalTimes: number
  /** 间隔时间（毫秒） */
  interval: number
  /** 是否正在运行 */
  isRunning: boolean
  /** 创建时间 */
  createdAt: number
  /** 下次执行时间 */
  nextExecuteAt: number | null
  /** 错误回调 */
  onError?: (error: Error) => void
  /** 完成回调 */
  onComplete?: () => void
}

/**
 * 定时任务管理器
 */
class ScheduleManager {
  /** 存储所有任务 */
  private tasks: Map<string, ScheduleTask> = new Map()
  /** 任务计数器 */
  private counter: number = 0

  /**
   * 生成唯一任务ID
   */
  private generateId(): string {
    return `task_${Date.now()}_${++this.counter}`
  }

  /**
   * 添加一次性延迟任务
   * @param callback 任务回调
   * @param delay 延迟时间（毫秒）
   * @param options 配置选项
   * @returns 任务ID
   */
  delay(
    callback: () => void | Promise<void>,
    delay: number,
    options: ScheduleOptions = {}
  ): string {
    const taskId = this.generateId()
    const task: ScheduleTask = {
      id: taskId,
      name: options.name || `DelayTask_${taskId}`,
      type: ScheduleType.DELAY,
      callback,
      timerId: null,
      executedCount: 0,
      totalTimes: 1,
      interval: delay,
      isRunning: false,
      createdAt: Date.now(),
      nextExecuteAt: Date.now() + delay,
      onError: options.onError
    }

    this.tasks.set(taskId, task)

    const timerId = window.setTimeout(async () => {
      await this.executeTask(taskId)
    }, delay)

    task.timerId = timerId
    task.isRunning = true

    return taskId
  }

  /**
   * 添加间隔任务
   * @param callback 任务回调
   * @param interval 间隔时间（毫秒）
   * @param options 配置选项
   * @returns 任务ID
   */
  interval(
    callback: () => void | Promise<void>,
    interval: number,
    options: ScheduleOptions = {}
  ): string {
    const taskId = this.generateId()
    const task: ScheduleTask = {
      id: taskId,
      name: options.name || `IntervalTask_${taskId}`,
      type: ScheduleType.INTERVAL,
      callback,
      timerId: null,
      executedCount: 0,
      totalTimes: options.times ?? -1,
      interval,
      isRunning: false,
      createdAt: Date.now(),
      nextExecuteAt: options.immediate ? Date.now() : Date.now() + interval,
      onError: options.onError,
      onComplete: options.onComplete
    }

    this.tasks.set(taskId, task)

    if (options.immediate) {
      // 立即执行第一次
      this.executeTask(taskId).then(() => {
        // 设置定时器
        const timerId = window.setInterval(async () => {
          await this.executeTask(taskId)
        }, interval)
        task.timerId = timerId
        task.isRunning = true
        task.nextExecuteAt = Date.now() + interval
      })
    } else {
      const timerId = window.setInterval(async () => {
        await this.executeTask(taskId)
      }, interval)
      task.timerId = timerId
      task.isRunning = true
    }

    return taskId
  }

  /**
   * 执行任务
   * @param taskId 任务ID
   */
  private async executeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task || !task.isRunning) {
      return
    }

    try {
      await task.callback()
      task.executedCount++

      // 更新下次执行时间
      if (task.type === ScheduleType.INTERVAL && task.totalTimes > 0) {
        task.nextExecuteAt = Date.now() + task.interval
      }

      // 检查是否达到执行次数限制
      if (
        task.type === ScheduleType.INTERVAL &&
        task.totalTimes > 0 &&
        task.executedCount >= task.totalTimes
      ) {
        this.stopTask(taskId)
        if (task.onComplete) {
          task.onComplete()
        }
      }
    } catch (error) {
      if (task.onError) {
        task.onError(error as Error)
      }
      // 对于一次性任务，执行出错后停止任务
      if (task.type === ScheduleType.DELAY) {
        this.stopTask(taskId)
      }
    }
  }

  /**
   * 停止任务
   * @param taskId 任务ID
   */
  stopTask(taskId: string): boolean {
    const task = this.tasks.get(taskId)
    if (!task) {
      return false
    }

    if (task.timerId !== null) {
      if (task.type === ScheduleType.DELAY) {
        window.clearTimeout(task.timerId)
      } else {
        window.clearInterval(task.timerId)
      }
    }

    task.isRunning = false
    task.timerId = null
    task.nextExecuteAt = null

    return true
  }

  /**
   * 删除任务
   * @param taskId 任务ID
   */
  removeTask(taskId: string): boolean {
    const task = this.tasks.get(taskId)
    if (!task) {
      return false
    }

    this.stopTask(taskId)
    this.tasks.delete(taskId)

    return true
  }

  /**
   * 获取任务
   * @param taskId 任务ID
   */
  getTask(taskId: string): ScheduleTask | undefined {
    return this.tasks.get(taskId)
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): ScheduleTask[] {
    return Array.from(this.tasks.values())
  }

  /**
   * 获取运行中的任务
   */
  getRunningTasks(): ScheduleTask[] {
    return Array.from(this.tasks.values()).filter((task) => task.isRunning)
  }

  /**
   * 获取指定类型的任务
   * @param type 任务类型
   */
  getTasksByType(type: ScheduleType): ScheduleTask[] {
    return Array.from(this.tasks.values()).filter((task) => task.type === type)
  }

  /**
   * 根据名称获取任务
   * @param name 任务名称
   */
  getTasksByName(name: string): ScheduleTask[] {
    return Array.from(this.tasks.values()).filter((task) => task.name === name)
  }

  /**
   * 清除所有任务
   */
  clearAll(): void {
    this.tasks.forEach((task) => {
      this.stopTask(task.id)
    })
    this.tasks.clear()
  }

  /**
   * 清除指定类型的所有任务
   * @param type 任务类型
   */
  clearByType(type: ScheduleType): void {
    const tasks = this.getTasksByType(type)
    tasks.forEach((task) => {
      this.removeTask(task.id)
    })
  }

  /**
   * 清除所有运行中的任务
   */
  clearRunning(): void {
    const tasks = this.getRunningTasks()
    tasks.forEach((task) => {
      this.stopTask(task.id)
    })
  }

  /**
   * 获取任务数量
   */
  getTaskCount(): number {
    return this.tasks.size
  }

  /**
   * 获取运行中的任务数量
   */
  getRunningTaskCount(): number {
    return this.getRunningTasks().length
  }
}

/**
 * 定时任务工具类
 */
export class ScheduleUtils {
  /** 定时任务管理器实例 */
  private static manager: ScheduleManager = new ScheduleManager()

  /**
   * 延迟执行任务
   * @param callback 任务回调
   * @param delay 延迟时间（毫秒）
   * @param options 配置选项
   * @returns 任务ID
   * @example
   * ```ts
   * ScheduleUtils.delay(() => {
   *   console.log('1秒后执行')
   * }, 1000)
   * ```
   */
  static delay(
    callback: () => void | Promise<void>,
    delay: number,
    options?: ScheduleOptions
  ): string {
    return this.manager.delay(callback, delay, options)
  }

  /**
   * 间隔执行任务
   * @param callback 任务回调
   * @param interval 间隔时间（毫秒）
   * @param options 配置选项
   * @returns 任务ID
   * @example
   * ```ts
   * ScheduleUtils.interval(() => {
   *   console.log('每秒执行一次')
   * }, 1000)
   * ```
   */
  static interval(
    callback: () => void | Promise<void>,
    interval: number,
    options?: ScheduleOptions
  ): string {
    return this.manager.interval(callback, interval, options)
  }

  /**
   * 执行指定次数的任务
   * @param callback 任务回调
   * @param interval 间隔时间（毫秒）
   * @param times 执行次数
   * @param options 配置选项
   * @returns 任务ID
   * @example
   * ```ts
   * ScheduleUtils.times(() => {
   *   console.log('执行5次')
   * }, 1000, 5)
   * ```
   */
  static times(
    callback: () => void | Promise<void>,
    interval: number,
    times: number,
    options?: ScheduleOptions
  ): string {
    return this.manager.interval(callback, interval, { ...options, times })
  }

  /**
   * 停止任务
   * @param taskId 任务ID
   * @returns 是否成功停止
   * @example
   * ```ts
   * const taskId = ScheduleUtils.interval(() => {}, 1000)
   * ScheduleUtils.stop(taskId)
   * ```
   */
  static stop(taskId: string): boolean {
    return this.manager.stopTask(taskId)
  }

  /**
   * 删除任务
   * @param taskId 任务ID
   * @returns 是否成功删除
   * @example
   * ```ts
   * const taskId = ScheduleUtils.interval(() => {}, 1000)
   * ScheduleUtils.remove(taskId)
   * ```
   */
  static remove(taskId: string): boolean {
    return this.manager.removeTask(taskId)
  }

  /**
   * 获取任务
   * @param taskId 任务ID
   * @returns 任务信息
   */
  static getTask(taskId: string): ScheduleTask | undefined {
    return this.manager.getTask(taskId)
  }

  /**
   * 获取所有任务
   * @returns 任务列表
   */
  static getAllTasks(): ScheduleTask[] {
    return this.manager.getAllTasks()
  }

  /**
   * 获取运行中的任务
   * @returns 运行中的任务列表
   */
  static getRunningTasks(): ScheduleTask[] {
    return this.manager.getRunningTasks()
  }

  /**
   * 获取指定类型的任务
   * @param type 任务类型
   * @returns 任务列表
   */
  static getTasksByType(type: ScheduleType): ScheduleTask[] {
    return this.manager.getTasksByType(type)
  }

  /**
   * 根据名称获取任务
   * @param name 任务名称
   * @returns 任务列表
   */
  static getTasksByName(name: string): ScheduleTask[] {
    return this.manager.getTasksByName(name)
  }

  /**
   * 清除所有任务
   */
  static clearAll(): void {
    this.manager.clearAll()
  }

  /**
   * 清除指定类型的所有任务
   * @param type 任务类型
   */
  static clearByType(type: ScheduleType): void {
    this.manager.clearByType(type)
  }

  /**
   * 清除所有运行中的任务
   */
  static clearRunning(): void {
    this.manager.clearRunning()
  }

  /**
   * 获取任务数量
   * @returns 任务数量
   */
  static getTaskCount(): number {
    return this.manager.getTaskCount()
  }

  /**
   * 获取运行中的任务数量
   * @returns 运行中的任务数量
   */
  static getRunningTaskCount(): number {
    return this.manager.getRunningTaskCount()
  }

  /**
   * 等待指定时间
   * @param ms 等待时间（毫秒）
   * @returns Promise
   * @example
   * ```ts
   * await ScheduleUtils.wait(1000)
   * console.log('1秒后执行')
   * ```
   */
  static wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.delay(() => resolve(), ms)
    })
  }

  /**
   * 防抖函数
   * @param fn 要防抖的函数
   * @param delay 延迟时间（毫秒）
   * @returns 防抖后的函数
   * @example
   * ```ts
   * const debouncedFn = ScheduleUtils.debounce(() => {
   *   console.log('防抖执行')
   * }, 300)
   * debouncedFn()
   * ```
   */
  static debounce<TArgs extends unknown[], TResult>(
    fn: (...args: TArgs) => TResult,
    delay: number
  ): (...args: TArgs) => void {
    let taskId: string | null = null

    return (...args: TArgs) => {
      if (taskId) {
        this.remove(taskId)
      }
      taskId = this.delay(() => {
        void fn(...args)
      }, delay)
    }
  }

  /**
   * 节流函数
   * @param fn 要节流的函数
   * @param interval 间隔时间（毫秒）
   * @returns 节流后的函数
   * @example
   * ```ts
   * const throttledFn = ScheduleUtils.throttle(() => {
   *   console.log('节流执行')
   * }, 300)
   * throttledFn()
   * ```
   */
  static throttle<TArgs extends unknown[], TResult>(
    fn: (...args: TArgs) => TResult,
    interval: number
  ): (...args: TArgs) => void {
    let taskId: string | null = null
    let lastArgs: TArgs | null = null

    return (...args: TArgs) => {
      lastArgs = args
      if (!taskId) {
        taskId = this.interval(
          () => {
            if (lastArgs) {
              fn(...lastArgs)
              lastArgs = null
            }
          },
          interval,
          {
            times: 1,
            onComplete: () => {
              taskId = null
            }
          }
        )
      }
    }
  }

  /**
   * 创建一次性定时器
   * @param callback 回调函数
   * @param delay 延迟时间（毫秒）
   * @returns 清除定时器的函数
   * @example
   * ```ts
   * const clear = ScheduleUtils.once(() => {
   *   console.log('执行一次')
   * }, 1000)
   * // 如果需要提前取消
   * clear()
   * ```
   */
  static once(callback: () => void | Promise<void>, delay: number): () => void {
    const taskId = this.delay(callback, delay)
    return () => this.remove(taskId)
  }

  /**
   * 创建重复定时器
   * @param callback 回调函数
   * @param interval 间隔时间（毫秒）
   * @returns 清除定时器的函数
   * @example
   * ```ts
   * const clear = ScheduleUtils.repeat(() => {
   *   console.log('重复执行')
   * }, 1000)
   * // 如果需要取消
   * clear()
   * ```
   */
  static repeat(callback: () => void | Promise<void>, interval: number): () => void {
    const taskId = this.interval(callback, interval)
    return () => this.remove(taskId)
  }

  /**
   * 异步重试
   * @param fn 要重试的异步函数
   * @param options 配置选项
   * @returns Promise
   * @example
   * ```ts
   * await ScheduleUtils.retry(async () => {
   *   await fetchData()
   * }, { times: 3, delay: 1000 })
   * ```
   */
  static async retry<T>(
    fn: () => Promise<T>,
    options: {
      /** 重试次数 */
      times?: number
      /** 重试延迟（毫秒） */
      delay?: number
      /** 是否指数退避 */
      exponentialBackoff?: boolean
      /** 错误回调 */
      onError?: (error: Error, attempt: number) => void
    } = {}
  ): Promise<T> {
    const { times = 3, delay = 1000, exponentialBackoff = false, onError } = options

    for (let attempt = 1; attempt <= times; attempt++) {
      try {
        return await fn()
      } catch (error) {
        if (attempt === times) {
          throw error
        }

        if (onError) {
          onError(error as Error, attempt)
        }

        const currentDelay = exponentialBackoff ? delay * Math.pow(2, attempt - 1) : delay
        await this.wait(currentDelay)
      }
    }

    throw new Error('Retry failed')
  }

  /**
   * 轮询检查条件
   * @param condition 检查条件函数
   * @param options 配置选项
   * @returns Promise<boolean> 是否成功满足条件
   * @example
   * ```ts
   * const success = await ScheduleUtils.poll(
   *   () => document.getElementById('myElement') !== null,
   *   { interval: 100, timeout: 5000 }
   * )
   * ```
   */
  static async poll(
    condition: () => boolean | Promise<boolean>,
    options: {
      /** 检查间隔（毫秒） */
      interval?: number
      /** 超时时间（毫秒） */
      timeout?: number
    } = {}
  ): Promise<boolean> {
    const { interval = 100, timeout = 30000 } = options
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true
      }
      await this.wait(interval)
    }

    return false
  }

  /**
   * 延迟队列
   * @param items 队列项
   * @param fn 处理函数
   * @param delay 每项之间的延迟（毫秒）
   * @returns Promise
   * @example
   * ```ts
   * await ScheduleUtils.delayedQueue([1, 2, 3], async (item) => {
   *   console.log('处理:', item)
   * }, 1000)
   * ```
   */
  static async delayedQueue<T>(
    items: T[],
    fn: (item: T, index: number) => void | Promise<void>,
    delay: number
  ): Promise<void> {
    for (let i = 0; i < items.length; i++) {
      await fn(items[i]!, i)
      if (i < items.length - 1) {
        await this.wait(delay)
      }
    }
  }

  /**
   * 速率限制
   * @param fn 要限制的函数
   * @param maxCalls 最大调用次数
   * @param period 时间周期（毫秒）
   * @returns 速率限制后的函数
   * @example
   * ```ts
   * const limitedFn = ScheduleUtils.rateLimit(() => {
   *   console.log('限速执行')
   * }, 5, 1000)
   * ```
   */
  static rateLimit<TArgs extends unknown[], TResult>(
    fn: (...args: TArgs) => TResult,
    maxCalls: number,
    period: number
  ): (...args: TArgs) => void {
    const calls: number[] = []

    return (...args: TArgs) => {
      const now = Date.now()
      // 移除超出时间周期的调用记录
      while (calls.length > 0 && calls[0]! <= now - period) {
        calls.shift()
      }

      if (calls.length < maxCalls) {
        calls.push(now)
        void fn(...args)
      }
    }
  }
}

// 导出默认实例
export default ScheduleUtils
