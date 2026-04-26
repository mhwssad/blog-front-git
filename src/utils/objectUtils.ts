/**
 * 对象工具类
 * 提供常用的对象操作方法
 */

type PathSegment = string | number
type ObjectKey = string | number | symbol

function isObjectLike(value: unknown): value is object {
  return value !== null && typeof value === 'object'
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!isObjectLike(value)) {
    return false
  }

  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function toPathSegments(path: string | PathSegment[]): PathSegment[] {
  if (Array.isArray(path)) {
    return path
      .map((segment) => {
        if (typeof segment === 'number') {
          return segment
        }

        const trimmed = segment.trim()
        return /^\d+$/.test(trimmed) ? Number(trimmed) : trimmed
      })
      .filter((segment) => segment !== '')
  }

  const normalized = path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .map((segment) => segment.trim())
    .filter((segment) => segment !== '')

  return normalized.map((segment) => (/^\d+$/.test(segment) ? Number(segment) : segment))
}

function cloneValue<T>(value: T, cache: WeakMap<object, unknown>): T {
  if (!isObjectLike(value)) {
    return value
  }

  if (cache.has(value)) {
    return cache.get(value) as T
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as T
  }

  if (value instanceof Map) {
    const clonedMap = new Map()
    cache.set(value, clonedMap)
    value.forEach((mapValue, key) => {
      clonedMap.set(cloneValue(key, cache), cloneValue(mapValue, cache))
    })
    return clonedMap as T
  }

  if (value instanceof Set) {
    const clonedSet = new Set()
    cache.set(value, clonedSet)
    value.forEach((entry) => {
      clonedSet.add(cloneValue(entry, cache))
    })
    return clonedSet as T
  }

  if (Array.isArray(value)) {
    const clonedArray: unknown[] = []
    cache.set(value, clonedArray)
    value.forEach((item, index) => {
      clonedArray[index] = cloneValue(item, cache)
    })
    return clonedArray as T
  }

  const clonedObject = Object.create(Object.getPrototypeOf(value)) as Record<ObjectKey, unknown>
  cache.set(value, clonedObject)

  for (const key of Reflect.ownKeys(value)) {
    clonedObject[key] = cloneValue((value as Record<ObjectKey, unknown>)[key], cache)
  }

  return clonedObject as T
}

function getContainerForNextSegment(segment: PathSegment): Record<string, unknown> | unknown[] {
  return typeof segment === 'number' ? [] : {}
}

function splitFlattenKey(key: string, separator: string): PathSegment[] {
  return key
    .split(separator)
    .filter((segment) => segment !== '')
    .map((segment) => (/^\d+$/.test(segment) ? Number(segment) : segment))
}

/**
 * 对象工具类
 */
export class ObjectUtils {
  /**
   * 检查对象是否为空
   * @param obj 要检查的对象
   * @returns 是否为空
   */
  static isEmpty(obj: unknown): boolean {
    if (obj == null) {
      return true
    }

    if (typeof obj === 'string') {
      return obj.length === 0
    }

    if (Array.isArray(obj)) {
      return obj.length === 0
    }

    if (obj instanceof Map || obj instanceof Set) {
      return obj.size === 0
    }

    if (!isObjectLike(obj)) {
      return false
    }

    return Reflect.ownKeys(obj).length === 0
  }

  /**
   * 检查对象是否不为空
   * @param obj 要检查的对象
   * @returns 是否不为空
   */
  static isNotEmpty(obj: unknown): boolean {
    return !this.isEmpty(obj)
  }

  /**
   * 深度克隆对象
   * @param obj 要克隆的对象
   * @returns 克隆后的对象
   */
  static deepClone<T>(obj: T): T {
    return cloneValue(obj, new WeakMap())
  }

  /**
   * 浅克隆对象
   * @param obj 要克隆的对象
   * @returns 克隆后的对象
   */
  static shallowClone<T>(obj: T): T {
    if (!isObjectLike(obj)) {
      return obj
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as T
    }

    if (obj instanceof RegExp) {
      return new RegExp(obj.source, obj.flags) as T
    }

    if (obj instanceof Map) {
      return new Map(obj) as T
    }

    if (obj instanceof Set) {
      return new Set(obj) as T
    }

    if (Array.isArray(obj)) {
      return [...obj] as T
    }

    return { ...(obj as Record<string, unknown>) } as T
  }

  /**
   * 合并对象
   * @param target 目标对象
   * @param sources 源对象数组
   * @returns 合并后的对象
   */
  static merge<T extends Record<string, unknown>>(target: T, ...sources: Partial<T>[]): T {
    return sources.reduce((result, source) => ({ ...result, ...source }), { ...target }) as T
  }

  /**
   * 深度合并对象
   * @param target 目标对象
   * @param sources 源对象数组
   * @returns 深度合并后的对象
   */
  static deepMerge<T extends Record<string, unknown>>(target: T, ...sources: Partial<T>[]): T {
    const output: Record<string, unknown> = this.deepClone(target)

    for (const source of sources) {
      if (!this.isObject(source)) {
        continue
      }

      for (const [key, value] of Object.entries(source)) {
        const currentValue = output[key]

        if (value === undefined) {
          continue
        }

        if (this.isObject(currentValue) && this.isObject(value)) {
          output[key] = this.deepMerge(currentValue, value)
          continue
        }

        output[key] = this.deepClone(value)
      }
    }

    return output as T
  }

  /**
   * 检查是否为对象
   * @param item 要检查的项
   * @returns 是否为对象
   */
  static isObject(item: unknown): item is Record<string, unknown> {
    return isPlainObject(item)
  }

  /**
   * 获取对象的属性值（支持点号路径和数组索引）
   * @param obj 对象
   * @param path 属性路径，如 'a.b[0].c'
   * @param defaultValue 默认值
   * @returns 属性值
   */
  static get<T = unknown, D = undefined>(
    obj: unknown,
    path: string | PathSegment[],
    defaultValue?: D
  ): T | D {
    const segments = toPathSegments(path)
    if (segments.length === 0) {
      return (obj as T) ?? (defaultValue as D)
    }

    let current: unknown = obj
    for (const segment of segments) {
      if (current == null || !isObjectLike(current)) {
        return defaultValue as D
      }

      current = (current as Record<string | number, unknown>)[segment]
    }

    return current === undefined ? (defaultValue as D) : (current as T)
  }

  /**
   * 设置对象的属性值（支持点号路径和数组索引）
   * @param obj 对象
   * @param path 属性路径，如 'a.b[0].c'
   * @param value 要设置的值
   * @returns 修改后的对象
   */
  static set<T extends Record<string, unknown> | unknown[]>(
    obj: T,
    path: string | PathSegment[],
    value: unknown
  ): T {
    const segments = toPathSegments(path)
    if (segments.length === 0 || !isObjectLike(obj)) {
      return obj
    }

    let current: Record<string | number, unknown> | unknown[] = obj

    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1
      if (isLast) {
        ;(current as Record<string | number, unknown>)[segment] = value
        return
      }

      const nextSegment = segments[index + 1]
      const nextValue = (current as Record<string | number, unknown>)[segment]

      if (!isObjectLike(nextValue) && nextSegment !== undefined) {
        ;(current as Record<string | number, unknown>)[segment] =
          getContainerForNextSegment(nextSegment)
      }

      current = (current as Record<string | number, unknown>)[segment] as
        | Record<string | number, unknown>
        | unknown[]
    })

    return obj
  }

  /**
   * 判断对象是否有指定属性
   * @param obj 对象
   * @param path 属性路径，如 'a.b[0].c'
   * @returns 是否有该属性
   */
  static has(obj: unknown, path: string | PathSegment[]): boolean {
    const segments = toPathSegments(path)
    if (segments.length === 0) {
      return obj !== undefined
    }

    let current: unknown = obj
    for (const segment of segments) {
      if (current == null || !isObjectLike(current) || !(segment in current)) {
        return false
      }

      current = (current as Record<string | number, unknown>)[segment]
    }

    return true
  }

  /**
   * 删除对象的属性（支持点号路径和数组索引）
   * @param obj 对象
   * @param path 属性路径，如 'a.b[0].c'
   * @returns 是否删除成功
   */
  static unset(obj: unknown, path: string | PathSegment[]): boolean {
    const segments = toPathSegments(path)
    if (segments.length === 0 || !isObjectLike(obj)) {
      return false
    }

    const lastSegment = segments[segments.length - 1]
    const parent = segments.length === 1 ? obj : this.get(obj, segments.slice(0, -1))

    if (lastSegment === undefined || parent == null || !isObjectLike(parent) || !(lastSegment in parent)) {
      return false
    }

    if (Array.isArray(parent) && typeof lastSegment === 'number') {
      parent.splice(lastSegment, 1)
      return true
    }

    delete (parent as Record<string | number, unknown>)[lastSegment]
    return true
  }

  /**
   * 获取对象的所有键
   * @param obj 对象
   * @returns 键数组
   */
  static keys<T extends object>(obj: T | null | undefined): string[] {
    if (obj == null) {
      return []
    }
    return Object.keys(obj)
  }

  /**
   * 获取对象的所有值
   * @param obj 对象
   * @returns 值数组
   */
  static values<T extends object>(obj: T | null | undefined): Array<T[keyof T]> {
    if (obj == null) {
      return []
    }
    return Object.values(obj) as Array<T[keyof T]>
  }

  /**
   * 获取对象的键值对数组
   * @param obj 对象
   * @returns 键值对数组
   */
  static entries<T extends object>(obj: T | null | undefined): [string, T[keyof T]][] {
    if (obj == null) {
      return []
    }
    return Object.entries(obj) as [string, T[keyof T]][]
  }

  /**
   * 从键值对数组创建对象
   * @param entries 键值对数组
   * @returns 对象
   */
  static fromEntries<V>(entries: [string, V][]): Record<string, V> {
    return Object.fromEntries(entries)
  }

  /**
   * 挑选对象的指定属性
   * @param obj 对象
   * @param keys 要挑选的键数组
   * @returns 新对象
   */
  static pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key]
      }
    }
    return result
  }

  /**
   * 排除对象的指定属性
   * @param obj 对象
   * @param keys 要排除的键数组
   * @returns 新对象
   */
  static omit<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj } as Omit<T, K> & Record<string, unknown>
    for (const key of keys) {
      delete result[key as string]
    }
    return result
  }

  /**
   * 将对象转换为查询字符串
   * @param obj 对象
   * @returns 查询字符串
   */
  static toQueryString(obj: Record<string, unknown>): string {
    const params = new URLSearchParams()

    for (const [key, value] of this.entries(obj)) {
      if (value === null || value === undefined) {
        continue
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== null && item !== undefined) {
            params.append(key, String(item))
          }
        })
        continue
      }

      params.append(key, String(value))
    }

    return params.toString()
  }

  /**
   * 将查询字符串转换为对象
   * @param queryString 查询字符串
   * @returns 对象
   */
  static fromQueryString(queryString: string): Record<string, string | string[]> {
    const normalized = queryString.startsWith('?') ? queryString.slice(1) : queryString
    const params = new URLSearchParams(normalized)
    const result: Record<string, string | string[]> = {}

    params.forEach((value, key) => {
      const current = result[key]
      if (current === undefined) {
        result[key] = value
        return
      }

      result[key] = Array.isArray(current) ? [...current, value] : [current, value]
    })

    return result
  }

  /**
   * 比较两个对象是否相等（深度比较）
   * @param obj1 对象1
   * @param obj2 对象2
   * @returns 是否相等
   */
  static isEqual(obj1: unknown, obj2: unknown): boolean {
    if (Object.is(obj1, obj2)) {
      return true
    }

    if (typeof obj1 !== typeof obj2 || obj1 == null || obj2 == null) {
      return false
    }

    if (obj1 instanceof Date && obj2 instanceof Date) {
      return obj1.getTime() === obj2.getTime()
    }

    if (obj1 instanceof RegExp && obj2 instanceof RegExp) {
      return obj1.source === obj2.source && obj1.flags === obj2.flags
    }

    if (obj1 instanceof Map && obj2 instanceof Map) {
      if (obj1.size !== obj2.size) {
        return false
      }

      for (const [key, value] of obj1) {
        if (!obj2.has(key) || !this.isEqual(value, obj2.get(key))) {
          return false
        }
      }

      return true
    }

    if (obj1 instanceof Set && obj2 instanceof Set) {
      if (obj1.size !== obj2.size) {
        return false
      }

      for (const value of obj1) {
        if (!obj2.has(value)) {
          return false
        }
      }

      return true
    }

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) {
        return false
      }

      return obj1.every((value, index) => this.isEqual(value, obj2[index]))
    }

    if (!isObjectLike(obj1) || !isObjectLike(obj2)) {
      return false
    }

    const keys1 = Reflect.ownKeys(obj1)
    const keys2 = Reflect.ownKeys(obj2)
    if (keys1.length !== keys2.length) {
      return false
    }

    return keys1.every(
      (key) =>
        keys2.includes(key) &&
        this.isEqual(
          (obj1 as Record<ObjectKey, unknown>)[key],
          (obj2 as Record<ObjectKey, unknown>)[key]
        )
    )
  }

  /**
   * 扁平化对象
   * @param obj 对象
   * @param prefix 前缀
   * @param separator 分隔符，默认为'.'
   * @returns 扁平化后的对象
   */
  static flatten(obj: unknown, prefix = '', separator = '.'): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    if (!isObjectLike(obj)) {
      if (prefix) {
        result[prefix] = obj
      }
      return result
    }

    if (Array.isArray(obj)) {
      obj.forEach((value, index) => {
        const newKey = prefix ? `${prefix}${separator}${index}` : String(index)
        if (isPlainObject(value) || Array.isArray(value)) {
          Object.assign(result, this.flatten(value, newKey, separator))
        } else {
          result[newKey] = value
        }
      })
      return result
    }

    for (const [key, value] of this.entries(obj)) {
      const newKey = prefix ? `${prefix}${separator}${key}` : key

      if (isPlainObject(value) || Array.isArray(value)) {
        Object.assign(result, this.flatten(value, newKey, separator))
      } else {
        result[newKey] = value
      }
    }

    return result
  }

  /**
   * 反扁平化对象
   * @param obj 扁平化的对象
   * @param separator 分隔符，默认为'.'
   * @returns 反扁平化后的对象
   */
  static unflatten(
    obj: Record<string, unknown>,
    separator = '.'
  ): Record<string, unknown> | unknown[] {
    const firstKey = this.keys(obj)[0]
    const firstPath = firstKey ? splitFlattenKey(firstKey, separator) : []
    const result: Record<string, unknown> | unknown[] = typeof firstPath[0] === 'number' ? [] : {}

    for (const [key, value] of this.entries(obj)) {
      this.set(result, splitFlattenKey(key, separator), value)
    }

    return result
  }

  /**
   * 重命名对象的键
   * @param obj 对象
   * @param keyMap 键映射对象，如 { oldKey: 'newKey' }
   * @returns 重命名后的对象
   */
  static renameKeys<T extends Record<string, unknown>>(obj: T, keyMap: Record<string, string>): T {
    const result = {} as T

    for (const [key, value] of this.entries(obj)) {
      const newKey = keyMap[key] || key
      ;(result as Record<string, unknown>)[newKey] = value
    }

    return result
  }

  /**
   * 过滤对象的属性
   * @param obj 对象
   * @param predicate 过滤函数
   * @returns 过滤后的对象
   */
  static filter<T extends Record<string, unknown>>(
    obj: T,
    predicate: (value: T[keyof T], key: keyof T) => boolean
  ): Partial<T> {
    const result = {} as Partial<T>

    for (const [key, value] of this.entries(obj)) {
      if (predicate(value, key)) {
        result[key as keyof T] = value
      }
    }

    return result
  }

  /**
   * 映射对象的值
   * @param obj 对象
   * @param mapper 映射函数
   * @returns 映射后的对象
   */
  static mapValues<T extends Record<string, unknown>, R>(
    obj: T,
    mapper: (value: T[keyof T], key: keyof T) => R
  ): Record<keyof T, R> {
    const result = {} as Record<keyof T, R>

    for (const [key, value] of this.entries(obj)) {
      result[key as keyof T] = mapper(value, key)
    }

    return result
  }

  /**
   * 映射对象的键
   * @param obj 对象
   * @param mapper 映射函数
   * @returns 映射后的对象
   */
  static mapKeys<T extends Record<string, unknown>>(
    obj: T,
    mapper: (key: keyof T, value: T[keyof T]) => string
  ): Record<string, T[keyof T]> {
    const result = {} as Record<string, T[keyof T]>

    for (const [key, value] of this.entries(obj)) {
      result[mapper(key, value)] = value
    }

    return result
  }

  /**
   * 检查对象是否有指定的属性
   * @param obj 对象
   * @param predicate 检查函数
   * @returns 是否有满足条件的属性
   */
  static some<T extends Record<string, unknown>>(
    obj: T,
    predicate: (value: T[keyof T], key: keyof T) => boolean
  ): boolean {
    for (const [key, value] of this.entries(obj)) {
      if (predicate(value, key)) {
        return true
      }
    }
    return false
  }

  /**
   * 检查对象是否所有属性都满足条件
   * @param obj 对象
   * @param predicate 检查函数
   * @returns 是否所有属性都满足条件
   */
  static every<T extends Record<string, unknown>>(
    obj: T,
    predicate: (value: T[keyof T], key: keyof T) => boolean
  ): boolean {
    for (const [key, value] of this.entries(obj)) {
      if (!predicate(value, key)) {
        return false
      }
    }
    return true
  }

  /**
   * 反转对象的键和值
   * @param obj 对象
   * @returns 反转后的对象
   */
  static invert<T extends Record<string, string | number>>(obj: T): Record<string, keyof T> {
    const result = {} as Record<string, keyof T>

    for (const [key, value] of this.entries(obj)) {
      result[String(value)] = key
    }

    return result
  }

  /**
   * 获取对象的属性数量
   * @param obj 对象
   * @returns 属性数量
   */
  static size(obj: unknown): number {
    if (obj == null) {
      return 0
    }

    if (typeof obj === 'string' || Array.isArray(obj)) {
      return obj.length
    }

    if (obj instanceof Map || obj instanceof Set) {
      return obj.size
    }

    if (!isObjectLike(obj)) {
      return 0
    }

    return Reflect.ownKeys(obj).length
  }
}

// 导出默认实例
export default ObjectUtils
