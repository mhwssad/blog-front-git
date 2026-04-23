/**
 * 哈希算法类型
 */
export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

/**
 * 文件哈希结果
 */
export interface FileHashResult {
  /**
   * 哈希值
   */
  hash: string
  /**
   * 哈希算法
   */
  algorithm: HashAlgorithm
  /**
   * 文件大小（字节）
   */
  size: number
  /**
   * 文件名
   */
  filename: string
}

/**
 * 文件哈希工具类
 * 提供多种哈希算法计算文件哈希值
 * 使用浏览器原生的Web Crypto API，无需额外依赖
 */
export class FileHashUtils {
  /**
   * 计算文件的哈希值
   * @param file 文件对象
   * @param algorithm 哈希算法，默认为 'SHA-256'
   * @returns Promise<FileHashResult> 哈希结果
   * @example
   * const result = await FileHashUtils.calculateHash(file, 'SHA-256');
   * console.log(result.hash); // 输出哈希值
   */
  static async calculateHash(
    file: File,
    algorithm: HashAlgorithm = 'SHA-256'
  ): Promise<FileHashResult> {
    const arrayBuffer = await file.arrayBuffer()
    const hash = await this.calculateBufferHash(arrayBuffer, algorithm)

    return {
      hash,
      algorithm,
      size: file.size,
      filename: file.name
    }
  }

  /**
   * 计算文件的多个哈希值
   * @param file 文件对象
   * @param algorithms 哈希算法数组
   * @returns Promise<FileHashResult[]> 哈希结果数组
   * @example
   * const results = await FileHashUtils.calculateMultipleHashes(file, ['SHA-256', 'SHA-512']);
   * console.log(results); // 输出多个哈希结果
   */
  static async calculateMultipleHashes(
    file: File,
    algorithms: HashAlgorithm[]
  ): Promise<FileHashResult[]> {
    const promises = algorithms.map((algorithm) => this.calculateHash(file, algorithm))
    return Promise.all(promises)
  }

  /**
   * 计算文件的MD5哈希值
   * @param file 文件对象
   * @returns Promise<FileHashResult> 哈希结果
   * @example
   * const result = await FileHashUtils.calculateMD5(file);
   * console.log(result.hash); // 输出MD5哈希值
   */
  static async calculateMD5(file: File): Promise<FileHashResult> {
    return this.calculateHash(file, 'MD5')
  }

  /**
   * 计算文件的SHA-1哈希值
   * @param file 文件对象
   * @returns Promise<FileHashResult> 哈希结果
   * @example
   * const result = await FileHashUtils.calculateSHA1(file);
   * console.log(result.hash); // 输出SHA-1哈希值
   */
  static async calculateSHA1(file: File): Promise<FileHashResult> {
    return this.calculateHash(file, 'SHA-1')
  }

  /**
   * 计算文件的SHA-256哈希值
   * @param file 文件对象
   * @returns Promise<FileHashResult> 哈希结果
   * @example
   * const result = await FileHashUtils.calculateSHA256(file);
   * console.log(result.hash); // 输出SHA-256哈希值
   */
  static async calculateSHA256(file: File): Promise<FileHashResult> {
    return this.calculateHash(file, 'SHA-256')
  }

  /**
   * 计算文件的SHA-384哈希值
   * @param file 文件对象
   * @returns Promise<FileHashResult> 哈希结果
   * @example
   * const result = await FileHashUtils.calculateSHA384(file);
   * console.log(result.hash); // 输出SHA-384哈希值
   */
  static async calculateSHA384(file: File): Promise<FileHashResult> {
    return this.calculateHash(file, 'SHA-384')
  }

  /**
   * 计算文件的SHA-512哈希值
   * @param file 文件对象
   * @returns Promise<FileHashResult> 哈希结果
   * @example
   * const result = await FileHashUtils.calculateSHA512(file);
   * console.log(result.hash); // 输出SHA-512哈希值
   */
  static async calculateSHA512(file: File): Promise<FileHashResult> {
    return this.calculateHash(file, 'SHA-512')
  }

  /**
   * 验证文件的哈希值是否匹配
   * @param file 文件对象
   * @param expectedHash 期望的哈希值
   * @param algorithm 哈希算法，默认为 'SHA-256'
   * @returns Promise<boolean> 是否匹配
   * @example
   * const isValid = await FileHashUtils.verifyHash(file, 'd41d8cd98f00b204e9800998ecf8427e', 'MD5');
   * console.log(isValid); // true 或 false
   */
  static async verifyHash(
    file: File,
    expectedHash: string,
    algorithm: HashAlgorithm = 'SHA-256'
  ): Promise<boolean> {
    try {
      const result = await this.calculateHash(file, algorithm)
      return result.hash.toLowerCase() === expectedHash.toLowerCase()
    } catch {
      return false
    }
  }

  /**
   * 计算字符串的哈希值
   * @param text 文本内容
   * @param algorithm 哈希算法，默认为 'SHA-256'
   * @returns Promise<string> 哈希值
   * @example
   * const hash = await FileHashUtils.calculateTextHash('hello world', 'SHA-256');
   * console.log(hash); // 输出哈希值
   */
  static async calculateTextHash(
    text: string,
    algorithm: HashAlgorithm = 'SHA-256'
  ): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest(algorithm, data)
    return this.bufferToHex(hashBuffer)
  }

  /**
   * 计算ArrayBuffer的哈希值
   * @param buffer ArrayBuffer对象
   * @param algorithm 哈希算法，默认为 'SHA-256'
   * @returns Promise<string> 哈希值
   * @example
   * const hash = await FileHashUtils.calculateBufferHash(arrayBuffer, 'SHA-256');
   * console.log(hash); // 输出哈希值
   */
  static async calculateBufferHash(
    buffer: ArrayBuffer,
    algorithm: HashAlgorithm = 'SHA-256'
  ): Promise<string> {
    const hashBuffer = await crypto.subtle.digest(algorithm, buffer)
    return this.bufferToHex(hashBuffer)
  }

  /**
   * 将ArrayBuffer转换为十六进制字符串
   * @param buffer ArrayBuffer对象
   * @returns string 十六进制字符串
   */
  private static bufferToHex(buffer: ArrayBuffer): string {
    const byteArray = new Uint8Array(buffer)
    const hexArray = Array.from(byteArray, (byte) => byte.toString(16).padStart(2, '0'))
    return hexArray.join('')
  }

  /**
   * 格式化哈希值为指定格式
   * @param hash 哈希值
   * @param format 格式类型：'upper'（大写）、'lower'（小写）、'hyphen'（带连字符）
   * @returns string 格式化后的哈希值
   * @example
   * const formatted = FileHashUtils.formatHash('d41d8cd98f00b204e9800998ecf8427e', 'upper');
   * console.log(formatted); // D41D8CD98F00B204E9800998ECF8427E
   */
  static formatHash(hash: string, format: 'upper' | 'lower' | 'hyphen' = 'lower'): string {
    switch (format) {
      case 'upper':
        return hash.toUpperCase()
      case 'lower':
        return hash.toLowerCase()
      case 'hyphen':
        return hash.match(/.{2}/g)?.join('-') || hash
      default:
        return hash
    }
  }

  /**
   * 获取哈希算法的信息
   * @param algorithm 哈希算法
   * @returns 算法信息
   * @example
   * const info = FileHashUtils.getAlgorithmInfo('SHA-256');
   * console.log(info); // { name: 'SHA-256', length: 64 }
   */
  static getAlgorithmInfo(algorithm: HashAlgorithm): { name: string; length: number } {
    const infoMap: Record<HashAlgorithm, { name: string; length: number }> = {
      MD5: { name: 'MD5', length: 32 },
      'SHA-1': { name: 'SHA-1', length: 40 },
      'SHA-256': { name: 'SHA-256', length: 64 },
      'SHA-384': { name: 'SHA-384', length: 96 },
      'SHA-512': { name: 'SHA-512', length: 128 }
    }
    return infoMap[algorithm]
  }

  /**
   * 检查浏览器是否支持指定的哈希算法
   * @param algorithm 哈希算法
   * @returns boolean 是否支持
   * @example
   * const supported = FileHashUtils.isAlgorithmSupported('SHA-256');
   * console.log(supported); // true 或 false
   */
  static isAlgorithmSupported(algorithm: HashAlgorithm): boolean {
    try {
      return crypto.subtle.digest(algorithm, new ArrayBuffer(0)) !== undefined
    } catch {
      return false
    }
  }

  /**
   * 获取所有支持的哈希算法
   * @returns HashAlgorithm[] 支持的算法列表
   * @example
   * const algorithms = FileHashUtils.getSupportedAlgorithms();
   * console.log(algorithms); // ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']
   */
  static getSupportedAlgorithms(): HashAlgorithm[] {
    const algorithms: HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']
    return algorithms.filter((algo) => this.isAlgorithmSupported(algo))
  }
}

/**
 * 文件哈希工具函数（便捷方法）
 */
export const fileHash = {
  /**
   * 计算文件哈希
   */
  calculate: FileHashUtils.calculateHash,
  /**
   * 计算多个哈希
   */
  calculateMultiple: FileHashUtils.calculateMultipleHashes,
  /**
   * 计算MD5
   */
  md5: FileHashUtils.calculateMD5,
  /**
   * 计算SHA-1
   */
  sha1: FileHashUtils.calculateSHA1,
  /**
   * 计算SHA-256
   */
  sha256: FileHashUtils.calculateSHA256,
  /**
   * 计算SHA-384
   */
  sha384: FileHashUtils.calculateSHA384,
  /**
   * 计算SHA-512
   */
  sha512: FileHashUtils.calculateSHA512,
  /**
   * 验证哈希
   */
  verify: FileHashUtils.verifyHash,
  /**
   * 计算文本哈希
   */
  text: FileHashUtils.calculateTextHash,
  /**
   * 计算Buffer哈希
   */
  buffer: FileHashUtils.calculateBufferHash,
  /**
   * 格式化哈希
   */
  format: FileHashUtils.formatHash,
  /**
   * 获取算法信息
   */
  info: FileHashUtils.getAlgorithmInfo,
  /**
   * 检查算法是否支持
   */
  isSupported: FileHashUtils.isAlgorithmSupported,
  /**
   * 获取支持的算法列表
   */
  getSupported: FileHashUtils.getSupportedAlgorithms
}
