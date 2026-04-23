/**
 * Map工具类
 * 提供常用的Map操作方法
 */

/**
 * Map工具类
 */
export class MapUtils {
  /**
   * 检查Map是否为空
   * @param map 要检查的Map
   * @returns 是否为空
   */
  static isEmpty<K, V>(map: Map<K, V>): boolean {
    return !map || map.size === 0
  }

  /**
   * 检查Map是否不为空
   * @param map 要检查的Map
   * @returns 是否不为空
   */
  static isNotEmpty<K, V>(map: Map<K, V>): boolean {
    return !this.isEmpty(map)
  }

  /**
   * 获取Map的所有键
   * @param map Map对象
   * @returns 键数组
   */
  static keys<K, V>(map: Map<K, V>): K[] {
    if (this.isEmpty(map)) {
      return []
    }
    return [...map.keys()]
  }

  /**
   * 获取Map的所有值
   * @param map Map对象
   * @returns 值数组
   */
  static values<K, V>(map: Map<K, V>): V[] {
    if (this.isEmpty(map)) {
      return []
    }
    return [...map.values()]
  }

  /**
   * 获取Map的所有键值对
   * @param map Map对象
   * @returns 键值对数组
   */
  static entries<K, V>(map: Map<K, V>): [K, V][] {
    if (this.isEmpty(map)) {
      return []
    }
    return [...map.entries()]
  }

  /**
   * 从键值对数组创建Map
   * @param entries 键值对数组
   * @returns Map对象
   */
  static fromEntries<K, V>(entries: [K, V][]): Map<K, V> {
    return new Map(entries)
  }

  /**
   * 从对象创建Map
   * @param obj 对象
   * @returns Map对象
   */
  static fromObject<K extends string | number | symbol, V>(obj: Record<K, V>): Map<K, V> {
    const map = new Map<K, V>()
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        map.set(key, obj[key])
      }
    }
    return map
  }

  /**
   * 将Map转换为对象
   * @param map Map对象
   * @returns 对象
   */
  static toObject<K extends string | number | symbol, V>(map: Map<K, V>): Record<K, V> {
    const obj = {} as Record<K, V>
    for (const [key, value] of [...map.entries()]) {
      obj[key] = value
    }
    return obj
  }

  /**
   * 获取Map的大小
   * @param map Map对象
   * @returns Map的大小
   */
  static size<K, V>(map: Map<K, V>): number {
    return map ? map.size : 0
  }

  /**
   * 检查Map是否包含指定键
   * @param map Map对象
   * @param key 要检查的键
   * @returns 是否包含该键
   */
  static has<K, V>(map: Map<K, V>, key: K): boolean {
    return map ? map.has(key) : false
  }

  /**
   * 获取Map中指定键的值
   * @param map Map对象
   * @param key 键
   * @param defaultValue 默认值
   * @returns 键对应的值或默认值
   */
  static get<K, V>(map: Map<K, V>, key: K, defaultValue?: V): V | undefined {
    if (!map) {
      return defaultValue
    }
    const value = map.get(key)
    return value !== undefined ? value : defaultValue
  }

  /**
   * 设置Map中的键值对
   * @param map Map对象
   * @param key 键
   * @param value 值
   * @returns Map对象本身（支持链式调用）
   */
  static set<K, V>(map: Map<K, V>, key: K, value: V): Map<K, V> {
    if (map) {
      map.set(key, value)
    }
    return map
  }

  /**
   * 删除Map中的指定键
   * @param map Map对象
   * @param key 要删除的键
   * @returns 是否成功删除
   */
  static delete<K, V>(map: Map<K, V>, key: K): boolean {
    return map ? map.delete(key) : false
  }

  /**
   * 清空Map中的所有键值对
   * @param map Map对象
   */
  static clear<K, V>(map: Map<K, V>): void {
    if (map) {
      map.clear()
    }
  }

  /**
   * 过滤Map的键值对
   * @param map Map对象
   * @param predicate 过滤函数
   * @returns 过滤后的新Map
   */
  static filter<K, V>(map: Map<K, V>, predicate: (value: V, key: K) => boolean): Map<K, V> {
    const result = new Map<K, V>()
    for (const [key, value] of [...map.entries()]) {
      if (predicate(value, key)) {
        result.set(key, value)
      }
    }
    return result
  }

  /**
   * 映射Map的值
   * @param map Map对象
   * @param mapper 映射函数
   * @returns 映射后的新Map
   */
  static mapValues<K, V, R>(map: Map<K, V>, mapper: (value: V, key: K) => R): Map<K, R> {
    const result = new Map<K, R>()
    for (const [key, value] of [...map.entries()]) {
      result.set(key, mapper(value, key))
    }
    return result
  }

  /**
   * 映射Map的键
   * @param map Map对象
   * @param mapper 映射函数
   * @returns 映射后的新Map
   */
  static mapKeys<K, V, R>(map: Map<K, V>, mapper: (key: K, value: V) => R): Map<R, V> {
    const result = new Map<R, V>()
    for (const [key, value] of [...map.entries()]) {
      result.set(mapper(key, value), value)
    }
    return result
  }

  /**
   * 检查Map中是否有满足条件的键值对
   * @param map Map对象
   * @param predicate 检查函数
   * @returns 是否有满足条件的键值对
   */
  static some<K, V>(map: Map<K, V>, predicate: (value: V, key: K) => boolean): boolean {
    for (const [key, value] of [...map.entries()]) {
      if (predicate(value, key)) {
        return true
      }
    }
    return false
  }

  /**
   * 检查Map中是否所有键值对都满足条件
   * @param map Map对象
   * @param predicate 检查函数
   * @returns 是否所有键值对都满足条件
   */
  static every<K, V>(map: Map<K, V>, predicate: (value: V, key: K) => boolean): boolean {
    for (const [key, value] of [...map.entries()]) {
      if (!predicate(value, key)) {
        return false
      }
    }
    return true
  }

  /**
   * 反转Map的键和值（注意：值必须可以作为键）
   * @param map Map对象
   * @returns 反转后的新Map
   */
  static invert<K, V extends K>(map: Map<K, V>): Map<V, K> {
    const result = new Map<V, K>()
    for (const [key, value] of [...map.entries()]) {
      result.set(value, key)
    }
    return result
  }

  /**
   * 合并多个Map
   * @param maps Map数组
   * @returns 合并后的新Map
   */
  static merge<K, V>(...maps: Map<K, V>[]): Map<K, V> {
    const result = new Map<K, V>()
    for (const map of maps) {
      if (map) {
        for (const [key, value] of [...map.entries()]) {
          result.set(key, value)
        }
      }
    }
    return result
  }

  /**
   * 获取两个Map的交集（共同键）
   * @param map1 第一个Map
   * @param map2 第二个Map
   * @returns 交集Map（使用第一个Map的值）
   */
  static intersection<K, V>(map1: Map<K, V>, map2: Map<K, V>): Map<K, V> {
    const result = new Map<K, V>()
    for (const [key, value] of [...map1.entries()]) {
      if (map2.has(key)) {
        result.set(key, value)
      }
    }
    return result
  }

  /**
   * 获取两个Map的差集（map1中有map2中没有的键）
   * @param map1 第一个Map
   * @param map2 第二个Map
   * @returns 差集Map
   */
  static difference<K, V>(map1: Map<K, V>, map2: Map<K, V>): Map<K, V> {
    const result = new Map<K, V>()
    for (const [key, value] of [...map1.entries()]) {
      if (!map2.has(key)) {
        result.set(key, value)
      }
    }
    return result
  }

  /**
   * 获取两个Map的并集（所有键，如果有重复键，使用第一个Map的值）
   * @param map1 第一个Map
   * @param map2 第二个Map
   * @returns 并集Map
   */
  static union<K, V>(map1: Map<K, V>, map2: Map<K, V>): Map<K, V> {
    return this.merge(map1, map2)
  }

  /**
   * 扁平化嵌套Map
   * @param map Map对象
   * @param separator 分隔符，默认为'.'
   * @param prefix 前缀
   * @returns 扁平化后的Map
   */
  static flatten<K extends string>(
    map: Map<K, unknown>,
    separator = '.',
    prefix = ''
  ): Map<string, unknown> {
    const result = new Map<string, unknown>()

    for (const [key, value] of [...map.entries()]) {
      const newKey = prefix ? `${prefix}${separator}${key}` : key

      if (value instanceof Map) {
        const flattened = this.flatten(value as Map<string, unknown>, separator, newKey)
        for (const [flatKey, flatValue] of [...flattened.entries()]) {
          result.set(flatKey, flatValue)
        }
      } else {
        result.set(newKey, value)
      }
    }

    return result
  }

  /**
   * 反扁平化Map
   * @param map 扁平化的Map
   * @param separator 分隔符，默认为'.'
   * @returns 反扁平化后的Map
   */
  static unflatten(map: Map<string, unknown>, separator = '.'): Map<string, unknown> {
    const result = new Map<string, unknown>()

    for (const [key, value] of [...map.entries()]) {
      const keys = key.split(separator)
      let current = result

      for (let i = 0; i < keys.length - 1; i++) {
        const currentKey = keys[i] as string
        if (!current.has(currentKey)) {
          current.set(currentKey, new Map())
        }
        current = current.get(currentKey) as Map<string, unknown>
      }

      current.set(keys[keys.length - 1] as string, value)
    }

    return result
  }

  /**
   * 对Map进行分组
   * @param map Map对象
   * @param keySelector 分组键选择器函数
   * @returns 分组后的Map（键为分组键，值为该组的Map）
   */
  static groupBy<K, V, G>(map: Map<K, V>, keySelector: (value: V, key: K) => G): Map<G, Map<K, V>> {
    const result = new Map<G, Map<K, V>>()

    for (const [key, value] of [...map.entries()]) {
      const groupKey = keySelector(value, key)
      if (!result.has(groupKey)) {
        result.set(groupKey, new Map<K, V>())
      }
      result.get(groupKey)!.set(key, value)
    }

    return result
  }

  /**
   * 对Map进行排序
   * @param map Map对象
   * @param compareFn 比较函数
   * @returns 排序后的新Map
   */
  static sort<K, V>(map: Map<K, V>, compareFn?: (a: [K, V], b: [K, V]) => number): Map<K, V> {
    const entries = Array.from(map.entries())
    entries.sort(compareFn || ((a, b) => (String(a[0]) > String(b[0]) ? 1 : -1)))
    return new Map(entries)
  }

  /**
   * 按键对Map进行排序
   * @param map Map对象
   * @param order 排序顺序，'asc'升序，'desc'降序，默认为'asc'
   * @returns 排序后的新Map
   */
  static sortByKey<K, V>(map: Map<K, V>, order: 'asc' | 'desc' = 'asc'): Map<K, V> {
    return this.sort(map, (a, b) => {
      const aKey = String(a[0])
      const bKey = String(b[0])
      if (aKey < bKey) {
        return order === 'asc' ? -1 : 1
      }
      if (aKey > bKey) {
        return order === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  /**
   * 按值对Map进行排序
   * @param map Map对象
   * @param order 排序顺序，'asc'升序，'desc'降序，默认为'asc'
   * @returns 排序后的新Map
   */
  static sortByValue<K, V>(map: Map<K, V>, order: 'asc' | 'desc' = 'asc'): Map<K, V> {
    return this.sort(map, (a, b) => {
      const aValue = a[1]
      const bValue = b[1]
      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  /**
   * 随机获取Map中的一个键值对
   * @param map Map对象
   * @returns 随机键值对或undefined
   */
  static sample<K, V>(map: Map<K, V>): [K, V] | undefined {
    if (this.isEmpty(map)) {
      return undefined
    }
    const entries = Array.from(map.entries())
    const randomIndex = Math.floor(Math.random() * entries.length)
    return entries[randomIndex]
  }

  /**
   * 随机获取Map中的n个键值对
   * @param map Map对象
   * @param count 获取的数量，默认为1
   * @returns 随机键值对数组
   */
  static sampleEntries<K, V>(map: Map<K, V>, count = 1): [K, V][] {
    if (this.isEmpty(map)) {
      return []
    }

    const entries = Array.from(map.entries())
    if (count >= entries.length) {
      return entries
    }

    // Fisher-Yates 洗牌算法
    const shuffled = [...entries]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = shuffled[i]!
      shuffled[i] = shuffled[j]!
      shuffled[j] = temp
    }

    return shuffled.slice(0, count)
  }

  /**
   * 检查两个Map是否相等
   * @param map1 第一个Map
   * @param map2 第二个Map
   * @returns 是否相等
   */
  static isEqual<K, V>(map1: Map<K, V>, map2: Map<K, V>): boolean {
    if (map1 === map2) {
      return true
    }

    if (!map1 || !map2) {
      return map1 === map2
    }

    if (map1.size !== map2.size) {
      return false
    }

    for (const [key, value] of [...map1.entries()]) {
      if (!map2.has(key) || map2.get(key) !== value) {
        return false
      }
    }

    return true
  }

  /**
   * 将Map转换为JSON字符串
   * @param map Map对象
   * @param replacer 替换函数
   * @param space 缩进空格数
   * @returns JSON字符串
   */
  static toJSON<K, V>(
    map: Map<K, V>,
    replacer?: (key: string, value: unknown) => unknown,
    space?: number
  ): string {
    const obj = this.toObject(map as Map<string | number | symbol, V>)
    return JSON.stringify(obj, replacer, space)
  }

  /**
   * 从JSON字符串创建Map
   * @param jsonString JSON字符串
   * @returns Map对象
   */
  static fromJSON<K extends string | number | symbol, V>(jsonString: string): Map<K, V> {
    try {
      const obj = JSON.parse(jsonString)
      return this.fromObject(obj as Record<K, V>)
    } catch {
      throw new Error('无效的JSON字符串')
    }
  }
}

// 导出默认实例
export default MapUtils
