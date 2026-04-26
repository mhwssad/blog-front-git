/**
 * 数组工具类
 * 提供常用的数组操作方法
 */

/**
 * 数组工具类
 */
export class ArrayUtils {
  /**
   * 检查数组是否为空
   * @param array 要检查的数组
   * @returns 是否为空
   */
  static isEmpty<T>(array: T[]): boolean {
    return !array || array.length === 0
  }

  /**
   * 检查数组是否不为空
   * @param array 要检查的数组
   * @returns 是否不为空
   */
  static isNotEmpty<T>(array: T[]): boolean {
    return !this.isEmpty(array)
  }

  /**
   * 获取数组的第一个元素
   * @param array 数组
   * @returns 第一个元素或undefined
   */
  static first<T>(array: T[]): T | undefined {
    return this.isEmpty(array) ? undefined : array[0]
  }

  /**
   * 获取数组的最后一个元素
   * @param array 数组
   * @returns 最后一个元素或undefined
   */
  static last<T>(array: T[]): T | undefined {
    return this.isEmpty(array) ? undefined : array[array.length - 1]
  }

  /**
   * 获取数组的第n个元素
   * @param array 数组
   * @param index 索引（从0开始）
   * @returns 指定索引的元素或undefined
   */
  static nth<T>(array: T[], index: number): T | undefined {
    if (this.isEmpty(array) || index < 0 || index >= array.length) {
      return undefined
    }
    return array[index]
  }

  /**
   * 移除数组中的重复元素
   * @param array 数组
   * @returns 去重后的数组
   */
  static unique<T>(array: T[]): T[] {
    return Array.from(new Set(array))
  }

  /**
   * 根据指定属性移除数组中的重复元素
   * @param array 数组
   * @param key 属性名或函数
   * @returns 去重后的数组
   */
  static uniqueBy<T, K extends PropertyKey | undefined>(
    array: T[],
    key: keyof T | ((item: T) => K)
  ): T[] {
    const seen = new Set<K | T[keyof T]>()
    return array.filter((item) => {
      const value = typeof key === 'function' ? key(item) : item[key]
      if (seen.has(value)) {
        return false
      }
      seen.add(value)
      return true
    })
  }

  /**
   * 将数组分组
   * @param array 数组
   * @param key 分组键或函数
   * @returns 分组后的对象
   */
  static groupBy<T, K extends PropertyKey>(
    array: T[],
    key: ((item: T) => K) | keyof T
  ): Record<K, T[]> {
    return array.reduce(
      (groups, item) => {
        const groupKey = typeof key === 'function' ? key(item) : (item[key] as unknown as K)
        if (!groups[groupKey]) {
          groups[groupKey] = []
        }
        groups[groupKey].push(item)
        return groups
      },
      {} as Record<K, T[]>
    )
  }

  /**
   * 数组分块
   * @param array 数组
   * @param size 每块的大小
   * @returns 分块后的二维数组
   */
  static chunk<T>(array: T[], size: number): T[][] {
    if (size <= 0) {
      throw new Error('分块大小必须大于0')
    }

    const result: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size))
    }
    return result
  }

  /**
   * 数组扁平化
   * @param array 数组
   * @param depth 扁平化深度，默认为1
   * @returns 扁平化后的数组
   */
  static flatten<T>(array: Array<T | unknown[]>, depth = 1): T[] {
    return depth > 0
      ? array.reduce<T[]>((acc, val) => {
          if (Array.isArray(val)) {
            return acc.concat(this.flatten<T>(val as Array<T | unknown[]>, depth - 1))
          }
          return acc.concat(val)
        }, [])
      : (array.slice() as T[])
  }

  /**
   * 完全扁平化数组
   * @param array 数组
   * @returns 完全扁平化后的数组
   */
  static flattenDeep<T>(array: Array<T | unknown[]>): T[] {
    return this.flatten<T>(array, Infinity)
  }

  /**
   * 数组差集（a中有b中没有的元素）
   * @param array 第一个数组
   * @param excludeArray 要排除的数组
   * @returns 差集数组
   */
  static difference<T>(array: T[], excludeArray: T[]): T[] {
    return array.filter((item) => !excludeArray.includes(item))
  }

  /**
   * 数组交集（两个数组都有的元素）
   * @param array1 第一个数组
   * @param array2 第二个数组
   * @returns 交集数组
   */
  static intersection<T>(array1: T[], array2: T[]): T[] {
    return array1.filter((item) => array2.includes(item))
  }

  /**
   * 数组并集（合并两个数组并去重）
   * @param array1 第一个数组
   * @param array2 第二个数组
   * @returns 并集数组
   */
  static union<T>(array1: T[], array2: T[]): T[] {
    return this.unique([...array1, ...array2])
  }

  /**
   * 从数组中随机获取n个元素
   * @param array 数组
   * @param count 获取的元素数量，默认为1
   * @returns 随机元素数组
   */
  static sample<T>(array: T[], count = 1): T[] {
    if (this.isEmpty(array)) {
      return []
    }

    if (count >= array.length) {
      return [...array]
    }

    const shuffled = this.shuffle([...array])
    return shuffled.slice(0, count)
  }

  /**
   * 随机打乱数组
   * @param array 数组
   * @returns 打乱后的新数组
   */
  static shuffle<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j]!, result[i]!]
    }
    return result
  }

  /**
   * 检查数组是否包含指定元素
   * @param array 数组
   * @param item 要检查的元素
   * @param fromIndex 起始索引，默认为0
   * @returns 是否包含
   */
  static contains<T>(array: T[], item: T, fromIndex = 0): boolean {
    return array.indexOf(item, fromIndex) !== -1
  }

  /**
   * 检查数组是否包含所有指定元素
   * @param array 数组
   * @param items 要检查的元素数组
   * @returns 是否包含所有元素
   */
  static containsAll<T>(array: T[], items: T[]): boolean {
    return items.every((item) => this.contains(array, item))
  }

  /**
   * 检查数组是否包含任意一个指定元素
   * @param array 数组
   * @param items 要检查的元素数组
   * @returns 是否包含任意一个元素
   */
  static containsAny<T>(array: T[], items: T[]): boolean {
    return items.some((item) => this.contains(array, item))
  }

  /**
   * 数组求和
   * @param array 数字数组
   * @param iteratee 迭代函数，用于从对象中提取数值
   * @returns 总和
   */
  static sum<T>(array: T[], iteratee?: (item: T) => number): number {
    if (this.isEmpty(array)) {
      return 0
    }

    return array.reduce((sum, item) => {
      const value = iteratee ? iteratee(item) : (item as number)
      return sum + (Number(value) || 0)
    }, 0)
  }

  /**
   * 数组求平均值
   * @param array 数字数组
   * @param iteratee 迭代函数，用于从对象中提取数值
   * @returns 平均值
   */
  static average<T>(array: T[], iteratee?: (item: T) => number): number {
    if (this.isEmpty(array)) {
      return 0
    }

    return this.sum(array, iteratee) / array.length
  }

  /**
   * 获取数组中的最大值
   * @param array 数字数组
   * @param iteratee 迭代函数，用于从对象中提取数值
   * @returns 最大值
   */
  static max<T>(array: T[], iteratee?: (item: T) => number): T | undefined {
    if (this.isEmpty(array)) {
      return undefined
    }

    return array.reduce((max, item) => {
      const maxValue = iteratee ? iteratee(max) : (max as number)
      const itemValue = iteratee ? iteratee(item) : (item as number)
      return itemValue > maxValue ? item : max
    })
  }

  /**
   * 获取数组中的最小值
   * @param array 数字数组
   * @param iteratee 迭代函数，用于从对象中提取数值
   * @returns 最小值
   */
  static min<T>(array: T[], iteratee?: (item: T) => number): T | undefined {
    if (this.isEmpty(array)) {
      return undefined
    }

    return array.reduce((min, item) => {
      const minValue = iteratee ? iteratee(min) : (min as number)
      const itemValue = iteratee ? iteratee(item) : (item as number)
      return itemValue < minValue ? item : min
    })
  }

  /**
   * 根据指定属性对数组进行排序
   * @param array 数组
   * @param key 排序键或函数
   * @param order 排序顺序，'asc'升序，'desc'降序，默认为'asc'
   * @returns 排序后的新数组
   */
  static sortBy<T, K extends T[keyof T]>(
    array: T[],
    key: keyof T | ((item: T) => K),
    order: 'asc' | 'desc' = 'asc'
  ): T[] {
    return [...array].sort((a, b) => {
      const aValue = typeof key === 'function' ? key(a) : a[key]
      const bValue = typeof key === 'function' ? key(b) : b[key]

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
   * 移除数组中满足条件的元素
   * @param array 数组
   * @param predicate 条件函数
   * @returns 移除元素后的新数组
   */
  static remove<T>(array: T[], predicate: (item: T, index: number) => boolean): T[] {
    return array.filter((item, index) => !predicate(item, index))
  }

  /**
   * 移除数组中指定的元素
   * @param array 数组
   * @param item 要移除的元素
   * @returns 移除元素后的新数组
   */
  static removeItem<T>(array: T[], item: T): T[] {
    return this.remove(array, (element) => element === item)
  }

  /**
   * 移除数组中指定索引的元素
   * @param array 数组
   * @param index 要移除的索引
   * @returns 移除元素后的新数组
   */
  static removeAt<T>(array: T[], index: number): T[] {
    if (index < 0 || index >= array.length) {
      return [...array]
    }
    return [...array.slice(0, index), ...array.slice(index + 1)]
  }

  /**
   * 在指定位置插入元素
   * @param array 数组
   * @param index 插入位置
   * @param items 要插入的元素
   * @returns 插入元素后的新数组
   */
  static insertAt<T>(array: T[], index: number, ...items: T[]): T[] {
    if (index < 0) {
      index = 0
    } else if (index > array.length) {
      index = array.length
    }

    return [...array.slice(0, index), ...items, ...array.slice(index)]
  }

  /**
   * 替换指定位置的元素
   * @param array 数组
   * @param index 替换位置
   * @param item 新元素
   * @returns 替换后的新数组
   */
  static replaceAt<T>(array: T[], index: number, item: T): T[] {
    if (index < 0 || index >= array.length) {
      return [...array]
    }

    const result = [...array]
    result[index] = item
    return result
  }

  /**
   * 交换数组中两个位置的元素
   * @param array 数组
   * @param index1 第一个位置
   * @param index2 第二个位置
   * @returns 交换后的新数组
   */
  static swap<T>(array: T[], index1: number, index2: number): T[] {
    if (index1 < 0 || index1 >= array.length || index2 < 0 || index2 >= array.length) {
      return [...array]
    }

    const result = [...array]
    ;[result[index1], result[index2]] = [result[index2]!, result[index1]!]
    return result
  }

  /**
   * 将树形结构数组扁平化
   * @param array 树形结构数组
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 扁平化后的数组
   */
  static flattenTree<T extends Record<string, unknown>>(
    array: T[],
    childrenKey: string = 'children'
  ): T[] {
    const result: T[] = []

    const traverse = (items: T[]) => {
      for (const item of items) {
        result.push(item)
        if (item[childrenKey] && Array.isArray(item[childrenKey])) {
          traverse(item[childrenKey])
        }
      }
    }

    traverse(array)
    return result
  }

  /**
   * 将扁平数组转换为树形结构
   * @param array 扁平数组
   * @param options 配置选项
   * @returns 树形结构数组
   */
  static toTree<T extends Record<string, unknown>>(
    array: T[],
    options: {
      idKey?: string
      parentIdKey?: string
      childrenKey?: string
      rootId?: unknown
    } = {}
  ): T[] {
    const {
      idKey = 'id',
      parentIdKey = 'parentId',
      childrenKey = 'children',
      rootId = null
    } = options

    const map = new Map<unknown, T & Record<string, unknown[]>>()
    const tree: T[] = []

    // 创建映射
    array.forEach((item) => {
      map.set(item[idKey], { ...item, [childrenKey]: [] })
    })

    // 构建树
    map.forEach((item) => {
      const parentId = item[parentIdKey]
      if (parentId === rootId || parentId === undefined || parentId === null) {
        tree.push(item)
      } else {
        const parent = map.get(parentId)
        if (parent) {
          const children = parent[childrenKey]
          if (Array.isArray(children)) {
            children.push(item)
          } else {
            ;(parent as Record<string, unknown>)[childrenKey] = [item]
          }
        }
      }
    })

    return tree
  }

  /**
   * 数组分页
   * @param array 数组
   * @param page 页码，从1开始
   * @param pageSize 每页大小
   * @returns 分页结果
   */
  static paginate<T>(
    array: T[],
    page: number,
    pageSize: number
  ): {
    data: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  } {
    const total = array.length
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const data = array.slice(startIndex, endIndex)

    return {
      data,
      total,
      page,
      pageSize,
      totalPages
    }
  }

  /**
   * 创建指定范围的数字数组
   * @param start 起始值
   * @param end 结束值（不包含）
   * @param step 步长，默认为1
   * @returns 数字数组
   */
  static range(start: number, end: number, step = 1): number[] {
    const result: number[] = []

    if (step === 0) {
      throw new Error('步长不能为0')
    }

    if ((step > 0 && start >= end) || (step < 0 && start <= end)) {
      return result
    }

    for (let i = start; step > 0 ? i < end : i > end; i += step) {
      result.push(i)
    }

    return result
  }

  /**
   * 创建指定长度的数组，并用指定值填充
   * @param length 数组长度
   * @param value 填充值或函数
   * @returns 填充后的数组
   */
  static fill<T>(length: number, value: T | ((index: number) => T)): T[] {
    return Array.from({ length }, (_, index) =>
      typeof value === 'function' ? (value as (index: number) => T)(index) : value
    )
  }

  /**
   * 数组元素计数
   * @param array 数组
   * @param predicate 计数条件函数或值
   * @returns 符合条件的元素数量
   */
  static count<T>(array: T[], predicate: ((item: T) => boolean) | T): number {
    if (typeof predicate === 'function') {
      const func = predicate as (item: T) => boolean
      return array.filter(func).length
    } else {
      return array.filter((item) => item === predicate).length
    }
  }

  /**
   * 数组元素分组计数
   * @param array 数组
   * @param key 分组键或函数
   * @returns 分组计数对象
   */
  static countBy<T, K extends string | number | symbol>(
    array: T[],
    key: ((item: T) => K) | keyof T
  ): Record<K, number> {
    const result = {} as Record<K, number>

    array.forEach((item) => {
      let groupKey: K
      if (typeof key === 'function') {
        groupKey = key(item)
      } else {
        groupKey = item[key] as unknown as K
      }
      result[groupKey] = (result[groupKey] || 0) + 1
    })

    return result
  }
}

// 导出默认实例
export default ArrayUtils
