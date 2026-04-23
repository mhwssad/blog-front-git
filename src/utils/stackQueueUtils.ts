/**
 * 栈和队列数据结构工具类
 * 提供栈（LIFO）和队列（FIFO）的数据结构实现
 */

/**
 * 栈（Stack）- 后进先出（LIFO）数据结构
 */
export class Stack<T> {
  private items: T[]

  constructor() {
    this.items = []
  }

  /**
   * 向栈顶添加元素
   * @param element 要添加的元素
   */
  push(element: T): void {
    this.items.push(element)
  }

  /**
   * 从栈顶移除并返回元素
   * @returns 栈顶元素，如果栈为空则返回undefined
   */
  pop(): T | undefined {
    return this.items.pop()
  }

  /**
   * 查看栈顶元素但不移除
   * @returns 栈顶元素，如果栈为空则返回undefined
   */
  peek(): T | undefined {
    return this.items[this.items.length - 1]
  }

  /**
   * 检查栈是否为空
   * @returns 是否为空
   */
  isEmpty(): boolean {
    return this.items.length === 0
  }

  /**
   * 获取栈的大小
   * @returns 栈中元素的数量
   */
  size(): number {
    return this.items.length
  }

  /**
   * 清空栈
   */
  clear(): void {
    this.items = []
  }

  /**
   * 将栈转换为数组
   * @returns 包含栈中元素的数组
   */
  toArray(): T[] {
    return [...this.items]
  }

  /**
   * 遍历栈中的元素
   * @param callback 回调函数，接收元素和索引
   */
  forEach(callback: (item: T, index: number) => void): void {
    this.items.forEach(callback)
  }

  /**
   * 检查栈中是否包含指定元素
   * @param element 要检查的元素
   * @returns 是否包含
   */
  contains(element: T): boolean {
    return this.items.includes(element)
  }

  /**
   * 获取栈中所有元素
   * @returns 包含栈中元素的数组
   */
  getItems(): T[] {
    return [...this.items]
  }

  /**
   * 从栈顶到栈底遍历元素（不修改栈）
   * @param callback 回调函数
   */
  traverse(callback: (item: T) => void): void {
    for (let i = this.items.length - 1; i >= 0; i--) {
      callback(this.items[i]!)
    }
  }
}

/**
 * 队列（Queue）- 先进先出（FIFO）数据结构
 */
export class Queue<T> {
  private items: T[]

  constructor() {
    this.items = []
  }

  /**
   * 向队列尾部添加元素
   * @param element 要添加的元素
   */
  enqueue(element: T): void {
    this.items.push(element)
  }

  /**
   * 从队列头部移除并返回元素
   * @returns 队列头部元素，如果队列为空则返回undefined
   */
  dequeue(): T | undefined {
    return this.items.shift()
  }

  /**
   * 查看队列头部元素但不移除
   * @returns 队列头部元素，如果队列为空则返回undefined
   */
  peek(): T | undefined {
    return this.items[0]
  }

  /**
   * 检查队列是否为空
   * @returns 是否为空
   */
  isEmpty(): boolean {
    return this.items.length === 0
  }

  /**
   * 获取队列的大小
   * @returns 队列中元素的数量
   */
  size(): number {
    return this.items.length
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.items = []
  }

  /**
   * 将队列转换为数组
   * @returns 包含队列中元素的数组
   */
  toArray(): T[] {
    return [...this.items]
  }

  /**
   * 遍历队列中的元素
   * @param callback 回调函数，接收元素和索引
   */
  forEach(callback: (item: T, index: number) => void): void {
    this.items.forEach(callback)
  }

  /**
   * 检查队列中是否包含指定元素
   * @param element 要检查的元素
   * @returns 是否包含
   */
  contains(element: T): boolean {
    return this.items.includes(element)
  }

  /**
   * 获取队列中所有元素
   * @returns 包含队列中元素的数组
   */
  getItems(): T[] {
    return [...this.items]
  }

  /**
   * 从队列头部到尾部遍历元素（不修改队列）
   * @param callback 回调函数
   */
  traverse(callback: (item: T) => void): void {
    this.items.forEach(callback)
  }
}

/**
 * 优先队列（Priority Queue）- 带优先级的队列
 */
export class PriorityQueue<T> {
  private items: { element: T; priority: number }[]

  constructor() {
    this.items = []
  }

  /**
   * 向队列中添加元素
   * @param element 要添加的元素
   * @param priority 优先级，数字越小优先级越高
   */
  enqueue(element: T, priority: number): void {
    const queueElement = { element, priority }
    let added = false

    for (let i = 0; i < this.items.length; i++) {
      if (queueElement.priority < this.items[i]!.priority) {
        this.items.splice(i, 0, queueElement)
        added = true
        break
      }
    }

    if (!added) {
      this.items.push(queueElement)
    }
  }

  /**
   * 从队列头部移除并返回元素
   * @returns 队列头部元素，如果队列为空则返回undefined
   */
  dequeue(): T | undefined {
    const item = this.items.shift()
    return item?.element
  }

  /**
   * 查看队列头部元素但不移除
   * @returns 队列头部元素，如果队列为空则返回undefined
   */
  peek(): T | undefined {
    return this.items[0]?.element
  }

  /**
   * 检查队列是否为空
   * @returns 是否为空
   */
  isEmpty(): boolean {
    return this.items.length === 0
  }

  /**
   * 获取队列的大小
   * @returns 队列中元素的数量
   */
  size(): number {
    return this.items.length
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.items = []
  }

  /**
   * 将队列转换为数组
   * @returns 包含队列中元素的数组
   */
  toArray(): T[] {
    return this.items.map((item) => item.element)
  }

  /**
   * 遍历队列中的元素
   * @param callback 回调函数，接收元素、索引和优先级
   */
  forEach(callback: (item: T, index: number, priority: number) => void): void {
    this.items.forEach((item, index) => {
      callback(item.element, index, item.priority)
    })
  }

  /**
   * 检查队列中是否包含指定元素
   * @param element 要检查的元素
   * @returns 是否包含
   */
  contains(element: T): boolean {
    return this.items.some((item) => item.element === element)
  }

  /**
   * 获取队列中所有元素
   * @returns 包含队列中元素的数组
   */
  getItems(): T[] {
    return this.items.map((item) => item.element)
  }

  /**
   * 获取队列中所有元素及其优先级
   * @returns 包含元素和优先级的数组
   */
  getItemsWithPriority(): { element: T; priority: number }[] {
    return [...this.items]
  }
}

/**
 * 循环队列（Circular Queue）- 固定大小的队列
 */
export class CircularQueue<T> {
  private items: (T | undefined)[]
  private front: number
  private rear: number
  private maxSize: number

  constructor(size: number) {
    if (size <= 0) {
      throw new Error('队列大小必须大于0')
    }
    this.maxSize = size
    this.items = new Array(size)
    this.front = 0
    this.rear = 0
  }

  /**
   * 向队列尾部添加元素
   * @param element 要添加的元素
   * @returns 是否添加成功
   */
  enqueue(element: T): boolean {
    if (this.isFull()) {
      return false
    }

    this.items[this.rear] = element
    this.rear = (this.rear + 1) % this.maxSize
    return true
  }

  /**
   * 从队列头部移除并返回元素
   * @returns 队列头部元素，如果队列为空则返回undefined
   */
  dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined
    }

    const element = this.items[this.front]
    this.items[this.front] = undefined
    this.front = (this.front + 1) % this.maxSize
    return element
  }

  /**
   * 查看队列头部元素但不移除
   * @returns 队列头部元素，如果队列为空则返回undefined
   */
  peek(): T | undefined {
    if (this.isEmpty()) {
      return undefined
    }
    return this.items[this.front]
  }

  /**
   * 检查队列是否为空
   * @returns 是否为空
   */
  isEmpty(): boolean {
    return this.front === this.rear
  }

  /**
   * 检查队列是否已满
   * @returns 是否已满
   */
  isFull(): boolean {
    return (this.rear + 1) % this.maxSize === this.front
  }

  /**
   * 获取队列的大小
   * @returns 队列中元素的数量
   */
  size(): number {
    if (this.rear >= this.front) {
      return this.rear - this.front
    }
    return this.maxSize - this.front + this.rear
  }

  /**
   * 获取队列的最大容量
   * @returns 最大容量
   */
  capacity(): number {
    return this.maxSize - 1
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.items = new Array(this.maxSize)
    this.front = 0
    this.rear = 0
  }

  /**
   * 将队列转换为数组
   * @returns 包含队列中元素的数组
   */
  toArray(): T[] {
    const result: T[] = []
    let current = this.front

    while (current !== this.rear) {
      const element = this.items[current]
      if (element !== undefined) {
        result.push(element)
      }
      current = (current + 1) % this.maxSize
    }

    return result
  }

  /**
   * 遍历队列中的元素
   * @param callback 回调函数，接收元素和索引
   */
  forEach(callback: (item: T, index: number) => void): void {
    let current = this.front
    let index = 0

    while (current !== this.rear) {
      const element = this.items[current]
      if (element !== undefined) {
        callback(element, index)
        index++
      }
      current = (current + 1) % this.maxSize
    }
  }

  /**
   * 检查队列中是否包含指定元素
   * @param element 要检查的元素
   * @returns 是否包含
   */
  contains(element: T): boolean {
    let current = this.front

    while (current !== this.rear) {
      if (this.items[current] === element) {
        return true
      }
      current = (current + 1) % this.maxSize
    }

    return false
  }

  /**
   * 获取队列中所有元素
   * @returns 包含队列中元素的数组
   */
  getItems(): T[] {
    return this.toArray()
  }
}

/**
 * 双端队列（Deque）- 可以在两端进行插入和删除的队列
 */
export class Deque<T> {
  private items: T[]

  constructor() {
    this.items = []
  }

  /**
   * 在队列头部添加元素
   * @param element 要添加的元素
   */
  addFront(element: T): void {
    this.items.unshift(element)
  }

  /**
   * 在队列尾部添加元素
   * @param element 要添加的元素
   */
  addRear(element: T): void {
    this.items.push(element)
  }

  /**
   * 从队列头部移除并返回元素
   * @returns 队列头部元素，如果队列为空则返回undefined
   */
  removeFront(): T | undefined {
    return this.items.shift()
  }

  /**
   * 从队列尾部移除并返回元素
   * @returns 队列尾部元素，如果队列为空则返回undefined
   */
  removeRear(): T | undefined {
    return this.items.pop()
  }

  /**
   * 查看队列头部元素但不移除
   * @returns 队列头部元素，如果队列为空则返回undefined
   */
  peekFront(): T | undefined {
    return this.items[0]
  }

  /**
   * 查看队列尾部元素但不移除
   * @returns 队列尾部元素，如果队列为空则返回undefined
   */
  peekRear(): T | undefined {
    return this.items[this.items.length - 1]
  }

  /**
   * 检查队列是否为空
   * @returns 是否为空
   */
  isEmpty(): boolean {
    return this.items.length === 0
  }

  /**
   * 获取队列的大小
   * @returns 队列中元素的数量
   */
  size(): number {
    return this.items.length
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.items = []
  }

  /**
   * 将队列转换为数组
   * @returns 包含队列中元素的数组
   */
  toArray(): T[] {
    return [...this.items]
  }

  /**
   * 遍历队列中的元素
   * @param callback 回调函数，接收元素和索引
   */
  forEach(callback: (item: T, index: number) => void): void {
    this.items.forEach(callback)
  }

  /**
   * 检查队列中是否包含指定元素
   * @param element 要检查的元素
   * @returns 是否包含
   */
  contains(element: T): boolean {
    return this.items.includes(element)
  }

  /**
   * 获取队列中所有元素
   * @returns 包含队列中元素的数组
   */
  getItems(): T[] {
    return [...this.items]
  }
}

// 导出默认实例（用于快速访问）
export default {
  Stack,
  Queue,
  PriorityQueue,
  CircularQueue,
  Deque
}
