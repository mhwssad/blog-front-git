/**
 * 数学运算工具类
 * 提供常用的数学运算方法
 */

/**
 * 数学运算工具类
 */
export class MathUtils {
  /**
   * 将数字限制在指定范围内
   * @param value 输入值
   * @param min 最小值
   * @param max 最大值
   * @returns 限制后的值
   */
  static clamp(value: number, min: number, max: number): number {
    if (min > max) {
      ;[min, max] = [max, min]
    }
    return Math.min(Math.max(value, min), max)
  }

  /**
   * 线性插值
   * @param start 起始值
   * @param end 结束值
   * @param t 插值因子（0-1）
   * @returns 插值结果
   */
  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t
  }

  /**
   * 将值从一个范围映射到另一个范围
   * @param value 输入值
   * @param inMin 输入范围最小值
   * @param inMax 输入范围最大值
   * @param outMin 输出范围最小值
   * @param outMax 输出范围最大值
   * @returns 映射后的值
   */
  static map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
  }

  /**
   * 判断数字是否为偶数
   * @param num 数字
   * @returns 是否为偶数
   */
  static isEven(num: number): boolean {
    return num % 2 === 0
  }

  /**
   * 判断数字是否为奇数
   * @param num 数字
   * @returns 是否为奇数
   */
  static isOdd(num: number): boolean {
    return num % 2 !== 0
  }

  /**
   * 判断数字是否为质数
   * @param num 数字
   * @returns 是否为质数
   */
  static isPrime(num: number): boolean {
    if (num <= 1) return false
    if (num <= 3) return true
    if (num % 2 === 0 || num % 3 === 0) return false
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false
    }
    return true
  }

  /**
   * 计算最大公约数（GCD）
   * @param a 数字a
   * @param b 数字b
   * @returns 最大公约数
   */
  static gcd(a: number, b: number): number {
    a = Math.abs(a)
    b = Math.abs(b)
    while (b !== 0) {
      ;[a, b] = [b, a % b]
    }
    return a
  }

  /**
   * 计算最小公倍数（LCM）
   * @param a 数字a
   * @param b 数字b
   * @returns 最小公倍数
   */
  static lcm(a: number, b: number): number {
    if (a === 0 || b === 0) return 0
    return Math.abs((a * b) / this.gcd(a, b))
  }

  /**
   * 计算多个数字的最大公约数
   * @param numbers 数字数组
   * @returns 最大公约数
   */
  static gcdMultiple(numbers: number[]): number {
    if (numbers.length === 0) return 0
    return numbers.reduce((acc, num) => this.gcd(acc, num), numbers[0]!)
  }

  /**
   * 计算多个数字的最小公倍数
   * @param numbers 数字数组
   * @returns 最小公倍数
   */
  static lcmMultiple(numbers: number[]): number {
    if (numbers.length === 0) return 0
    return numbers.reduce((acc, num) => this.lcm(acc, num), numbers[0]!)
  }

  /**
   * 计算阶乘
   * @param n 数字
   * @returns 阶乘结果
   */
  static factorial(n: number): number {
    if (n < 0) throw new Error('阶乘只能计算非负整数')
    if (n === 0 || n === 1) return 1
    let result = 1
    for (let i = 2; i <= n; i++) {
      result *= i
    }
    return result
  }

  /**
   * 计算斐波那契数列的第n项
   * @param n 项数
   * @returns 斐波那契数
   */
  static fibonacci(n: number): number {
    if (n < 0) throw new Error('斐波那契数列只能计算非负整数')
    if (n === 0) return 0
    if (n === 1) return 1
    let prev = 0
    let curr = 1
    for (let i = 2; i <= n; i++) {
      ;[prev, curr] = [curr, prev + curr]
    }
    return curr
  }

  /**
   * 计算数组中数字的平均值
   * @param numbers 数字数组
   * @returns 平均值
   */
  static average(numbers: number[]): number {
    if (numbers.length === 0) return 0
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
  }

  /**
   * 计算数组中数字的总和
   * @param numbers 数字数组
   * @returns 总和
   */
  static sum(numbers: number[]): number {
    return numbers.reduce((sum, num) => sum + num, 0)
  }

  /**
   * 计算数组中数字的乘积
   * @param numbers 数字数组
   * @returns 乘积
   */
  static product(numbers: number[]): number {
    if (numbers.length === 0) return 0
    return numbers.reduce((product, num) => product * num, 1)
  }

  /**
   * 计算数组中数字的最大值
   * @param numbers 数字数组
   * @returns 最大值
   */
  static max(numbers: number[]): number {
    if (numbers.length === 0) return 0
    return Math.max(...numbers)
  }

  /**
   * 计算数组中数字的最小值
   * @param numbers 数字数组
   * @returns 最小值
   */
  static min(numbers: number[]): number {
    if (numbers.length === 0) return 0
    return Math.min(...numbers)
  }

  /**
   * 计算数组中数字的中位数
   * @param numbers 数字数组
   * @returns 中位数
   */
  static median(numbers: number[]): number {
    if (numbers.length === 0) return 0
    const sorted = [...numbers].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!
  }

  /**
   * 计算数组中数字的众数（出现次数最多的值）
   * @param numbers 数字数组
   * @returns 众数数组
   */
  static mode(numbers: number[]): number[] {
    if (numbers.length === 0) return []
    const frequency = new Map<number, number>()
    let maxFreq = 0

    for (const num of numbers) {
      const freq = (frequency.get(num) || 0) + 1
      frequency.set(num, freq)
      maxFreq = Math.max(maxFreq, freq)
    }

    return Array.from(frequency.entries())
      .filter(([, freq]) => freq === maxFreq)
      .map(([num]) => num)
  }

  /**
   * 计算数组中数字的方差
   * @param numbers 数字数组
   * @returns 方差
   */
  static variance(numbers: number[]): number {
    if (numbers.length === 0) return 0
    const avg = this.average(numbers)
    return numbers.reduce((sum, num) => sum + Math.pow(num - avg, 2), 0) / numbers.length
  }

  /**
   * 计算数组中数字的标准差
   * @param numbers 数字数组
   * @returns 标准差
   */
  static standardDeviation(numbers: number[]): number {
    return Math.sqrt(this.variance(numbers))
  }

  /**
   * 计算数组中数字的范围（最大值减最小值）
   * @param numbers 数字数组
   * @returns 范围
   */
  static range(numbers: number[]): number {
    if (numbers.length === 0) return 0
    return this.max(numbers) - this.min(numbers)
  }

  /**
   * 将角度转换为弧度
   * @param degrees 角度
   * @returns 弧度
   */
  static degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180
  }

  /**
   * 将弧度转换为角度
   * @param radians 弧度
   * @returns 角度
   */
  static radiansToDegrees(radians: number): number {
    return (radians * 180) / Math.PI
  }

  /**
   * 判断数字是否为整数
   * @param num 数字
   * @returns 是否为整数
   */
  static isInteger(num: number): boolean {
    return Number.isInteger(num)
  }

  /**
   * 判断数字是否为浮点数
   * @param num 数字
   * @returns 是否为浮点数
   */
  static isFloat(num: number): boolean {
    return !Number.isInteger(num) && !Number.isNaN(num)
  }

  /**
   * 判断数字是否为有限数
   * @param num 数字
   * @returns 是否为有限数
   */
  static isFinite(num: number): boolean {
    return Number.isFinite(num)
  }

  /**
   * 判断数字是否为NaN
   * @param num 数字
   * @returns 是否为NaN
   */
  static isNaN(num: number): boolean {
    return Number.isNaN(num)
  }

  /**
   * 判断数字是否为正数
   * @param num 数字
   * @returns 是否为正数
   */
  static isPositive(num: number): boolean {
    return num > 0
  }

  /**
   * 判断数字是否为负数
   * @param num 数字
   * @returns 是否为负数
   */
  static isNegative(num: number): boolean {
    return num < 0
  }

  /**
   * 判断数字是否为零
   * @param num 数字
   * @returns 是否为零
   */
  static isZero(num: number): boolean {
    return num === 0
  }

  /**
   * 获取数字的绝对值
   * @param num 数字
   * @returns 绝对值
   */
  static abs(num: number): number {
    return Math.abs(num)
  }

  /**
   * 对数字进行四舍五入
   * @param num 数字
   * @param precision 保留小数位数，默认为0
   * @returns 四舍五入后的值
   */
  static round(num: number, precision = 0): number {
    const factor = Math.pow(10, precision)
    return Math.round(num * factor) / factor
  }

  /**
   * 对数字进行向上取整
   * @param num 数字
   * @returns 向上取整后的值
   */
  static ceil(num: number): number {
    return Math.ceil(num)
  }

  /**
   * 对数字进行向下取整
   * @param num 数字
   * @returns 向下取整后的值
   */
  static floor(num: number): number {
    return Math.floor(num)
  }

  /**
   * 计算数字的幂
   * @param base 底数
   * @param exponent 指数
   * @returns 幂的结果
   */
  static pow(base: number, exponent: number): number {
    return Math.pow(base, exponent)
  }

  /**
   * 计算数字的平方根
   * @param num 数字
   * @returns 平方根
   */
  static sqrt(num: number): number {
    return Math.sqrt(num)
  }

  /**
   * 计算数字的立方根
   * @param num 数字
   * @returns 立方根
   */
  static cbrt(num: number): number {
    return Math.cbrt(num)
  }

  /**
   * 计算数字的n次方根
   * @param num 数字
   * @param n 根次
   * @returns n次方根
   */
  static nthRoot(num: number, n: number): number {
    if (n === 0) throw new Error('根次不能为0')
    return num < 0 && n % 2 === 1 ? -Math.pow(-num, 1 / n) : Math.pow(num, 1 / n)
  }

  /**
   * 计算数字的对数（以10为底）
   * @param num 数字
   * @returns 对数
   */
  static log10(num: number): number {
    return Math.log10(num)
  }

  /**
   * 计算数字的自然对数（以e为底）
   * @param num 数字
   * @returns 自然对数
   */
  static log(num: number): number {
    return Math.log(num)
  }

  /**
   * 计算数字的任意底数对数
   * @param num 数字
   * @param base 底数
   * @returns 对数
   */
  static logBase(num: number, base: number): number {
    return Math.log(num) / Math.log(base)
  }

  /**
   * 计算数字的百分比
   * @param value 值
   * @param total 总数
   * @param precision 保留小数位数，默认为2
   * @returns 百分比
   */
  static percentage(value: number, total: number, precision = 2): number {
    if (total === 0) return 0
    return this.round((value / total) * 100, precision)
  }

  /**
   * 计算数字的百分比变化
   * @param oldValue 旧值
   * @param newValue 新值
   * @param precision 保留小数位数，默认为2
   * @returns 百分比变化
   */
  static percentageChange(oldValue: number, newValue: number, precision = 2): number {
    if (oldValue === 0) return 0
    return this.round(((newValue - oldValue) / Math.abs(oldValue)) * 100, precision)
  }

  /**
   * 格式化数字为千分位字符串
   * @param num 数字
   * @param decimals 保留小数位数，默认为2
   * @returns 格式化后的字符串
   */
  static formatNumber(num: number, decimals = 2): string {
    return num.toLocaleString('zh-CN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }

  /**
   * 格式化数字为百分比字符串
   * @param num 数字
   * @param decimals 保留小数位数，默认为2
   * @returns 格式化后的字符串
   */
  static formatPercentage(num: number, decimals = 2): string {
    return `${num.toFixed(decimals)}%`
  }

  /**
   * 格式化数字为货币字符串
   * @param num 数字
   * @param currency 货币代码，默认为CNY
   * @param decimals 保留小数位数，默认为2
   * @returns 格式化后的字符串
   */
  static formatCurrency(
    num: number,
    currency: 'CNY' | 'USD' | 'EUR' | 'JPY' = 'CNY',
    decimals = 2
  ): string {
    return num.toLocaleString('zh-CN', {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }

  /**
   * 将数字转换为文件大小字符串
   * @param bytes 字节数
   * @param decimals 保留小数位数，默认为2
   * @returns 文件大小字符串
   */
  static formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]!}`
  }

  /**
   * 计算两点之间的欧几里得距离
   * @param x1 点1的x坐标
   * @param y1 点1的y坐标
   * @param x2 点2的x坐标
   * @param y2 点2的y坐标
   * @returns 距离
   */
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  }

  /**
   * 计算三维空间中两点之间的欧几里得距离
   * @param x1 点1的x坐标
   * @param y1 点1的y坐标
   * @param z1 点1的z坐标
   * @param x2 点2的x坐标
   * @param y2 点2的y坐标
   * @param z2 点2的z坐标
   * @returns 距离
   */
  static distance3D(
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number
  ): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2))
  }

  /**
   * 计算两点之间的曼哈顿距离
   * @param x1 点1的x坐标
   * @param y1 点1的y坐标
   * @param x2 点2的x坐标
   * @param y2 点2的y坐标
   * @returns 距离
   */
  static manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x2 - x1) + Math.abs(y2 - y1)
  }

  /**
   * 计算两点之间的切比雪夫距离
   * @param x1 点1的x坐标
   * @param y1 点1的y坐标
   * @param x2 点2的x坐标
   * @param y2 点2的y坐标
   * @returns 距离
   */
  static chebyshevDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1))
  }

  /**
   * 将数字转换为罗马数字
   * @param num 数字（1-3999）
   * @returns 罗马数字字符串
   */
  static toRoman(num: number): string {
    if (num < 1 || num > 3999) {
      throw new Error('罗马数字只能表示1-3999之间的数字')
    }
    const romanNumerals = [
      { value: 1000, symbol: 'M' },
      { value: 900, symbol: 'CM' },
      { value: 500, symbol: 'D' },
      { value: 400, symbol: 'CD' },
      { value: 100, symbol: 'C' },
      { value: 90, symbol: 'XC' },
      { value: 50, symbol: 'L' },
      { value: 40, symbol: 'XL' },
      { value: 10, symbol: 'X' },
      { value: 9, symbol: 'IX' },
      { value: 5, symbol: 'V' },
      { value: 4, symbol: 'IV' },
      { value: 1, symbol: 'I' }
    ]
    let result = ''
    for (const { value, symbol } of romanNumerals) {
      while (num >= value) {
        result += symbol
        num -= value
      }
    }
    return result
  }

  /**
   * 将罗马数字转换为阿拉伯数字
   * @param roman 罗马数字字符串
   * @returns 阿拉伯数字
   */
  static fromRoman(roman: string): number {
    const romanNumerals: Record<string, number> = {
      I: 1,
      V: 5,
      X: 10,
      L: 50,
      C: 100,
      D: 500,
      M: 1000
    }
    let result = 0
    for (let i = 0; i < roman.length; i++) {
      const current = romanNumerals[roman[i]!] ?? 0
      const next = romanNumerals[roman[i + 1]!] ?? 0
      if (next && current < next) {
        result += next - current
        i++
      } else {
        result += current
      }
    }
    return result
  }

  /**
   * 安全的除法运算，避免除以零
   * @param dividend 被除数
   * @param divisor 除数
   * @param defaultValue 除数为零时的默认返回值，默认为0
   * @returns 除法结果
   */
  static safeDivide(dividend: number, divisor: number, defaultValue = 0): number {
    return divisor === 0 ? defaultValue : dividend / divisor
  }

  /**
   * 计算数字的位数
   * @param num 数字
   * @returns 位数
   */
  static digitCount(num: number): number {
    return Math.abs(num).toString().replace('.', '').length
  }

  /**
   * 反转数字
   * @param num 数字
   * @returns 反转后的数字
   */
  static reverseNumber(num: number): number {
    const sign = Math.sign(num)
    const reversed = Math.abs(num).toString().split('').reverse().join('')
    return sign * Number.parseInt(reversed, 10)
  }

  /**
   * 检查数字是否为回文数
   * @param num 数字
   * @returns 是否为回文数
   */
  static isPalindrome(num: number): boolean {
    return num === this.reverseNumber(num)
  }

  /**
   * 计算数字的数位和
   * @param num 数字
   * @returns 数位和
   */
  static digitSum(num: number): number {
    return Math.abs(num)
      .toString()
      .split('')
      .reduce((sum, digit) => sum + Number.parseInt(digit, 10), 0)
  }

  /**
   * 计算数字的数位积
   * @param num 数字
   * @returns 数位积
   */
  static digitProduct(num: number): number {
    const digits = Math.abs(num).toString().split('')
    return digits.reduce((product, digit) => product * Number.parseInt(digit, 10), 1)
  }
}

// 导出默认实例
export default MathUtils
