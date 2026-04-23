/**
 * 格式化工具类
 * 提供数字格式化、字符串格式化等常用功能
 */

export class FormatUtils {
  /**
   * 保留指定小数位数，并去除末尾多余的0
   * @param num 要格式化的数字
   * @param digits 保留的小数位数，默认为2
   * @returns 格式化后的字符串
   */
  static formatDecimal(num: number | string, digits = 2): string {
    const number = typeof num === 'string' ? parseFloat(num) : num
    if (isNaN(number)) return '0'

    // 使用 toFixed 保留指定位数
    let result = number.toFixed(digits)

    // 去除末尾多余的0和小数点
    result = result.replace(/\.?0+$/, '')

    return result
  }

  /**
   * 保留两位小数，不去除末尾0
   * @param num 要格式化的数字
   * @returns 格式化后的字符串
   */
  static formatTwoDecimals(num: number | string): string {
    const number = typeof num === 'string' ? parseFloat(num) : num
    if (isNaN(number)) return '0.00'

    return number.toFixed(2)
  }

  /**
   * 格式化百分比
   * @param num 要格式化的数字 (0-1之间的小数)
   * @param digits 保留的小数位数，默认为2
   * @param includeSymbol 是否包含百分号，默认为true
   * @returns 格式化后的百分比字符串
   */
  static formatPercentage(num: number | string, digits = 2, includeSymbol = true): string {
    const number = typeof num === 'string' ? parseFloat(num) : num
    if (isNaN(number)) return includeSymbol ? '0%' : '0'

    const percentage = number * 100
    const formatted = this.formatDecimal(percentage, digits)

    return includeSymbol ? `${formatted}%` : formatted
  }

  /**
   * 格式化千分位数字
   * @param num 要格式化的数字
   * @param digits 保留的小数位数，默认为0
   * @returns 格式化后的字符串
   */
  static formatThousands(num: number | string, digits = 0): string {
    const number = typeof num === 'string' ? parseFloat(num) : num
    if (isNaN(number)) return '0'

    const formatted = this.formatDecimal(number, digits)

    // 添加千分位分隔符
    const parts = formatted.split('.')
    parts[0] = (parts[0] || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    return parts.join('.')
  }

  /**
   * 格式化货币
   * @param num 要格式化的数字
   * @param currency 货币符号，默认为'¥'
   * @param digits 保留的小数位数，默认为2
   * @returns 格式化后的货币字符串
   */
  static formatCurrency(num: number | string, currency = '¥', digits = 2): string {
    const number = typeof num === 'string' ? parseFloat(num) : num
    if (isNaN(number)) return `${currency}0.00`

    const formatted = this.formatDecimal(number, digits)

    return `${currency}${formatted}`
  }

  /**
   * 格式化文件大小
   * @param bytes 字节数
   * @param decimals 保留的小数位数，默认为2
   * @returns 格式化后的文件大小字符串
   */
  static formatFileSize(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + (sizes[i] || 'Bytes')
  }

  /**
   * 格式化手机号
   * @param phone 手机号
   * @param mask 是否隐藏中间4位，默认为true
   * @returns 格式化后的手机号
   */
  static formatPhone(phone: string, mask = true): string {
    if (!phone) return ''

    // 移除所有非数字字符
    const cleaned = phone.replace(/\D/g, '')

    // 验证手机号长度
    if (cleaned.length !== 11) return phone

    if (mask) {
      return cleaned.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    } else {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
    }
  }

  /**
   * 格式化身份证号
   * @param idCard 身份证号
   * @param mask 是否隐藏部分信息，默认为true
   * @returns 格式化后的身份证号
   */
  static formatIdCard(idCard: string, mask = true): string {
    if (!idCard) return ''

    // 移除所有非数字和X字符
    const cleaned = idCard.replace(/[^0-9Xx]/g, '')

    if (mask && cleaned.length >= 6) {
      return cleaned.replace(/(\d{6}).*(\d{4})/, '$1**********$2')
    }

    return cleaned
  }

  /**
   * 格式化银行卡号
   * @param cardNumber 银行卡号
   * @param mask 是否隐藏部分信息，默认为true
   * @returns 格式化后的银行卡号
   */
  static formatBankCard(cardNumber: string, mask = true): string {
    if (!cardNumber) return ''

    // 移除所有非数字字符
    const cleaned = cardNumber.replace(/\D/g, '')

    if (mask && cleaned.length > 8) {
      const start = cleaned.substring(0, 4)
      const end = cleaned.substring(cleaned.length - 4)
      const middle = '*'.repeat(cleaned.length - 8)
      return `${start}${middle}${end}`
    }

    // 每4位添加一个空格
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  /**
   * 格式化字符串，限制长度并添加省略号
   * @param str 要格式化的字符串
   * @param maxLength 最大长度
   * @param suffix 省略号，默认为'...'
   * @returns 格式化后的字符串
   */
  static truncateString(str: string, maxLength: number, suffix = '...'): string {
    if (!str) return ''

    if (str.length <= maxLength) return str

    return str.substring(0, maxLength - suffix.length) + suffix
  }

  /**
   * 首字母大写
   * @param str 要格式化的字符串
   * @returns 格式化后的字符串
   */
  static capitalize(str: string): string {
    if (!str) return ''

    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  /**
   * 驼峰命名转下划线
   * @param str 驼峰命名字符串
   * @returns 下划线命名字符串
   */
  static camelToSnake(str: string): string {
    if (!str) return ''

    return str.replace(/([A-Z])/g, '_$1').toLowerCase()
  }

  /**
   * 下划线转驼峰命名
   * @param str 下划线命名字符串
   * @returns 驼峰命名字符串
   */
  static snakeToCamel(str: string): string {
    if (!str) return ''

    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
  }
}

export default FormatUtils
