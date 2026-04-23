/**
 * 树结构工具类
 * 提供常用的树形结构操作方法
 */

import ObjectUtils from './objectUtils'

type TreeRecord = Record<string, unknown>

function createCopyId(existingIds: Set<string>, originalId: unknown): string {
  const baseId = `${String(originalId)}_copy`
  let index = 1
  let nextId = `${baseId}_${index}`

  while (existingIds.has(nextId)) {
    index += 1
    nextId = `${baseId}_${index}`
  }

  existingIds.add(nextId)
  return nextId
}

/**
 * 树节点类型接口
 */
export interface TreeNode {
  [key: string]: unknown
}

/**
 * 树配置选项接口
 */
export interface TreeOptions {
  idKey?: string
  parentIdKey?: string
  childrenKey?: string
  labelKey?: string
}

/**
 * 树工具类
 */
export class TreeUtils {
  /**
   * 将扁平数组转换为树形结构
   * @param array 扁平数组
   * @param options 配置选项
   * @returns 树形结构数组
   */
  static toTree<T extends TreeRecord>(array: T[], options: TreeOptions = {}): T[] {
    const { idKey = 'id', parentIdKey = 'parentId', childrenKey = 'children' } = options

    const map = new Map<unknown, T & Record<string, unknown>>()
    const tree: T[] = []

    // 创建映射
    array.forEach((item) => {
      map.set(item[idKey], { ...item, [childrenKey]: [] })
    })

    // 构建树
    map.forEach((item) => {
      const parentId = item[parentIdKey]
      if (parentId === null || parentId === undefined || !map.has(parentId)) {
        tree.push(item as T)
      } else {
        const parent = map.get(parentId)
        if (parent) {
          ;(parent[childrenKey] as T[]).push(item as T)
        }
      }
    })

    return tree
  }

  /**
   * 将树形结构扁平化为数组
   * @param tree 树形结构数组
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 扁平化后的数组
   */
  static flatten<T extends TreeRecord>(tree: T[], childrenKey: string = 'children'): T[] {
    const result: T[] = []

    const traverse = (nodes: T[]) => {
      for (const node of nodes) {
        result.push(node)
        if (node[childrenKey] && Array.isArray(node[childrenKey])) {
          traverse(node[childrenKey])
        }
      }
    }

    traverse(tree)
    return result
  }

  /**
   * 在树中查找指定节点
   * @param tree 树形结构数组
   * @param predicate 查找条件函数
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 找到的节点或undefined
   */
  static find<T extends TreeRecord>(
    tree: T[],
    predicate: (node: T) => boolean,
    childrenKey: string = 'children',
  ): T | undefined {
    for (const node of tree) {
      if (predicate(node)) {
        return node
      }
      if (node[childrenKey] && Array.isArray(node[childrenKey])) {
        const found = this.find(node[childrenKey], predicate, childrenKey)
        if (found) {
          return found
        }
      }
    }
    return undefined
  }

  /**
   * 根据ID查找节点
   * @param tree 树形结构数组
   * @param id 要查找的ID
   * @param idKey ID属性名，默认为'id'
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 找到的节点或undefined
   */
  static findById<T extends TreeRecord>(
    tree: T[],
    id: unknown,
    idKey: string = 'id',
    childrenKey: string = 'children',
  ): T | undefined {
    return this.find(tree, (node) => node[idKey] === id, childrenKey)
  }

  /**
   * 在树中过滤节点
   * @param tree 树形结构数组
   * @param predicate 过滤条件函数
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 过滤后的树形结构数组
   */
  static filter<T extends TreeRecord>(
    tree: T[],
    predicate: (node: T) => boolean,
    childrenKey: string = 'children',
  ): T[] {
    const result: T[] = []

    for (const node of tree) {
      if (predicate(node)) {
        const newNode: T = { ...node }
        if (node[childrenKey] && Array.isArray(node[childrenKey])) {
          const newNodeRecord = newNode as Record<string, unknown>
          newNodeRecord[childrenKey] = this.filter(node[childrenKey] as T[], predicate, childrenKey)
        }
        result.push(newNode)
      }
    }

    return result
  }

  /**
   * 遍历树中的所有节点
   * @param tree 树形结构数组
   * @param callback 回调函数
   * @param childrenKey 子节点属性名，默认为'children'
   */
  static traverse<T extends TreeRecord>(
    tree: T[],
    callback: (node: T, parent?: T) => void,
    childrenKey: string = 'children',
  ): void {
    const traverseNode = (nodes: T[], parent?: T) => {
      for (const node of nodes) {
        callback(node, parent)
        if (node[childrenKey] && Array.isArray(node[childrenKey])) {
          traverseNode(node[childrenKey], node)
        }
      }
    }

    traverseNode(tree)
  }

  /**
   * 映射树中的所有节点
   * @param tree 树形结构数组
   * @param mapper 映射函数
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 映射后的新树
   */
  static map<T extends TreeRecord, R extends TreeRecord>(
    tree: T[],
    mapper: (node: T) => R,
    childrenKey: string = 'children',
  ): R[] {
    return tree.map((node) => {
      const newNode = mapper(node) as R
      if (node[childrenKey] && Array.isArray(node[childrenKey])) {
        const newNodeRecord = newNode as Record<string, unknown>
        newNodeRecord[childrenKey] = this.map(node[childrenKey] as T[], mapper, childrenKey)
      }
      return newNode
    })
  }

  /**
   * 获取树中所有节点的ID数组
   * @param tree 树形结构数组
   * @param idKey ID属性名，默认为'id'
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns ID数组
   */
  static getIds<T extends TreeRecord>(
    tree: T[],
    idKey: string = 'id',
    childrenKey: string = 'children',
  ): unknown[] {
    const ids: unknown[] = []
    this.traverse(
      tree,
      (node) => {
        ids.push(node[idKey])
      },
      childrenKey,
    )
    return ids
  }

  /**
   * 获取树的所有叶子节点
   * @param tree 树形结构数组
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 叶子节点数组
   */
  static getLeaves<T extends TreeRecord>(tree: T[], childrenKey: string = 'children'): T[] {
    const leaves: T[] = []

    this.traverse(
      tree,
      (node) => {
        if (
          !node[childrenKey] ||
          !Array.isArray(node[childrenKey]) ||
          node[childrenKey].length === 0
        ) {
          leaves.push(node)
        }
      },
      childrenKey,
    )

    return leaves
  }

  /**
   * 获取树的深度
   * @param tree 树形结构数组
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 树的深度
   */
  static getDepth<T extends TreeRecord>(tree: T[], childrenKey: string = 'children'): number {
    if (tree.length === 0) {
      return 0
    }

    let maxDepth = 0

    const traverse = (nodes: T[], depth: number) => {
      maxDepth = Math.max(maxDepth, depth)
      for (const node of nodes) {
        if (node[childrenKey] && Array.isArray(node[childrenKey])) {
          traverse(node[childrenKey], depth + 1)
        }
      }
    }

    traverse(tree, 1)
    return maxDepth
  }

  /**
   * 获取节点在树中的路径（从根节点到当前节点）
   * @param tree 树形结构数组
   * @param targetId 目标节点ID
   * @param idKey ID属性名，默认为'id'
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 路径节点数组
   */
  static getPath<T extends TreeRecord>(
    tree: T[],
    targetId: unknown,
    idKey: string = 'id',
    childrenKey: string = 'children',
  ): T[] {
    const path: T[] = []

    const findPath = (nodes: T[], currentPath: T[]): boolean => {
      for (const node of nodes) {
        const newPath = [...currentPath, node]
        if (node[idKey] === targetId) {
          path.push(...newPath)
          return true
        }
        if (node[childrenKey] && Array.isArray(node[childrenKey])) {
          if (findPath(node[childrenKey], newPath)) {
            return true
          }
        }
      }
      return false
    }

    findPath(tree, [])
    return path
  }

  /**
   * 获取节点的所有祖先节点（不包括当前节点）
   * @param tree 树形结构数组
   * @param targetId 目标节点ID
   * @param idKey ID属性名，默认为'id'
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 祖先节点数组
   */
  static getAncestors<T extends TreeRecord>(
    tree: T[],
    targetId: unknown,
    idKey: string = 'id',
    childrenKey: string = 'children',
  ): T[] {
    const path = this.getPath(tree, targetId, idKey, childrenKey)
    return path.slice(0, -1)
  }

  /**
   * 获取节点的所有子孙节点（不包括当前节点）
   * @param node 节点
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 子孙节点数组
   */
  static getDescendants<T extends TreeRecord>(node: T, childrenKey: string = 'children'): T[] {
    const descendants: T[] = []

    const traverse = (n: T) => {
      if (n[childrenKey] && Array.isArray(n[childrenKey])) {
        for (const child of n[childrenKey]) {
          descendants.push(child)
          traverse(child)
        }
      }
    }

    traverse(node)
    return descendants
  }

  /**
   * 获取节点的所有子节点（只包括直接子节点）
   * @param node 节点
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 子节点数组
   */
  static getChildren<T extends TreeRecord>(node: T, childrenKey: string = 'children'): T[] {
    return (node[childrenKey] as T[]) || []
  }

  /**
   * 获取节点的父节点
   * @param tree 树形结构数组
   * @param targetId 目标节点ID
   * @param idKey ID属性名，默认为'id'
   * @param parentIdKey 父ID属性名，默认为'parentId'
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 父节点或undefined
   */
  static getParent<T extends TreeRecord>(
    tree: T[],
    targetId: unknown,
    idKey: string = 'id',
    childrenKey: string = 'children',
  ): T | undefined {
    let parent: T | undefined

    this.traverse(
      tree,
      (node) => {
        if (node[childrenKey] && Array.isArray(node[childrenKey])) {
          for (const child of node[childrenKey]) {
            if (child[idKey] === targetId) {
              parent = node
              return
            }
          }
        }
      },
      childrenKey,
    )

    return parent
  }

  /**
   * 获取节点的兄弟节点（包括自己）
   * @param tree 树形结构数组
   * @param targetId 目标节点ID
   * @param idKey ID属性名，默认为'id'
   * @param parentIdKey 父ID属性名，默认为'parentId'
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 兄弟节点数组
   */
  static getSiblings<T extends TreeRecord>(
    tree: T[],
    targetId: unknown,
    idKey: string = 'id',
    parentIdKey: string = 'parentId',
    childrenKey: string = 'children',
  ): T[] {
    const targetNode = this.findById(tree, targetId, idKey, childrenKey)
    if (!targetNode) {
      return []
    }

    const parentId = targetNode[parentIdKey]
    if (parentId === null || parentId === undefined) {
      return [...tree]
    }

    const parent = this.findById(tree, parentId, idKey, childrenKey)
    if (parent && parent[childrenKey]) {
      return parent[childrenKey] as T[]
    }

    return []
  }

  /**
   * 检查节点是否为另一个节点的后代
   * @param tree 树形结构数组
   * @param ancestorId 祖先节点ID
   * @param descendantId 后代节点ID
   * @param idKey ID属性名，默认为'id'
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 是否为后代
   */
  static isDescendant<T extends TreeRecord>(
    tree: T[],
    ancestorId: unknown,
    descendantId: unknown,
    idKey: string = 'id',
    childrenKey: string = 'children',
  ): boolean {
    const ancestor = this.findById(tree, ancestorId, idKey, childrenKey)
    if (!ancestor) {
      return false
    }

    const descendants = this.getDescendants(ancestor, childrenKey)
    return descendants.some((node) => node[idKey] === descendantId)
  }

  /**
   * 检查节点是否为根节点
   * @param node 节点
   * @param parentIdKey 父ID属性名，默认为'parentId'
   * @returns 是否为根节点
   */
  static isRoot<T extends TreeRecord>(node: T, parentIdKey: string = 'parentId'): boolean {
    return node[parentIdKey] === null || node[parentIdKey] === undefined
  }

  /**
   * 检查节点是否为叶子节点
   * @param node 节点
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 是否为叶子节点
   */
  static isLeaf<T extends TreeRecord>(node: T, childrenKey: string = 'children'): boolean {
    return !node[childrenKey] || !Array.isArray(node[childrenKey]) || node[childrenKey].length === 0
  }

  /**
   * 统计树中的节点数量
   * @param tree 树形结构数组
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 节点数量
   */
  static count<T extends TreeRecord>(tree: T[], childrenKey: string = 'children'): number {
    let count = 0

    this.traverse(
      tree,
      () => {
        count++
      },
      childrenKey,
    )

    return count
  }

  /**
   * 在树中插入节点
   * @param tree 树形结构数组
   * @param parentId 父节点ID
   * @param node 要插入的节点
   * @param idKey ID属性名，默认为'id'
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 是否插入成功
   */
  static insert<T extends TreeRecord>(
    tree: T[],
    parentId: unknown,
    node: T,
    idKey: string = 'id',
    childrenKey: string = 'children',
  ): boolean {
    if (parentId === null || parentId === undefined) {
      // 插入到根节点
      tree.push(node)
      return true
    }

    const parent = this.findById(tree, parentId, idKey, childrenKey)
    if (parent) {
      const parentNode = parent as Record<string, unknown>
      const children = parentNode[childrenKey]
      if (!Array.isArray(children)) {
        parentNode[childrenKey] = [node]
      } else {
        ;(children as T[]).push(node)
      }
      return true
    }

    return false
  }

  /**
   * 在树中删除节点
   * @param tree 树形结构数组
   * @param nodeId 要删除的节点ID
   * @param idKey ID属性名，默认为'id'
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 是否删除成功
   */
  static remove<T extends TreeRecord>(
    tree: T[],
    nodeId: unknown,
    idKey: string = 'id',
    childrenKey: string = 'children',
  ): boolean {
    // 先检查是否为根节点
    const rootIndex = tree.findIndex((node) => node[idKey] === nodeId)
    if (rootIndex !== -1) {
      tree.splice(rootIndex, 1)
      return true
    }

    // 在子节点中查找并删除
    for (const node of tree) {
      if (node[childrenKey] && Array.isArray(node[childrenKey])) {
        const childIndex = node[childrenKey].findIndex((child: T) => child[idKey] === nodeId)
        if (childIndex !== -1) {
          node[childrenKey].splice(childIndex, 1)
          return true
        }
        if (this.remove(node[childrenKey], nodeId, idKey, childrenKey)) {
          return true
        }
      }
    }

    return false
  }

  /**
   * 更新树中的节点
   * @param tree 树形结构数组
   * @param nodeId 要更新的节点ID
   * @param updates 更新的属性
   * @param idKey ID属性名，默认为'id'
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 是否更新成功
   */
  static update<T extends TreeRecord>(
    tree: T[],
    nodeId: unknown,
    updates: Partial<T>,
    idKey: string = 'id',
    childrenKey: string = 'children',
  ): boolean {
    const node = this.findById(tree, nodeId, idKey, childrenKey)
    if (node) {
      Object.assign(node, updates)
      return true
    }
    return false
  }

  /**
   * 移动节点到新的父节点
   * @param tree 树形结构数组
   * @param nodeId 要移动的节点ID
   * @param newParentId 新的父节点ID
   * @param idKey ID属性名，默认为'id'
   * @param parentIdKey 父ID属性名，默认为'parentId'
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 是否移动成功
   */
  static move<T extends TreeRecord>(
    tree: T[],
    nodeId: unknown,
    newParentId: unknown,
    idKey: string = 'id',
    parentIdKey: string = 'parentId',
    childrenKey: string = 'children',
  ): boolean {
    const node = this.findById(tree, nodeId, idKey, childrenKey)
    if (!node) {
      return false
    }

    // 检查是否会导致循环引用
    if (
      newParentId !== null &&
      newParentId !== undefined &&
      this.isDescendant(tree, nodeId, newParentId, idKey, childrenKey)
    ) {
      return false
    }

    // 从原位置移除
    if (!this.remove(tree, nodeId, idKey, childrenKey)) {
      return false
    }

    // 更新父节点ID
    ;(node as Record<string, unknown>)[parentIdKey] = newParentId

    // 插入到新位置
    return this.insert(tree, newParentId, node, idKey, childrenKey)
  }

  /**
   * 复制节点（包括其所有子节点）
   * @param tree 树形结构数组
   * @param nodeId 要复制的节点ID
   * @param targetParentId 目标父节点ID
   * @param idKey ID属性名，默认为'id'
   * @param parentIdKey 父ID属性名，默认为'parentId'
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 新节点ID或undefined
   */
  static copy<T extends TreeRecord>(
    tree: T[],
    nodeId: unknown,
    targetParentId: unknown,
    idKey: string = 'id',
    parentIdKey: string = 'parentId',
    childrenKey: string = 'children',
  ): unknown | undefined {
    const node = this.findById(tree, nodeId, idKey, childrenKey)
    if (!node) {
      return undefined
    }

    const newNode = ObjectUtils.deepClone(node) as T
    const newNodeRecord = newNode as Record<string, unknown>
    const existingIds = new Set(this.getIds(tree, idKey, childrenKey).map((id) => String(id)))

    newNodeRecord[idKey] = createCopyId(existingIds, nodeId)
    newNodeRecord[parentIdKey] = targetParentId

    const updateChildrenIds = (currentNode: T, parentId: unknown) => {
      const children = currentNode[childrenKey]
      if (!Array.isArray(children)) {
        return
      }

      for (const child of children as T[]) {
        const childNode = child as Record<string, unknown>
        childNode[idKey] = createCopyId(existingIds, childNode[idKey])
        childNode[parentIdKey] = parentId
        updateChildrenIds(child, childNode[idKey])
      }
    }

    updateChildrenIds(newNode, newNode[idKey])

    // 插入新节点
    if (this.insert(tree, targetParentId, newNode, idKey, childrenKey)) {
      return newNode[idKey]
    }

    return undefined
  }

  /**
   * 根据节点路径查找节点
   * @param tree 树形结构数组
   * @param path 节点路径数组（每层的索引）
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 找到的节点或undefined
   */
  static findByPath<T extends TreeRecord>(
    tree: T[],
    path: number[],
    childrenKey: string = 'children',
  ): T | undefined {
    let currentNodes: T[] = tree
    let currentNode: T | undefined

    for (const index of path) {
      if (!Array.isArray(currentNodes) || index < 0 || index >= currentNodes.length) {
        return undefined
      }

      currentNode = currentNodes[index]
      const children = currentNode?.[childrenKey]
      currentNodes = Array.isArray(children) ? (children as T[]) : []
    }

    return currentNode
  }

  /**
   * 根据标签查找节点
   * @param tree 树形结构数组
   * @param label 节点标签
   * @param labelKey 标签属性名，默认为'label'
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 找到的节点数组
   */
  static findByLabel<T extends TreeRecord>(
    tree: T[],
    label: string,
    labelKey: string = 'label',
    childrenKey: string = 'children',
  ): T[] {
    const result: T[] = []

    this.traverse(
      tree,
      (node) => {
        if (node[labelKey] === label) {
          result.push(node)
        }
      },
      childrenKey,
    )

    return result
  }

  /**
   * 对树进行排序
   * @param tree 树形结构数组
   * @param compareFn 比较函数
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 排序后的树
   */
  static sort<T extends TreeRecord>(
    tree: T[],
    compareFn: (a: T, b: T) => number,
    childrenKey: string = 'children',
  ): T[] {
    const sorted = [...tree].sort(compareFn)

    return sorted.map((node) => {
      if (node[childrenKey] && Array.isArray(node[childrenKey])) {
        const result: T = {
          ...node,
          [childrenKey]: this.sort(node[childrenKey], compareFn, childrenKey) as T[keyof T],
        }
        return result
      }
      return node
    })
  }

  /**
   * 搜索树中的节点
   * @param tree 树形结构数组
   * @param keyword 搜索关键词
   * @param searchKeys 要搜索的属性键数组
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 匹配的节点数组
   */
  static search<T extends TreeRecord>(
    tree: T[],
    keyword: string,
    searchKeys: (keyof T)[],
    childrenKey: string = 'children',
  ): T[] {
    const result: T[] = []
    const lowerKeyword = keyword.toLowerCase()

    this.traverse(
      tree,
      (node) => {
        for (const key of searchKeys) {
          const value = String(node[key] || '').toLowerCase()
          if (value.includes(lowerKeyword)) {
            result.push(node)
            break
          }
        }
      },
      childrenKey,
    )

    return result
  }

  /**
   * 获取树的每一层节点
   * @param tree 树形结构数组
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 二维数组，每个元素代表一层节点
   */
  static getLevels<T extends TreeRecord>(tree: T[], childrenKey: string = 'children'): T[][] {
    const levels: T[][] = []

    if (tree.length > 0) {
      levels.push(tree)
    }

    let currentLevel = tree
    while (currentLevel.length > 0) {
      const nextLevel: T[] = []

      for (const node of currentLevel) {
        if (node[childrenKey] && Array.isArray(node[childrenKey])) {
          nextLevel.push(...node[childrenKey])
        }
      }

      if (nextLevel.length > 0) {
        levels.push(nextLevel)
      }

      currentLevel = nextLevel
    }

    return levels
  }

  /**
   * 验证树结构是否有效
   * @param tree 树形结构数组
   * @param idKey ID属性名，默认为'id'
   * @param parentIdKey 父ID属性名，默认为'parentId'
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 是否有效
   */
  static validate<T extends TreeRecord>(
    tree: T[],
    idKey: string = 'id',
    parentIdKey: string = 'parentId',
    childrenKey: string = 'children',
  ): boolean {
    try {
      const ids = new Set<unknown>()
      const flat = this.flatten(tree, childrenKey)

      for (const node of flat) {
        if (node[idKey] === null || node[idKey] === undefined) {
          return false
        }
        if (ids.has(node[idKey])) {
          return false
        }
        ids.add(node[idKey])
      }

      const visited = new Set<unknown>()

      const checkCycle = (node: T, parent: T | undefined, path: Set<unknown>): boolean => {
        const nodeId = node[idKey]

        if (path.has(nodeId)) {
          return false
        }

        if (visited.has(nodeId)) {
          return true
        }

        if (parent && node[parentIdKey] !== undefined && node[parentIdKey] !== parent[idKey]) {
          return false
        }

        visited.add(nodeId)
        const newPath = new Set(path)
        newPath.add(nodeId)

        if (node[childrenKey] && Array.isArray(node[childrenKey])) {
          for (const child of node[childrenKey]) {
            if (!checkCycle(child, node, newPath)) {
              return false
            }
          }
        }

        return true
      }

      for (const node of tree) {
        if (!checkCycle(node, undefined, new Set())) {
          return false
        }
      }

      return true
    } catch {
      return false
    }
  }

  /**
   * 将树转换为索引映射（ID到节点的映射）
   * @param tree 树形结构数组
   * @param idKey ID属性名，默认为'id'
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns ID到节点的映射
   */
  static toIndexMap<T extends TreeRecord>(
    tree: T[],
    idKey: string = 'id',
    childrenKey: string = 'children',
  ): Map<unknown, T> {
    const map = new Map<unknown, T>()

    this.traverse(
      tree,
      (node) => {
        map.set(node[idKey], node)
      },
      childrenKey,
    )

    return map
  }

  /**
   * 批量更新树节点
   * @param tree 树形结构数组
   * @param updates 更新映射（节点ID到更新内容的映射）
   * @param idKey ID属性名，默认为'id'
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 更新的节点数量
   */
  static batchUpdate<T extends TreeRecord>(
    tree: T[],
    updates: Map<unknown, Partial<T>>,
    idKey: string = 'id',
    childrenKey: string = 'children',
  ): number {
    let count = 0

    this.traverse(
      tree,
      (node) => {
        const nodeId = node[idKey]
        if (updates.has(nodeId)) {
          Object.assign(node, updates.get(nodeId))
          count++
        }
      },
      childrenKey,
    )

    return count
  }

  /**
   * 收集树中所有指定键的值
   * @param tree 树形结构数组
   * @param key 要收集的键
   * @param childrenKey 子节点属性名，默认为'children'
   * @returns 值数组
   */
  static collect<T extends TreeRecord, K extends keyof T>(
    tree: T[],
    key: K,
    childrenKey: string = 'children',
  ): T[K][] {
    const values: T[K][] = []

    this.traverse(
      tree,
      (node) => {
        if (node[key] !== undefined) {
          values.push(node[key])
        }
      },
      childrenKey,
    )

    return values
  }
}

// 导出默认实例
export default TreeUtils
