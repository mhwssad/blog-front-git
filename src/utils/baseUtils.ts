/**
 * Base编码工具类
 * 提供常用的Base编码/解码方法
 */

/**
 * Base编码工具类
 */
export class BaseUtils {
  /**
   * Base64 编码
   * @param input 输入字符串
   * @returns Base64编码后的字符串
   */
  static base64Encode(input: string): string {
    try {
      // 处理中文等特殊字符
      const utf8Bytes = new TextEncoder().encode(input)
      const binaryString = Array.from(utf8Bytes, (byte) => String.fromCharCode(byte)).join('')
      return btoa(binaryString)
    } catch (error) {
      throw new Error(`Base64编码失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Base64 解码
   * @param input Base64编码的字符串
   * @returns 解码后的字符串
   */
  static base64Decode(input: string): string {
    try {
      const binaryString = atob(input)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      return new TextDecoder().decode(bytes)
    } catch (error) {
      throw new Error(`Base64解码失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * URL安全的Base64 编码
   * @param input 输入字符串
   * @returns URL安全的Base64编码后的字符串
   */
  static base64UrlEncode(input: string): string {
    return this.base64Encode(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  /**
   * URL安全的Base64 解码
   * @param input URL安全的Base64编码的字符串
   * @returns 解码后的字符串
   */
  static base64UrlDecode(input: string): string {
    // 添加填充
    let paddedInput = input
    while (paddedInput.length % 4) {
      paddedInput += '='
    }
    const base64String = paddedInput.replace(/-/g, '+').replace(/_/g, '/')
    return this.base64Decode(base64String)
  }

  /**
   * Base16（十六进制）编码
   * @param input 输入字符串
   * @returns 十六进制编码后的字符串
   */
  static base16Encode(input: string): string {
    const utf8Bytes = new TextEncoder().encode(input)
    return Array.from(utf8Bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Base16（十六进制）解码
   * @param input 十六进制编码的字符串
   * @returns 解码后的字符串
   */
  static base16Decode(input: string): string {
    // 移除可能的空格和0x前缀
    const cleanedInput = input.replace(/\s/g, '').replace(/^0x/i, '')

    if (cleanedInput.length % 2 !== 0) {
      throw new Error('十六进制字符串长度必须为偶数')
    }

    const bytes = new Uint8Array(cleanedInput.length / 2)
    for (let i = 0; i < cleanedInput.length; i += 2) {
      const byte = parseInt(cleanedInput.substring(i, i + 2), 16)
      if (isNaN(byte)) {
        throw new Error('无效的十六进制字符')
      }
      bytes[i / 2] = byte
    }

    return new TextDecoder().decode(bytes)
  }

  /**
   * Base32 编码
   * @param input 输入字符串
   * @param alphabet Base32字母表，默认为RFC 4648标准
   * @returns Base32编码后的字符串
   */
  static base32Encode(input: string, alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'): string {
    const utf8Bytes = new TextEncoder().encode(input)
    let bits = 0
    let value = 0
    let output = ''

    for (const byte of utf8Bytes) {
      value = (value << 8) | byte
      bits += 8

      while (bits >= 5) {
        bits -= 5
        output += alphabet[(value >>> bits) & 31]
      }
    }

    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31]
    }

    // 添加填充
    const padding = (8 - (output.length % 8)) % 8
    output += '='.repeat(padding)

    return output
  }

  /**
   * Base32 解码
   * @param input Base32编码的字符串
   * @param alphabet Base32字母表，默认为RFC 4648标准
   * @returns 解码后的字符串
   */
  static base32Decode(input: string, alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'): string {
    // 移除填充和空格
    const cleanedInput = input.replace(/=+$/, '').replace(/\s/g, '').toUpperCase()

    // 创建字符到值的映射
    const charMap: Record<string, number> = {}
    for (let i = 0; i < alphabet.length; i++) {
      const char = alphabet[i]
      if (char !== undefined) {
        charMap[char] = i
      }
    }

    let bits = 0
    let value = 0
    const bytes: number[] = []

    for (const char of cleanedInput) {
      if (!(char in charMap)) {
        throw new Error(`无效的Base32字符: ${char}`)
      }

      const charValue = charMap[char]
      if (charValue === undefined) {
        throw new Error(`无效的Base32字符: ${char}`)
      }

      value = (value << 5) | charValue
      bits += 5

      if (bits >= 8) {
        bits -= 8
        bytes.push((value >>> bits) & 255)
      }
    }

    return new TextDecoder().decode(new Uint8Array(bytes))
  }

  /**
   * Base32Hex 编码（使用扩展的十六进制字母表）
   * @param input 输入字符串
   * @returns Base32Hex编码后的字符串
   */
  static base32HexEncode(input: string): string {
    return this.base32Encode(input, '0123456789ABCDEFGHIJKLMNOPQRSTUV')
  }

  /**
   * Base32Hex 解码
   * @param input Base32Hex编码的字符串
   * @returns 解码后的字符串
   */
  static base32HexDecode(input: string): string {
    return this.base32Decode(input, '0123456789ABCDEFGHIJKLMNOPQRSTUV')
  }

  /**
   * Base58 编码（常用于比特币等加密货币）
   * @param input 输入字符串
   * @returns Base58编码后的字符串
   */
  static base58Encode(input: string): string {
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    const utf8Bytes = new TextEncoder().encode(input)

    // 转换为大整数
    let num = 0n
    for (const byte of utf8Bytes) {
      num = (num << 8n) | BigInt(byte)
    }

    // 转换为Base58
    const base = 58n
    let encoded = ''
    while (num > 0n) {
      const remainder = num % base
      encoded = alphabet[Number(remainder)] + encoded
      num = num / base
    }

    // 处理前导零
    for (const byte of utf8Bytes) {
      if (byte === 0) {
        encoded = alphabet[0] + encoded
      } else {
        break
      }
    }

    return encoded
  }

  /**
   * Base58 解码
   * @param input Base58编码的字符串
   * @returns 解码后的字符串
   */
  static base58Decode(input: string): string {
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

    // 创建字符到值的映射
    const charMap: Record<string, number> = {}
    for (let i = 0; i < alphabet.length; i++) {
      const char = alphabet[i]
      if (char !== undefined) {
        charMap[char] = i
      }
    }

    // 转换为大整数
    let num = 0n
    const base = 58n
    for (const char of input) {
      if (!(char in charMap)) {
        throw new Error(`无效的Base58字符: ${char}`)
      }
      const charValue = charMap[char]
      if (charValue === undefined) {
        throw new Error(`无效的Base58字符: ${char}`)
      }
      num = num * base + BigInt(charValue)
    }

    // 转换为字节数组
    const bytes: number[] = []
    while (num > 0n) {
      bytes.unshift(Number(num & 0xffn))
      num = num >> 8n
    }

    // 处理前导零
    const firstChar = alphabet[0]
    if (firstChar !== undefined) {
      for (const char of input) {
        if (char === firstChar) {
          bytes.unshift(0)
        } else {
          break
        }
      }
    }

    return new TextDecoder().decode(new Uint8Array(bytes))
  }

  /**
   * Base62 编码
   * @param input 输入字符串
   * @returns Base62编码后的字符串
   */
  static base62Encode(input: string): string {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    const utf8Bytes = new TextEncoder().encode(input)

    // 转换为大整数
    let num = 0n
    for (const byte of utf8Bytes) {
      num = (num << 8n) | BigInt(byte)
    }

    // 转换为Base62
    const base = 62n
    let encoded = ''
    while (num > 0n) {
      const remainder = num % base
      const char = alphabet[Number(remainder)]
      if (char !== undefined) {
        encoded = char + encoded
      }
      num = num / base
    }

    // 处理前导零
    const firstChar = alphabet[0]
    if (firstChar !== undefined) {
      for (const byte of utf8Bytes) {
        if (byte === 0) {
          encoded = firstChar + encoded
        } else {
          break
        }
      }
    }

    return encoded || (firstChar !== undefined ? firstChar : '')
  }

  /**
   * Base62 解码
   * @param input Base62编码的字符串
   * @returns 解码后的字符串
   */
  static base62Decode(input: string): string {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

    // 创建字符到值的映射
    const charMap: Record<string, number> = {}
    for (let i = 0; i < alphabet.length; i++) {
      const char = alphabet[i]
      if (char !== undefined) {
        charMap[char] = i
      }
    }

    // 转换为大整数
    let num = 0n
    const base = 62n
    for (const char of input) {
      if (!(char in charMap)) {
        throw new Error(`无效的Base62字符: ${char}`)
      }
      const charValue = charMap[char]
      if (charValue === undefined) {
        throw new Error(`无效的Base62字符: ${char}`)
      }
      num = num * base + BigInt(charValue)
    }

    // 转换为字节数组
    const bytes: number[] = []
    while (num > 0n) {
      bytes.unshift(Number(num & 0xffn))
      num = num >> 8n
    }

    // 处理前导零
    const firstChar = alphabet[0]
    if (firstChar !== undefined) {
      for (const char of input) {
        if (char === firstChar) {
          bytes.unshift(0)
        } else {
          break
        }
      }
    }

    return new TextDecoder().decode(new Uint8Array(bytes))
  }

  /**
   * 检查字符串是否为有效的Base64编码
   * @param input 输入字符串
   * @returns 是否为有效的Base64编码
   */
  static isBase64(input: string): boolean {
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/
    return base64Regex.test(input)
  }

  /**
   * 检查字符串是否为有效的Base16（十六进制）编码
   * @param input 输入字符串
   * @returns 是否为有效的Base16编码
   */
  static isBase16(input: string): boolean {
    const hexRegex = /^[0-9a-fA-F]+$/
    return hexRegex.test(input) && input.length % 2 === 0
  }

  /**
   * 检查字符串是否为有效的Base32编码
   * @param input 输入字符串
   * @returns 是否为有效的Base32编码
   */
  static isBase32(input: string): boolean {
    const base32Regex = /^[A-Z2-7]+=*$/
    return base32Regex.test(input.toUpperCase())
  }

  /**
   * 检查字符串是否为有效的Base58编码
   * @param input 输入字符串
   * @returns 是否为有效的Base58编码
   */
  static isBase58(input: string): boolean {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/
    return base58Regex.test(input)
  }

  /**
   * 检查字符串是否为有效的Base62编码
   * @param input 输入字符串
   * @returns 是否为有效的Base62编码
   */
  static isBase62(input: string): boolean {
    const base62Regex = /^[0-9A-Za-z]+$/
    return base62Regex.test(input)
  }

  /**
   * 将字节数组转换为十六进制字符串
   * @param bytes 字节数组
   * @returns 十六进制字符串
   */
  static bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * 将十六进制字符串转换为字节数组
   * @param hex 十六进制字符串
   * @returns 字节数组
   */
  static hexToBytes(hex: string): Uint8Array {
    const cleanedHex = hex.replace(/\s/g, '').replace(/^0x/i, '')

    if (cleanedHex.length % 2 !== 0) {
      throw new Error('十六进制字符串长度必须为偶数')
    }

    const bytes = new Uint8Array(cleanedHex.length / 2)
    for (let i = 0; i < cleanedHex.length; i += 2) {
      const byte = parseInt(cleanedHex.substring(i, i + 2), 16)
      if (isNaN(byte)) {
        throw new Error('无效的十六进制字符')
      }
      bytes[i / 2] = byte
    }

    return bytes
  }

  /**
   * 将字节数组转换为Base64字符串
   * @param bytes 字节数组
   * @returns Base64字符串
   */
  static bytesToBase64(bytes: Uint8Array): string {
    const binaryString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
    return btoa(binaryString)
  }

  /**
   * 将Base64字符串转换为字节数组
   * @param base64 Base64字符串
   * @returns 字节数组
   */
  static base64ToBytes(base64: string): Uint8Array {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }

  /**
   * 将字符串转换为字节数组
   * @param input 输入字符串
   * @returns 字节数组
   */
  static stringToBytes(input: string): Uint8Array {
    return new TextEncoder().encode(input)
  }

  /**
   * 将字节数组转换为字符串
   * @param bytes 字节数组
   * @returns 字符串
   */
  static bytesToString(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes)
  }
}

// 导出默认实例
export default BaseUtils
