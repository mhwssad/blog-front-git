/**
 * 图结构工具类
 * 提供常用的图操作方法
 */

/**
 * 图边类型接口
 */
export interface GraphEdge<T = unknown> {
  from: T
  to: T
  weight?: number
}

/**
 * 图节点类型接口
 */
export interface GraphNode<T = unknown> {
  value: T
  [key: string]: unknown
}

/**
 * 路径结果接口
 */
export interface PathResult<T = unknown> {
  path: T[]
  distance: number
}

/**
 * 图工具类
 */
export class GraphUtils {
  /**
   * 创建邻接表
   * @param edges 边数组
   * @param directed 是否为有向图，默认为false
   * @returns 邻接表
   */
  static createAdjacencyList<T>(
    edges: GraphEdge<T>[],
    directed: boolean = false
  ): Map<T, Map<T, number>> {
    const adjList = new Map<T, Map<T, number>>()

    for (const edge of edges) {
      if (!adjList.has(edge.from)) {
        adjList.set(edge.from, new Map<T, number>())
      }
      if (!adjList.has(edge.to)) {
        adjList.set(edge.to, new Map<T, number>())
      }

      const weight = edge.weight ?? 1
      adjList.get(edge.from)!.set(edge.to, weight)

      if (!directed) {
        adjList.get(edge.to)!.set(edge.from, weight)
      }
    }

    return adjList
  }

  /**
   * 深度优先搜索（DFS）
   * @param adjList 邻接表
   * @param start 起始节点
   * @param callback 回调函数
   */
  static dfs<T>(adjList: Map<T, Map<T, number>>, start: T, callback?: (node: T) => void): T[] {
    const visited = new Set<T>()
    const result: T[] = []

    const traverse = (node: T) => {
      visited.add(node)
      result.push(node)
      callback?.(node)

      const neighbors = adjList.get(node)
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            traverse(neighbor)
          }
        }
      }
    }

    traverse(start)
    return result
  }

  /**
   * 广度优先搜索（BFS）
   * @param adjList 邻接表
   * @param start 起始节点
   * @param callback 回调函数
   */
  static bfs<T>(adjList: Map<T, Map<T, number>>, start: T, callback?: (node: T) => void): T[] {
    const visited = new Set<T>()
    const queue: T[] = [start]
    const result: T[] = []

    visited.add(start)

    while (queue.length > 0) {
      const node = queue.shift()!
      result.push(node)
      callback?.(node)

      const neighbors = adjList.get(node)
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor)
            queue.push(neighbor)
          }
        }
      }
    }

    return result
  }

  /**
   * Dijkstra最短路径算法
   * @param adjList 邻接表
   * @param start 起始节点
   * @param end 结束节点
   * @returns 路径结果
   */
  static dijkstra<T>(adjList: Map<T, Map<T, number>>, start: T, end: T): PathResult<T> | null {
    const distances = new Map<T, number>()
    const previous = new Map<T, T>()
    const visited = new Set<T>()

    // 初始化距离
    for (const node of adjList.keys()) {
      distances.set(node, Infinity)
    }
    distances.set(start, 0)

    while (visited.size < adjList.size) {
      // 找到未访问节点中距离最小的
      let minDistance = Infinity
      let currentNode: T | null = null

      for (const [node, distance] of distances) {
        if (!visited.has(node) && distance < minDistance) {
          minDistance = distance
          currentNode = node
        }
      }

      if (currentNode === null || minDistance === Infinity) {
        break
      }

      visited.add(currentNode)

      // 更新邻居节点的距离
      const neighbors = adjList.get(currentNode)
      if (neighbors) {
        for (const [neighbor, weight] of neighbors) {
          if (!visited.has(neighbor)) {
            const newDistance = distances.get(currentNode)! + weight
            if (newDistance < distances.get(neighbor)!) {
              distances.set(neighbor, newDistance)
              previous.set(neighbor, currentNode)
            }
          }
        }
      }
    }

    // 重建路径
    if (distances.get(end) === Infinity) {
      return null
    }

    const path: T[] = []
    let current: T | undefined = end

    while (current !== undefined) {
      path.unshift(current)
      current = previous.get(current)
    }

    return {
      path,
      distance: distances.get(end)!
    }
  }

  /**
   * Floyd-Warshall全源最短路径算法
   * @param adjList 邻接表
   * @param nodes 节点数组
   * @returns 距离矩阵和路径矩阵
   */
  static floydWarshall<T>(
    adjList: Map<T, Map<T, number>>,
    nodes: T[]
  ): { distances: Map<T, Map<T, number>>; next: Map<T, Map<T, T | null>> } {
    const distances = new Map<T, Map<T, number>>()
    const next = new Map<T, Map<T, T | null>>()

    // 初始化
    for (const u of nodes) {
      distances.set(u, new Map<T, number>())
      next.set(u, new Map<T, T | null>())

      for (const v of nodes) {
        if (u === v) {
          distances.get(u)!.set(v, 0)
          next.get(u)!.set(v, null)
        } else {
          distances.get(u)!.set(v, Infinity)
          next.get(u)!.set(v, null)
        }
      }
    }

    // 设置边的权重
    for (const [u, neighbors] of adjList) {
      for (const [v, weight] of neighbors) {
        distances.get(u)!.set(v, weight)
        next.get(u)!.set(v, v)
      }
    }

    // Floyd-Warshall算法
    for (const k of nodes) {
      for (const i of nodes) {
        for (const j of nodes) {
          const distIK = distances.get(i)!.get(k)!
          const distKJ = distances.get(k)!.get(j)!
          const newDist = distIK + distKJ
          const currentDist = distances.get(i)!.get(j)!

          if (newDist < currentDist) {
            distances.get(i)!.set(j, newDist)
            next.get(i)!.set(j, next.get(i)!.get(k)!)
          }
        }
      }
    }

    return { distances, next }
  }

  /**
   * 拓扑排序（Kahn算法）
   * @param adjList 邻接表
   * @returns 拓扑排序后的节点数组，如果存在环则返回null
   */
  static topologicalSort<T>(adjList: Map<T, Map<T, number>>): T[] | null {
    const inDegree = new Map<T, number>()
    const queue: T[] = []
    const result: T[] = []

    // 计算入度
    for (const [node] of adjList) {
      inDegree.set(node, 0)
    }

    for (const [, neighbors] of adjList) {
      for (const neighbor of neighbors.keys()) {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) + 1)
      }
    }

    // 将入度为0的节点加入队列
    for (const [node, degree] of inDegree) {
      if (degree === 0) {
        queue.push(node)
      }
    }

    // 处理队列
    while (queue.length > 0) {
      const node = queue.shift()!
      result.push(node)

      const neighbors = adjList.get(node)
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          const newDegree = inDegree.get(neighbor)! - 1
          inDegree.set(neighbor, newDegree)
          if (newDegree === 0) {
            queue.push(neighbor)
          }
        }
      }
    }

    // 检查是否所有节点都已处理（是否存在环）
    if (result.length !== adjList.size) {
      return null // 存在环
    }

    return result
  }

  /**
   * 检测图中是否存在环（DFS）
   * @param adjList 邻接表
   * @param directed 是否为有向图，默认为true
   * @returns 是否存在环
   */
  static hasCycle<T>(adjList: Map<T, Map<T, number>>, directed: boolean = true): boolean {
    const visited = new Set<T>()
    const recursionStack = new Set<T>()

    const dfs = (node: T): boolean => {
      visited.add(node)
      recursionStack.add(node)

      const neighbors = adjList.get(node)
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            if (dfs(neighbor)) {
              return true
            }
          } else if (directed && recursionStack.has(neighbor)) {
            return true
          } else if (!directed && !recursionStack.has(neighbor)) {
            // 无向图需要特殊处理
            if (dfs(neighbor)) {
              return true
            }
          }
        }
      }

      recursionStack.delete(node)
      return false
    }

    for (const node of adjList.keys()) {
      if (!visited.has(node)) {
        if (dfs(node)) {
          return true
        }
      }
    }

    return false
  }

  /**
   * 检查图是否连通
   * @param adjList 邻接表
   * @returns 是否连通
   */
  static isConnected<T>(adjList: Map<T, Map<T, number>>): boolean {
    if (adjList.size === 0) {
      return true
    }

    const iterator = adjList.keys().next()
    if (iterator.done) {
      return true
    }

    const startNode: T = iterator.value
    const visited = new Set<T>()

    const dfs = (node: T) => {
      visited.add(node)
      const neighbors = adjList.get(node)
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            dfs(neighbor)
          }
        }
      }
    }

    dfs(startNode)

    return visited.size === adjList.size
  }

  /**
   * 获取连通分量
   * @param adjList 邻接表
   * @returns 连通分量数组
   */
  static getConnectedComponents<T>(adjList: Map<T, Map<T, number>>): T[][] {
    const visited = new Set<T>()
    const components: T[][] = []

    const dfs = (node: T, component: T[]) => {
      visited.add(node)
      component.push(node)

      const neighbors = adjList.get(node)
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            dfs(neighbor, component)
          }
        }
      }
    }

    for (const node of adjList.keys()) {
      if (!visited.has(node)) {
        const component: T[] = []
        dfs(node, component)
        components.push(component)
      }
    }

    return components
  }

  /**
   * Prim算法求最小生成树
   * @param adjList 邻接表
   * @returns 最小生成树的边数组
   */
  static prim<T>(adjList: Map<T, Map<T, number>>): GraphEdge<T>[] {
    if (adjList.size === 0) {
      return []
    }

    const iterator = adjList.keys().next()
    if (iterator.done) {
      return []
    }

    const startNode: T = iterator.value
    const visited = new Set<T>([startNode])
    const edges: GraphEdge<T>[] = []

    while (visited.size < adjList.size) {
      let minEdge: { from: T; to: T; weight: number } | null = null

      // 找到最小的边
      for (const node of visited) {
        const neighbors = adjList.get(node)
        if (neighbors) {
          for (const [neighbor, weight] of neighbors) {
            if (!visited.has(neighbor)) {
              if (!minEdge || weight < minEdge.weight) {
                minEdge = { from: node, to: neighbor, weight }
              }
            }
          }
        }
      }

      if (minEdge) {
        visited.add(minEdge.to)
        edges.push(minEdge)
      } else {
        break
      }
    }

    return edges
  }

  /**
   * Kruskal算法求最小生成树
   * @param edges 边数组
   * @param nodes 节点数组
   * @returns 最小生成树的边数组
   */
  static kruskal<T>(edges: GraphEdge<T>[], nodes: T[]): GraphEdge<T>[] {
    // 按权重排序
    const sortedEdges = [...edges].sort((a, b) => (a.weight || 1) - (b.weight || 1))

    const parent = new Map<T, T>()
    const rank = new Map<T, number>()

    // 初始化并查集
    for (const node of nodes) {
      parent.set(node, node)
      rank.set(node, 0)
    }

    const find = (x: T): T => {
      if (parent.get(x) !== x) {
        parent.set(x, find(parent.get(x)!))
      }
      return parent.get(x)!
    }

    const union = (x: T, y: T): boolean => {
      const rootX = find(x)
      const rootY = find(y)

      if (rootX === rootY) {
        return false
      }

      if (rank.get(rootX)! < rank.get(rootY)!) {
        parent.set(rootX, rootY)
      } else if (rank.get(rootX)! > rank.get(rootY)!) {
        parent.set(rootY, rootX)
      } else {
        parent.set(rootY, rootX)
        rank.set(rootX, rank.get(rootX)! + 1)
      }

      return true
    }

    const result: GraphEdge<T>[] = []

    for (const edge of sortedEdges) {
      if (union(edge.from, edge.to)) {
        result.push(edge)
      }
    }

    return result
  }

  /**
   * 计算节点的度数
   * @param adjList 邻接表
   * @param node 节点
   * @returns 度数
   */
  static getDegree<T>(adjList: Map<T, Map<T, number>>, node: T): number {
    const neighbors = adjList.get(node)
    return neighbors ? neighbors.size : 0
  }

  /**
   * 获取所有节点
   * @param adjList 邻接表
   * @returns 节点数组
   */
  static getNodes<T>(adjList: Map<T, Map<T, number>>): T[] {
    return Array.from(adjList.keys())
  }

  /**
   * 获取所有边
   * @param adjList 邻接表
   * @param directed 是否为有向图，默认为false
   * @returns 边数组
   */
  static getEdges<T>(adjList: Map<T, Map<T, number>>, directed: boolean = false): GraphEdge<T>[] {
    const edges: GraphEdge<T>[] = []
    const visited = new Set<string>()

    for (const [from, neighbors] of adjList) {
      for (const [to, weight] of neighbors) {
        const edgeKey = `${String(from)}-${String(to)}`

        if (!directed) {
          const reverseKey = `${String(to)}-${String(from)}`
          if (visited.has(reverseKey)) {
            continue
          }
          visited.add(edgeKey)
        }

        edges.push({ from, to, weight })
      }
    }

    return edges
  }

  /**
   * 反转图（用于有向图）
   * @param adjList 邻接表
   * @returns 反转后的邻接表
   */
  static reverse<T>(adjList: Map<T, Map<T, number>>): Map<T, Map<T, number>> {
    const reversed = new Map<T, Map<T, number>>()

    for (const [node, neighbors] of adjList) {
      if (!reversed.has(node)) {
        reversed.set(node, new Map())
      }
      for (const [neighbor, weight] of neighbors) {
        if (!reversed.has(neighbor)) {
          reversed.set(neighbor, new Map())
        }
        reversed.get(neighbor)!.set(node, weight)
      }
    }

    return reversed
  }

  /**
   * 计算图的传递闭包（Warshall算法）
   * @param adjList 邻接表
   * @param nodes 节点数组
   * @returns 传递闭包矩阵
   */
  static transitiveClosure<T>(adjList: Map<T, Map<T, number>>, nodes: T[]): Map<T, Set<T>> {
    const closure = new Map<T, Set<T>>()

    // 初始化
    for (const u of nodes) {
      closure.set(u, new Set())
      const neighbors = adjList.get(u)
      if (neighbors) {
        for (const v of neighbors.keys()) {
          closure.get(u)!.add(v)
        }
      }
      closure.get(u)!.add(u) // 每个节点可达自己
    }

    // Warshall算法
    for (const k of nodes) {
      for (const i of nodes) {
        for (const j of nodes) {
          if (closure.get(i)!.has(k) && closure.get(k)!.has(j)) {
            closure.get(i)!.add(j)
          }
        }
      }
    }

    return closure
  }

  /**
   * 寻割点（Tarjan算法）
   * @param adjList 邻接表
   * @returns 割点集合
   */
  static findArticulationPoints<T>(adjList: Map<T, Map<T, number>>): Set<T> {
    const articulationPoints = new Set<T>()
    const discoveryTime = new Map<T, number>()
    const low = new Map<T, number>()
    const visited = new Set<T>()
    const parent = new Map<T, T | null>()
    let time = 0

    const dfs = (node: T) => {
      visited.add(node)
      discoveryTime.set(node, time)
      low.set(node, time)
      time++
      let children = 0

      const neighbors = adjList.get(node)
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            parent.set(neighbor, node)
            children++
            dfs(neighbor)

            low.set(node, Math.min(low.get(node)!, low.get(neighbor)!))

            // 割点判断条件
            if (parent.get(node) === null && children > 1) {
              articulationPoints.add(node)
            }
            if (parent.get(node) !== null && low.get(neighbor)! >= discoveryTime.get(node)!) {
              articulationPoints.add(node)
            }
          } else if (neighbor !== parent.get(node)) {
            low.set(node, Math.min(low.get(node)!, discoveryTime.get(neighbor)!))
          }
        }
      }
    }

    for (const node of adjList.keys()) {
      if (!visited.has(node)) {
        parent.set(node, null)
        dfs(node)
      }
    }

    return articulationPoints
  }

  /**
   * 寻找桥（Tarjan算法）
   * @param adjList 邻接表
   * @returns 桥的集合
   */
  static findBridges<T>(adjList: Map<T, Map<T, number>>): Set<string> {
    const bridges = new Set<string>()
    const discoveryTime = new Map<T, number>()
    const low = new Map<T, number>()
    const visited = new Set<T>()
    let time = 0

    const dfs = (node: T, parent: T | null) => {
      visited.add(node)
      discoveryTime.set(node, time)
      low.set(node, time)
      time++

      const neighbors = adjList.get(node)
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            dfs(neighbor, node)
            low.set(node, Math.min(low.get(node)!, low.get(neighbor)!))

            if (low.get(neighbor)! > discoveryTime.get(node)!) {
              bridges.add(`${String(node)}-${String(neighbor)}`)
            }
          } else if (neighbor !== parent) {
            low.set(node, Math.min(low.get(node)!, discoveryTime.get(neighbor)!))
          }
        }
      }
    }

    for (const node of adjList.keys()) {
      if (!visited.has(node)) {
        dfs(node, null)
      }
    }

    return bridges
  }

  /**
   * 计算图的直径（无权图）
   * @param adjList 邻接表
   * @returns 直径（最短最长路径的长度）
   */
  static getDiameter<T>(adjList: Map<T, Map<T, number>>): number {
    let maxDistance = 0

    for (const startNode of adjList.keys()) {
      const distances = this.bfsDistances(adjList, startNode)
      for (const distance of distances.values()) {
        if (distance !== Infinity && distance > maxDistance) {
          maxDistance = distance
        }
      }
    }

    return maxDistance
  }

  /**
   * BFS计算从起始节点到所有节点的距离（无权图）
   * @param adjList 邻接表
   * @param start 起始节点
   * @returns 距离映射
   */
  static bfsDistances<T>(adjList: Map<T, Map<T, number>>, start: T): Map<T, number> {
    const distances = new Map<T, number>()
    const visited = new Set<T>()
    const queue: T[] = [start]

    distances.set(start, 0)
    visited.add(start)

    while (queue.length > 0) {
      const node = queue.shift()!
      const currentDistance = distances.get(node)!

      const neighbors = adjList.get(node)
      if (neighbors) {
        for (const neighbor of neighbors.keys()) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor)
            distances.set(neighbor, currentDistance + 1)
            queue.push(neighbor)
          }
        }
      }
    }

    return distances
  }

  /**
   * A*寻路算法
   * @param adjList 邻接表
   * @param start 起始节点
   * @param goal 目标节点
   * @param heuristic 启发式函数
   * @returns 路径结果
   */
  static aStar<T>(
    adjList: Map<T, Map<T, number>>,
    start: T,
    goal: T,
    heuristic: (node: T, goal: T) => number
  ): PathResult<T> | null {
    const openSet = new Set<T>()
    openSet.add(start)
    const cameFrom = new Map<T, T>()
    const gScore = new Map<T, number>()
    const fScore = new Map<T, number>()

    for (const node of adjList.keys()) {
      gScore.set(node, Infinity)
      fScore.set(node, Infinity)
    }

    gScore.set(start, 0)
    fScore.set(start, heuristic(start, goal))

    while (openSet.size > 0) {
      // 找到fScore最小的节点
      let current: T | null = null
      let minFScore = Infinity

      for (const node of openSet) {
        const score = fScore.get(node)!
        if (score < minFScore) {
          minFScore = score
          current = node
        }
      }

      if (current === goal) {
        // 重建路径
        const path: T[] = []
        let temp: T = goal
        while (true) {
          path.unshift(temp)
          const prev = cameFrom.get(temp)
          if (prev === undefined) break
          temp = prev
        }
        return {
          path,
          distance: gScore.get(goal)!
        }
      }

      openSet.delete(current!)
      const neighbors = adjList.get(current!)
      if (neighbors) {
        for (const [neighbor, weight] of neighbors) {
          const tentativeGScore = gScore.get(current!)! + weight

          if (tentativeGScore < (gScore.get(neighbor) ?? Infinity)) {
            cameFrom.set(neighbor, current!)
            gScore.set(neighbor, tentativeGScore)
            fScore.set(neighbor, tentativeGScore + heuristic(neighbor, goal))
            openSet.add(neighbor)
          }
        }
      }
    }

    return null
  }
}

// 导出默认实例
export default GraphUtils
