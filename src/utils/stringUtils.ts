/**
 * 字符串工具类
 * 提供字符串检查、转换、处理、匹配、HTML 处理、随机生成、掩码处理、Base64 编解码等功能
 */

/**
 * 字符串工具类
 */
export class StringUtils {
  /**
   * 判断字符串是否为空或仅包含空白字符
   * @param str 要检查的字符串
   * @returns 如果字符串为空或仅包含空白字符返回 true，否则返回 false
   */
  static isEmpty(str: string | null | undefined): boolean {
    return str === null || str === undefined || str.trim().length === 0
  }

  /**
   * 判断字符串是否不为空
   * @param str 要检查的字符串
   * @returns 如果字符串不为空返回 true，否则返回 false
   */
  static isNotEmpty(str: string | null | undefined): boolean {
    return !this.isEmpty(str)
  }

  /**
   * 去除字符串两端的空白字符
   * @param str 要处理的字符串
   * @returns 去除两端空白后的字符串
   */
  static trim(str: string): string {
    return str.trim()
  }

  /**
   * 去除字符串左端的空白字符
   * @param str 要处理的字符串
   * @returns 去除左端空白后的字符串
   */
  static trimLeft(str: string): string {
    return str.trimStart()
  }

  /**
   * 去除字符串右端的空白字符
   * @param str 要处理的字符串
   * @returns 去除右端空白后的字符串
   */
  static trimRight(str: string): string {
    return str.trimEnd()
  }

  /**
   * 去除字符串中所有空白字符
   * @param str 要处理的字符串
   * @returns 去除所有空白后的字符串
   */
  static trimAll(str: string): string {
    return str.replace(/\s+/g, '')
  }

  /**
   * 截断字符串，超出指定长度时添加省略号
   * @param str 要截断的字符串
   * @param maxLength 最大长度
   * @param suffix 省略号后缀，默认为 '...'
   * @returns 截断后的字符串
   */
  static truncate(str: string, maxLength: number, suffix = '...'): string {
    if (str.length <= maxLength) return str
    return str.slice(0, maxLength - suffix.length) + suffix
  }

  /**
   * 首字母大写
   * @param str 要处理的字符串
   * @returns 首字母大写的字符串
   */
  static capitalize(str: string): string {
    if (this.isEmpty(str)) return str
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  /**
   * 首字母小写
   * @param str 要处理的字符串
   * @returns 首字母小写的字符串
   */
  static uncapitalize(str: string): string {
    if (this.isEmpty(str)) return str
    return str.charAt(0).toLowerCase() + str.slice(1)
  }

  /**
   * 每个单词首字母大写
   * @param str 要处理的字符串
   * @returns 每个单词首字母大写的字符串
   */
  static capitalizeWords(str: string): string {
    if (this.isEmpty(str)) return str
    return str.replace(/\b\w/g, (char) => char.toUpperCase())
  }

  /**
   * 转换为小写
   * @param str 要处理的字符串
   * @returns 小写字符串
   */
  static toLowerCase(str: string): string {
    return str.toLowerCase()
  }

  /**
   * 转换为大写
   * @param str 要处理的字符串
   * @returns 大写字符串
   */
  static toUpperCase(str: string): string {
    return str.toUpperCase()
  }

  /**
   * 反转字符串
   * @param str 要反转的字符串
   * @returns 反转后的字符串
   */
  static reverse(str: string): string {
    return str.split('').reverse().join('')
  }

  /**
   * 重复字符串
   * @param str 要重复的字符串
   * @param count 重复次数
   * @returns 重复后的字符串
   */
  static repeat(str: string, count: number): string {
    return str.repeat(count)
  }

  /**
   * 填充字符串到指定长度（左侧）
   * @param str 要填充的字符串
   * @param targetLength 目标长度
   * @param padString 填充字符，默认为空格
   * @returns 填充后的字符串
   */
  static padStart(str: string, targetLength: number, padString = ' '): string {
    return str.padStart(targetLength, padString)
  }

  /**
   * 填充字符串到指定长度（右侧）
   * @param str 要填充的字符串
   * @param targetLength 目标长度
   * @param padString 填充字符，默认为空格
   * @returns 填充后的字符串
   */
  static padEnd(str: string, targetLength: number, padString = ' '): string {
    return str.padEnd(targetLength, padString)
  }

  /**
   * 转换为驼峰命名（camelCase）
   * @param str 要转换的字符串
   * @returns 驼峰命名字符串
   */
  static toCamelCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
      .replace(/^(.)/, (char) => char.toLowerCase())
  }

  /**
   * 转换为帕斯卡命名（PascalCase）
   * @param str 要转换的字符串
   * @returns 帕斯卡命名字符串
   */
  static toPascalCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
      .replace(/^(.)/, (char) => char.toUpperCase())
  }

  /**
   * 转换为短横线命名（kebab-case）
   * @param str 要转换的字符串
   * @returns 短横线命名字符串
   */
  static toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
  }

  /**
   * 转换为下划线命名（snake_case）
   * @param str 要转换的字符串
   * @returns 下划线命名字符串
   */
  static toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase()
  }

  /**
   * 生成随机字符串
   * @param length 字符串长度
   * @param charset 可选字符集，默认为字母数字
   * @returns 随机字符串
   */
  static randomString(
    length: number,
    charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  ): string {
    let result = ''
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return result
  }

  /**
   * 生成随机数字字符串
   * @param length 字符串长度
   * @returns 随机数字字符串
   */
  static randomDigits(length: number): string {
    return this.randomString(length, '0123456789')
  }

  /**
   * 生成随机字母字符串
   * @param length 字符串长度
   * @returns 随机字母字符串
   */
  static randomLetters(length: number): string {
    return this.randomString(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
  }

  /**
   * 检查字符串是否包含指定子串（忽略大小写）
   * @param str 要检查的字符串
   * @param searchStr 要搜索的子串
   * @returns 如果包含返回 true，否则返回 false
   */
  static includesIgnoreCase(str: string, searchStr: string): boolean {
    return str.toLowerCase().includes(searchStr.toLowerCase())
  }

  /**
   * 检查字符串是否以指定前缀开头（忽略大小写）
   * @param str 要检查的字符串
   * @param prefix 前缀
   * @returns 如果以指定前缀开头返回 true，否则返回 false
   */
  static startsWithIgnoreCase(str: string, prefix: string): boolean {
    return str.toLowerCase().startsWith(prefix.toLowerCase())
  }

  /**
   * 检查字符串是否以指定后缀结尾（忽略大小写）
   * @param str 要检查的字符串
   * @param suffix 后缀
   * @returns 如果以指定后缀结尾返回 true，否则返回 false
   */
  static endsWithIgnoreCase(str: string, suffix: string): boolean {
    return str.toLowerCase().endsWith(suffix.toLowerCase())
  }

  /**
   * 移除字符串中的所有 HTML 标签
   * @param str 包含 HTML 的字符串
   * @returns 纯文本字符串
   */
  static stripHtmlTags(str: string): string {
    return str.replace(/<[^>]*>/g, '')
  }

  /**
   * 转义 HTML 特殊字符
   * @param str 要转义的字符串
   * @returns 转义后的字符串
   */
  static escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, "'")
  }

  /**
   * 解除 HTML 特殊字符转义
   * @param str 要解除转义的字符串
   * @returns 解除转义后的字符串
   */
  static unescapeHtml(str: string): string {
    return str
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, "'")
  }

  /**
   * 获取字符串的字节长度（UTF-8编码）
   * @param str 要计算的字符串
   * @returns 字节长度
   */
  static getByteLength(str: string): number {
    let len = 0
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i)
      if (code <= 0x7f) {
        len += 1
      } else if (code <= 0x7ff) {
        len += 2
      } else if (code <= 0xffff) {
        len += 3
      } else {
        len += 4
      }
    }
    return len
  }

  /**
   * 按字节长度截断字符串
   * @param str 要截断的字符串
   * @param maxByteLength 最大字节长度
   * @param suffix 省略号后缀，默认为 '...'
   * @returns 截断后的字符串
   */
  static truncateByBytes(str: string, maxByteLength: number, suffix = '...'): string {
    const suffixByteLength = this.getByteLength(suffix)
    if (suffixByteLength >= maxByteLength) return suffix.slice(0, maxByteLength)

    let len = 0
    let result = ''

    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i)
      let charByteLength = 1

      if (code <= 0x7f) {
        charByteLength = 1
      } else if (code <= 0x7ff) {
        charByteLength = 2
      } else if (code <= 0xffff) {
        charByteLength = 3
      } else {
        charByteLength = 4
      }

      if (len + charByteLength > maxByteLength - suffixByteLength) {
        break
      }

      len += charByteLength
      result += str[i]
    }

    return result + suffix
  }

  /**
   * 字符串模板替换
   * @param template 模板字符串，使用 {key} 作为占位符
   * @param data 替换数据对象
   * @returns 替换后的字符串
   */
  static template(template: string, data: Record<string, unknown>): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => {
      return data[key] !== undefined ? String(data[key]) : ''
    })
  }

  /**
   * 掩码处理字符串（隐藏部分字符）
   * @param str 要处理的字符串
   * @param start 开始显示的字符数
   * @param end 结束显示的字符数
   * @param maskChar 掩码字符，默认为 '*'
   * @returns 掩码处理后的字符串
   */
  static mask(str: string, start = 3, end = 4, maskChar = '*'): string {
    if (str.length <= start + end) return str
    const prefix = str.slice(0, start)
    const suffix = str.slice(-end)
    const maskLength = str.length - start - end
    return prefix + maskChar.repeat(maskLength) + suffix
  }

  /**
   * 手机号掩码处理
   * @param phone 手机号
   * @returns 掩码处理后的手机号
   */
  static maskPhone(phone: string): string {
    return this.mask(phone, 3, 4)
  }

  /**
   * 邮箱掩码处理
   * @param email 邮箱
   * @returns 掩码处理后的邮箱
   */
  static maskEmail(email: string): string {
    const [username, domain] = email.split('@')
    if (!username || !domain) return email
    const maskedUsername =
      username.length > 2 ? username.slice(0, 2) + '*'.repeat(username.length - 2) : username
    return maskedUsername + '@' + domain
  }

  /**
   * 身份证号掩码处理
   * @param idCard 身份证号
   * @returns 掩码处理后的身份证号
   */
  static maskIdCard(idCard: string): string {
    return this.mask(idCard, 3, 4)
  }

  /**
   * 计算字符串相似度（Levenshtein距离）
   * @param str1 字符串1
   * @param str2 字符串2
   * @returns 相似度（0-1之间，1表示完全相同）
   */
  static similarity(str1: string, str2: string): number {
    const len1 = str1.length
    const len2 = str2.length

    if (len1 === 0) return len2 === 0 ? 1 : 0
    if (len2 === 0) return 0

    const matrix: number[][] = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0))

    for (let i = 0; i <= len1; i++) {
      matrix[i]![0] = i
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0]![j] = j
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j]! + 1,
          matrix[i]![j - 1]! + 1,
          matrix[i - 1]![j - 1]! + cost
        )
      }
    }

    const distance = matrix[len1]![len2]!
    const maxLen = Math.max(len1, len2)
    return 1 - distance / maxLen
  }

  /**
   * 高亮匹配的文本
   * @param text 原文本
   * @param keyword 关键词
   * @param highlightClass 高亮CSS类名
   * @returns 高亮后的HTML字符串
   */
  static highlight(text: string, keyword: string, highlightClass = 'highlight'): string {
    if (!keyword) return text
    const regex = new RegExp(`(${keyword})`, 'gi')
    return text.replace(regex, `<span class="${highlightClass}">$1</span>`)
  }

  /**
   * 将字符串转换为 URL 友好的格式
   * @param str 要转换的字符串
   * @returns URL 友好的字符串
   */
  static slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  /**
   * 统计字符串中指定字符的出现次数
   * @param str 要统计的字符串
   * @param char 要统计的字符
   * @returns 出现次数
   */
  static countChar(str: string, char: string): number {
    return str.split(char).length - 1
  }

  /**
   * 统计字符串中单词的数量
   * @param str 要统计的字符串
   * @returns 单词数量
   */
  static countWords(str: string): number {
    return str
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  }

  /**
   * 判断字符串是否为有效的 URL
   * @param str 要检查的字符串
   * @returns 如果是有效URL返回 true，否则返回 false
   */
  static isUrl(str: string): boolean {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  /**
   * 判断字符串是否为有效的邮箱地址
   * @param str 要检查的字符串
   * @returns 如果是有效邮箱返回 true，否则返回 false
   */
  static isEmail(str: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(str)
  }

  /**
   * 判断字符串是否为有效的手机号（中国大陆）
   * @param str 要检查的字符串
   * @returns 如果是有效手机号返回 true，否则返回 false
   */
  static isPhone(str: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(str)
  }

  /**
   * 判断字符串是否为有效的身份证号（中国大陆）
   * @param str 要检查的字符串
   * @returns 如果是有效身份证号返回 true，否则返回 false
   */
  static isIdCard(str: string): boolean {
    const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    return idCardRegex.test(str)
  }

  /**
   * 判断字符串是否为数字
   * @param str 要检查的字符串
   * @returns 如果是数字返回 true，否则返回 false
   */
  static isNumeric(str: string): boolean {
    return !isNaN(Number(str)) && str.trim() !== ''
  }

  /**
   * 判断字符串是否为整数
   * @param str 要检查的字符串
   * @returns 如果是整数返回 true，否则返回 false
   */
  static isInteger(str: string): boolean {
    return /^-?\d+$/.test(str)
  }

  /**
   * 判断字符串是否为浮点数
   * @param str 要检查的字符串
   * @returns 如果是浮点数返回 true，否则返回 false
   */
  static isFloat(str: string): boolean {
    return /^-?\d+\.\d+$/.test(str)
  }

  /**
   * 将字符串转换为安全的 JSON 字符串（防止 XSS）
   * @param str 要转换的字符串
   * @returns 安全的 JSON 字符串
   */
  static safeJsonStringify(str: string): string {
    return JSON.stringify(str)
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029')
  }

  /**
   * Base64 编码
   * @param str 要编码的字符串
   * @returns Base64 编码后的字符串
   */
  static base64Encode(str: string): string {
    try {
      return btoa(unescape(encodeURIComponent(str)))
    } catch {
      return ''
    }
  }

  /**
   * Base64 解码
   * @param str 要解码的 Base64 字符串
   * @returns 解码后的字符串
   */
  static base64Decode(str: string): string {
    try {
      return decodeURIComponent(escape(atob(str)))
    } catch {
      return ''
    }
  }

  /**
   * 将字符串的首字母和每个单词首字母大写（标题格式）
   * @param str 要处理的字符串
   * @returns 标题格式的字符串
   */
  static toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
  }

  /**
   * 移除字符串中的所有数字
   * @param str 要处理的字符串
   * @returns 移除数字后的字符串
   */
  static removeDigits(str: string): string {
    return str.replace(/\d/g, '')
  }

  /**
   * 只保留字符串中的数字
   * @param str 要处理的字符串
   * @returns 只包含数字的字符串
   */
  static keepDigits(str: string): string {
    return str.replace(/\D/g, '')
  }

  /**
   * 移除字符串中的所有标点符号
   * @param str 要处理的字符串
   * @returns 移除标点后的字符串
   */
  static removePunctuation(str: string): string {
    return str.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g, '')
  }

  /**
   * 判断字符串是否包含中文
   * @param str 要检查的字符串
   * @returns 如果包含中文返回 true，否则返回 false
   */
  static containsChinese(str: string): boolean {
    return /[\u4e00-\u9fa5]/.test(str)
  }

  /**
   * 判断字符串是否只包含中文
   * @param str 要检查的字符串
   * @returns 如果只包含中文返回 true，否则返回 false
   */
  static isChinese(str: string): boolean {
    return /^[\u4e00-\u9fa5]+$/.test(str)
  }

  /**
   * 判断字符串是否包含表情符号
   * @param str 要检查的字符串
   * @returns 如果包含表情符号返回 true，否则返回 false
   */
  static containsEmoji(str: string): boolean {
    return /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(
      str
    )
  }

  /**
   * 格式化文件大小
   * @param bytes 字节数
   * @param decimals 小数位数，默认为 2
   * @returns 格式化后的文件大小字符串
   */
  static formatFileSize(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
  }

  /**
   * 每20个字符添加换行符（纯文本场景，换行符为\n）
   * @param {string} str - 待处理的原始字符串
   * @param {number} charCount - 每多少个字符换行，这里默认20
   * @returns {string} 处理后的带换行符的字符串
   */
  static addLineBreakByLoop(str: string, charCount = 20) {
    // 边界处理：如果传入不是字符串或为空，直接返回原内容
    if (typeof str !== 'string' || str.length === 0) return str

    let result = ''
    const strLength = str.length

    // 循环截取：i每次递增20，步长等于换行间隔
    for (let i = 0; i < strLength; i += charCount) {
      // 截取从i开始，长度为charCount的子串
      const subStr = str.substring(i, i + charCount)
      // 拼接子串和换行符（最后一段不需要额外加换行符，避免末尾多余空行）
      result += subStr + (i + charCount < strLength ? '\n' : '')
    }

    return result
  }

  static addLineBreakByLoopForHTML(str: string, charCount = 20) {
    if (typeof str !== 'string' || str.length === 0) return str

    let result = ''
    const strLength = str.length

    for (let i = 0; i < strLength; i += charCount) {
      const subStr = str.substring(i, i + charCount)
      result += subStr + (i + charCount < strLength ? '<br>' : '')
    }

    return result
  }
}

// 导出默认实例
export default StringUtils
