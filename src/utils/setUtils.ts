/**
 * Set工具类
 * 提供常用的Set操作方法
 */

/**
 * Set工具类
 */
export class SetUtils {
  /**
   * 检查Set是否为空
   * @param set 要检查的Set
   * @returns 是否为空
   */
  static isEmpty<T>(set: Set<T>): boolean {
    return !set || set.size === 0
  }

  /**
   * 检查Set是否不为空
   * @param set 要检查的Set
   * @returns 是否不为空
   */
  static isNotEmpty<T>(set: Set<T>): boolean {
    return !this.isEmpty(set)
  }

  /**
   * 获取Set的所有值
   * @param set Set对象
   * @returns 值数组
   */
  static values<T>(set: Set<T>): T[] {
    if (this.isEmpty(set)) {
      return []
    }
    return [...set.values()]
  }

  /**
   * 从数组创建Set
   * @param array 数组
   * @returns Set对象
   */
  static fromArray<T>(array: T[]): Set<T> {
    return new Set(array)
  }

  /**
   * 将Set转换为数组
   * @param set Set对象
   * @returns 数组
   */
  static toArray<T>(set: Set<T>): T[] {
    return this.values(set)
  }

  /**
   * 获取Set的大小
   * @param set Set对象
   * @returns Set的大小
   */
  static size<T>(set: Set<T>): number {
    return set ? set.size : 0
  }

  /**
   * 检查Set是否包含指定值
   * @param set Set对象
   * @param value 要检查的值
   * @returns 是否包含该值
   */
  static has<T>(set: Set<T>, value: T): boolean {
    return set ? set.has(value) : false
  }

  /**
   * 向Set中添加值
   * @param set Set对象
   * @param value 要添加的值
   * @returns Set对象本身（支持链式调用）
   */
  static add<T>(set: Set<T>, value: T): Set<T> {
    if (set) {
      set.add(value)
    }
    return set
  }

  /**
   * 向Set中添加多个值
   * @param set Set对象
   * @param values 要添加的值数组
   * @returns Set对象本身（支持链式调用）
   */
  static addAll<T>(set: Set<T>, values: T[]): Set<T> {
    if (set && values) {
      for (const value of values) {
        set.add(value)
      }
    }
    return set
  }

  /**
   * 删除Set中的指定值
   * @param set Set对象
   * @param value 要删除的值
   * @returns 是否成功删除
   */
  static delete<T>(set: Set<T>, value: T): boolean {
    return set ? set.delete(value) : false
  }

  /**
   * 删除Set中的多个值
   * @param set Set对象
   * @param values 要删除的值数组
   * @returns 成功删除的值的数量
   */
  static deleteAll<T>(set: Set<T>, values: T[]): number {
    if (!set || !values) {
      return 0
    }
    let count = 0
    for (const value of values) {
      if (set.delete(value)) {
        count++
      }
    }
    return count
  }

  /**
   * 清空Set中的所有值
   * @param set Set对象
   */
  static clear<T>(set: Set<T>): void {
    if (set) {
      set.clear()
    }
  }

  /**
   * 过滤Set的值
   * @param set Set对象
   * @param predicate 过滤函数
   * @returns 过滤后的新Set
   */
  static filter<T>(set: Set<T>, predicate: (value: T) => boolean): Set<T> {
    const result = new Set<T>()
    for (const value of [...set.values()]) {
      if (predicate(value)) {
        result.add(value)
      }
    }
    return result
  }

  /**
   * 映射Set的值
   * @param set Set对象
   * @param mapper 映射函数
   * @returns 映射后的新Set
   */
  static map<T, R>(set: Set<T>, mapper: (value: T) => R): Set<R> {
    const result = new Set<R>()
    for (const value of [...set.values()]) {
      result.add(mapper(value))
    }
    return result
  }

  /**
   * 检查Set中是否有满足条件的值
   * @param set Set对象
   * @param predicate 检查函数
   * @returns 是否有满足条件的值
   */
  static some<T>(set: Set<T>, predicate: (value: T) => boolean): boolean {
    for (const value of [...set.values()]) {
      if (predicate(value)) {
        return true
      }
    }
    return false
  }

  /**
   * 检查Set中是否所有值都满足条件
   * @param set Set对象
   * @param predicate 检查函数
   * @returns 是否所有值都满足条件
   */
  static every<T>(set: Set<T>, predicate: (value: T) => boolean): boolean {
    for (const value of [...set.values()]) {
      if (!predicate(value)) {
        return false
      }
    }
    return true
  }

  /**
   * 对Set中的每个值执行操作
   * @param set Set对象
   * @param callbackfn 回调函数
   */
  static forEach<T>(set: Set<T>, callbackfn: (value: T, value2: T, set: Set<T>) => void): void {
    if (set) {
      set.forEach(callbackfn)
    }
  }

  /**
   * 获取两个Set的交集
   * @param set1 第一个Set
   * @param set2 第二个Set
   * @returns 交集Set
   */
  static intersection<T>(set1: Set<T>, set2: Set<T>): Set<T> {
    const result = new Set<T>()
    const smallerSet = set1.size <= set2.size ? set1 : set2
    const largerSet = set1.size <= set2.size ? set2 : set1

    for (const value of [...smallerSet.values()]) {
      if (largerSet.has(value)) {
        result.add(value)
      }
    }
    return result
  }

  /**
   * 获取两个Set的差集（set1中有set2中没有的值）
   * @param set1 第一个Set
   * @param set2 第二个Set
   * @returns 差集Set
   */
  static difference<T>(set1: Set<T>, set2: Set<T>): Set<T> {
    const result = new Set<T>()
    for (const value of [...set1.values()]) {
      if (!set2.has(value)) {
        result.add(value)
      }
    }
    return result
  }

  /**
   * 获取两个Set的并集
   * @param set1 第一个Set
   * @param set2 第二个Set
   * @returns 并集Set
   */
  static union<T>(set1: Set<T>, set2: Set<T>): Set<T> {
    const result = new Set<T>()
    for (const value of [...set1.values()]) {
      result.add(value)
    }
    for (const value of [...set2.values()]) {
      result.add(value)
    }
    return result
  }

  /**
   * 获取两个Set的对称差集（只在其中一个Set中出现的值）
   * @param set1 第一个Set
   * @param set2 第二个Set
   * @returns 对称差集Set
   */
  static symmetricDifference<T>(set1: Set<T>, set2: Set<T>): Set<T> {
    const result = new Set<T>()
    for (const value of [...set1.values()]) {
      if (!set2.has(value)) {
        result.add(value)
      }
    }
    for (const value of [...set2.values()]) {
      if (!set1.has(value)) {
        result.add(value)
      }
    }
    return result
  }

  /**
   * 检查一个Set是否是另一个Set的子集
   * @param subset 可能的子集
   * @param superset 可能的超集
   * @returns 是否是子集
   */
  static isSubset<T>(subset: Set<T>, superset: Set<T>): boolean {
    if (subset.size > superset.size) {
      return false
    }
    for (const value of [...subset.values()]) {
      if (!superset.has(value)) {
        return false
      }
    }
    return true
  }

  /**
   * 检查一个Set是否是另一个Set的超集
   * @param superset 可能的超集
   * @param subset 可能的子集
   * @returns 是否是超集
   */
  static isSuperset<T>(superset: Set<T>, subset: Set<T>): boolean {
    return this.isSubset(subset, superset)
  }

  /**
   * 合并多个Set
   * @param sets Set数组
   * @returns 合并后的新Set
   */
  static merge<T>(...sets: Set<T>[]): Set<T> {
    const result = new Set<T>()
    for (const set of sets) {
      if (set) {
        for (const value of [...set.values()]) {
          result.add(value)
        }
      }
    }
    return result
  }

  /**
   * 对Set进行分组
   * @param set Set对象
   * @param keySelector 分组键选择器函数
   * @returns 分组后的Map（键为分组键，值为该组的Set）
   */
  static groupBy<T, K>(set: Set<T>, keySelector: (value: T) => K): Map<K, Set<T>> {
    const result = new Map<K, Set<T>>()

    for (const value of [...set.values()]) {
      const groupKey = keySelector(value)
      if (!result.has(groupKey)) {
        result.set(groupKey, new Set<T>())
      }
      result.get(groupKey)!.add(value)
    }

    return result
  }

  /**
   * 对Set进行排序
   * @param set Set对象
   * @param compareFn 比较函数
   * @returns 排序后的新Set
   */
  static sort<T>(set: Set<T>, compareFn?: (a: T, b: T) => number): Set<T> {
    const values = Array.from(set.values())
    values.sort(compareFn || ((a, b) => (String(a) > String(b) ? 1 : -1)))
    return new Set(values)
  }

  /**
   * 随机获取Set中的一个值
   * @param set Set对象
   * @returns 随机值或undefined
   */
  static sample<T>(set: Set<T>): T | undefined {
    if (this.isEmpty(set)) {
      return undefined
    }
    const values = Array.from(set.values())
    const randomIndex = Math.floor(Math.random() * values.length)
    return values[randomIndex]
  }

  /**
   * 随机获取Set中的n个值
   * @param set Set对象
   * @param count 获取的数量，默认为1
   * @returns 随机值数组
   */
  static sampleValues<T>(set: Set<T>, count = 1): T[] {
    if (this.isEmpty(set)) {
      return []
    }

    const values = Array.from(set.values())
    if (count >= values.length) {
      return values
    }

    // Fisher-Yates 洗牌算法
    const shuffled = [...values]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = shuffled[i]!
      shuffled[i] = shuffled[j]!
      shuffled[j] = temp
    }

    return shuffled.slice(0, count)
  }

  /**
   * 检查两个Set是否相等
   * @param set1 第一个Set
   * @param set2 第二个Set
   * @returns 是否相等
   */
  static isEqual<T>(set1: Set<T>, set2: Set<T>): boolean {
    if (set1 === set2) {
      return true
    }

    if (!set1 || !set2) {
      return set1 === set2
    }

    if (set1.size !== set2.size) {
      return false
    }

    for (const value of [...set1.values()]) {
      if (!set2.has(value)) {
        return false
      }
    }

    return true
  }

  /**
   * 将Set转换为JSON字符串
   * @param set Set对象
   * @param replacer 替换函数
   * @param space 缩进空格数
   * @returns JSON字符串
   */
  static toJSON<T>(
    set: Set<T>,
    replacer?: (key: string, value: unknown) => unknown,
    space?: number
  ): string {
    const array = this.toArray(set)
    return JSON.stringify(array, replacer, space)
  }

  /**
   * 从JSON字符串创建Set
   * @param jsonString JSON字符串
   * @returns Set对象
   */
  static fromJSON<T>(jsonString: string): Set<T> {
    try {
      const array = JSON.parse(jsonString)
      return this.fromArray(array as T[])
    } catch {
      throw new Error('无效的JSON字符串')
    }
  }

  /**
   * 获取Set的第一个值
   * @param set Set对象
   * @returns 第一个值或undefined
   */
  static first<T>(set: Set<T>): T | undefined {
    if (this.isEmpty(set)) {
      return undefined
    }
    return set.values().next().value
  }

  /**
   * 获取Set的最后一个值
   * @param set Set对象
   * @returns 最后一个值或undefined
   */
  static last<T>(set: Set<T>): T | undefined {
    if (this.isEmpty(set)) {
      return undefined
    }
    const values = Array.from(set.values())
    return values[values.length - 1]
  }

  /**
   * 查找Set中满足条件的第一个值
   * @param set Set对象
   * @param predicate 查找函数
   * @returns 满足条件的第一个值或undefined
   */
  static find<T>(set: Set<T>, predicate: (value: T) => boolean): T | undefined {
    for (const value of [...set.values()]) {
      if (predicate(value)) {
        return value
      }
    }
    return undefined
  }

  /**
   * 查找Set中满足条件的所有值
   * @param set Set对象
   * @param predicate 查找函数
   * @returns 满足条件的所有值的数组
   */
  static findAll<T>(set: Set<T>, predicate: (value: T) => boolean): T[] {
    const result: T[] = []
    for (const value of [...set.values()]) {
      if (predicate(value)) {
        result.push(value)
      }
    }
    return result
  }
}

// 导出默认实例
export default SetUtils
