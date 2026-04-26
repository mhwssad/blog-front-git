/**
 * 随机数工具类
 * 提供常用的随机数生成和随机操作方法
 */

/**
 * 随机数工具类
 */
export class RandomUtils {
  /**
   * 生成指定范围内的随机整数（包含最小值和最大值）
   * @param min 最小值
   * @param max 最大值
   * @returns 随机整数
   */
  static integer(min: number, max: number): number {
    if (min > max) {
      ;[min, max] = [max, min]
    }
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * 生成指定范围内的随机浮点数
   * @param min 最小值
   * @param max 最大值
   * @param fixed 保留小数位数，默认为2
   * @returns 随机浮点数
   */
  static float(min: number, max: number, fixed = 2): number {
    if (min > max) {
      ;[min, max] = [max, min]
    }
    const num = Math.random() * (max - min) + min
    return Number(num.toFixed(fixed))
  }

  /**
   * 生成随机布尔值
   * @returns 随机布尔值
   */
  static boolean(): boolean {
    return Math.random() < 0.5
  }

  /**
   * 从数组中随机选择一个元素
   * @param array 数组
   * @returns 随机元素
   */
  static pick<T>(array: T[]): T | undefined {
    if (array.length === 0) {
      return undefined
    }
    return array[this.integer(0, array.length - 1)]
  }

  /**
   * 从数组中随机选择多个元素（不重复）
   * @param array 数组
   * @param count 选择数量
   * @returns 随机元素数组
   */
  static picks<T>(array: T[], count: number): T[] {
    if (count <= 0) {
      return []
    }
    if (count >= array.length) {
      return [...array]
    }

    const shuffled = this.shuffle([...array])
    return shuffled.slice(0, count)
  }

  /**
   * 随机打乱数组（Fisher-Yates 洗牌算法）
   * @param array 数组
   * @returns 打乱后的新数组
   */
  static shuffle<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.integer(0, i)
      ;[result[i], result[j]] = [result[j]!, result[i]!]
    }
    return result
  }

  /**
   * 生成随机数字字符串
   * @param length 字符串长度
   * @returns 随机数字字符串
   */
  static numberString(length: number): string {
    let result = ''
    for (let i = 0; i < length; i++) {
      result += this.integer(0, 9)
    }
    return result
  }

  /**
   * 生成随机小写字母字符串
   * @param length 字符串长度
   * @returns 随机小写字母字符串
   */
  static lowercaseString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz'
    return this.stringFromChars(chars, length)
  }

  /**
   * 生成随机大写字母字符串
   * @param length 字符串长度
   * @returns 随机大写字母字符串
   */
  static uppercaseString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return this.stringFromChars(chars, length)
  }

  /**
   * 生成随机字母字符串（大小写混合）
   * @param length 字符串长度
   * @returns 随机字母字符串
   */
  static letterString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return this.stringFromChars(chars, length)
  }

  /**
   * 生成随机字母数字字符串
   * @param length 字符串长度
   * @returns 随机字母数字字符串
   */
  static alphanumericString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return this.stringFromChars(chars, length)
  }

  /**
   * 从指定字符集中生成随机字符串
   * @param chars 字符集
   * @param length 字符串长度
   * @returns 随机字符串
   */
  static stringFromChars(chars: string, length: number): string {
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars[this.integer(0, chars.length - 1)]
    }
    return result
  }

  /**
   * 生成随机十六进制颜色
   * @param alpha 是否包含透明度，默认为false
   * @returns 十六进制颜色字符串
   */
  static hexColor(alpha = false): string {
    const hex = this.alphanumericString(6)
    if (alpha) {
      const alphaValue = this.integer(0, 255).toString(16).padStart(2, '0')
      return `#${hex}${alphaValue}`
    }
    return `#${hex}`
  }

  /**
   * 生成随机RGB颜色
   * @param alpha 是否包含透明度，默认为false
   * @returns RGB颜色字符串
   */
  static rgbColor(alpha = false): string {
    const r = this.integer(0, 255)
    const g = this.integer(0, 255)
    const b = this.integer(0, 255)
    if (alpha) {
      const a = this.float(0, 1, 2)
      return `rgba(${r}, ${g}, ${b}, ${a})`
    }
    return `rgb(${r}, ${g}, ${b})`
  }

  /**
   * 生成随机HSL颜色
   * @param alpha 是否包含透明度，默认为false
   * @returns HSL颜色字符串
   */
  static hslColor(alpha = false): string {
    const h = this.integer(0, 360)
    const s = this.integer(0, 100)
    const l = this.integer(0, 100)
    if (alpha) {
      const a = this.float(0, 1, 2)
      return `hsla(${h}, ${s}%, ${l}%, ${a})`
    }
    return `hsl(${h}, ${s}%, ${l}%)`
  }

  /**
   * 生成UUID v4
   * @returns UUID字符串
   */
  static uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  /**
   * 生成短ID（类似 nanoid）
   * @param length ID长度，默认为21
   * @returns 短ID字符串
   */
  static id(length = 21): string {
    const chars = 'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZI'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars[this.integer(0, chars.length - 1)]
    }
    return result
  }

  /**
   * 生成指定长度的随机数组
   * @param length 数组长度
   * @param generator 元素生成函数
   * @returns 随机数组
   */
  static array<T>(length: number, generator: (index: number) => T): T[] {
    return Array.from({ length }, (_, index) => generator(index))
  }

  /**
   * 加权随机选择
   * @param items 选项数组
   * @param weights 权重数组
   * @returns 选中的元素
   */
  static weightedPick<T>(items: T[], weights: number[]): T | undefined {
    if (items.length === 0 || items.length !== weights.length) {
      return undefined
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0)
    let random = Math.random() * totalWeight

    for (let i = 0; i < items.length; i++) {
      random -= weights[i]!
      if (random <= 0) {
        return items[i]
      }
    }

    return items[items.length - 1]
  }

  /**
   * 生成随机日期
   * @param start 开始日期
   * @param end 结束日期
   * @returns 随机日期
   */
  static date(start?: Date, end?: Date): Date {
    const startDate = start || new Date(2000, 0, 1)
    const endDate = end || new Date()

    const startTime = startDate.getTime()
    const endTime = endDate.getTime()

    const randomTime = this.integer(startTime, endTime)
    return new Date(randomTime)
  }

  /**
   * 生成随机时间戳
   * @param start 开始日期
   * @param end 结束日期
   * @returns 随机时间戳
   */
  static timestamp(start?: Date, end?: Date): number {
    return this.date(start, end).getTime()
  }

  /**
   * 生成随机IP地址
   * @returns IP地址字符串
   */
  static ipAddress(): string {
    return [0, 0, 0, 0].map(() => this.integer(0, 255)).join('.')
  }

  /**
   * 生成随机MAC地址
   * @returns MAC地址字符串
   */
  static macAddress(): string {
    const hex = '0123456789ABCDEF'
    let result = ''
    for (let i = 0; i < 6; i++) {
      if (i > 0) {
        result += ':'
      }
      result += hex[this.integer(0, 15)]! + hex[this.integer(0, 15)]!
    }
    return result
  }

  /**
   * 生成随机手机号（中国大陆）
   * @returns 手机号字符串
   */
  static phoneNumber(): string {
    const prefixes = [
      '130',
      '131',
      '132',
      '133',
      '134',
      '135',
      '136',
      '137',
      '138',
      '139',
      '145',
      '147',
      '149',
      '150',
      '151',
      '152',
      '153',
      '155',
      '156',
      '157',
      '158',
      '159',
      '165',
      '166',
      '167',
      '170',
      '171',
      '172',
      '173',
      '174',
      '175',
      '176',
      '177',
      '178',
      '180',
      '181',
      '182',
      '183',
      '184',
      '185',
      '186',
      '187',
      '188',
      '189',
      '191',
      '198',
      '199'
    ]
    const prefix = this.pick(prefixes)!
    const suffix = this.numberString(8)
    return prefix + suffix
  }

  /**
   * 生成随机身份证号（中国大陆，18位）
   * @returns 身份证号字符串
   */
  static idCard(): string {
    const areaCode = this.numberString(6)
    const birthYear = this.integer(1950, 2000)
    const birthMonth = this.integer(1, 12).toString().padStart(2, '0')
    const birthDay = this.integer(1, 28).toString().padStart(2, '0')
    const sequence = this.numberString(3)
    const base = areaCode + birthYear + birthMonth + birthDay + sequence

    // 计算校验码
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
    let sum = 0
    for (let i = 0; i < 17; i++) {
      sum += Number(base[i]) * weights[i]!
    }
    const checkCode = checkCodes[sum % 11]

    return base + checkCode
  }

  /**
   * 生成随机邮箱
   * @returns 邮箱字符串
   */
  static email(): string {
    const domains = [
      'gmail.com',
      'qq.com',
      '163.com',
      '126.com',
      'outlook.com',
      'hotmail.com',
      'yahoo.com'
    ]
    const username = this.alphanumericString(this.integer(5, 15))
    const domain = this.pick(domains)!
    return `${username}@${domain}`
  }

  /**
   * 生成随机URL
   * @returns URL字符串
   */
  static url(): string {
    const protocols = ['http', 'https']
    const domains = ['example.com', 'test.com', 'demo.com', 'sample.com']
    const paths = ['api', 'docs', 'blog', 'news', 'products']
    const protocol = this.pick(protocols)!
    const domain = this.pick(domains)!
    const path = this.pick(paths)!
    const id = this.integer(1, 1000)
    return `${protocol}://${domain}/${path}/${id}`
  }

  /**
   * 生成随机用户名
   * @returns 用户名字符串
   */
  static username(): string {
    const prefixes = ['user', 'player', 'guest', 'member', 'admin']
    const prefix = this.pick(prefixes)!
    const suffix = this.integer(1000, 9999)
    return `${prefix}_${suffix}`
  }

  /**
   * 生成随机密码
   * @param length 密码长度，默认为12
   * @param options 配置选项
   * @returns 密码字符串
   */
  static password(
    length = 12,
    options: {
      lowercase?: boolean
      uppercase?: boolean
      numbers?: boolean
      symbols?: boolean
    } = {}
  ): string {
    const { lowercase = true, uppercase = true, numbers = true, symbols = true } = options

    let chars = ''
    if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
    if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (numbers) chars += '0123456789'
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

    if (chars === '') {
      chars = 'abcdefghijklmnopqrstuvwxyz'
    }

    let password = ''
    for (let i = 0; i < length; i++) {
      password += chars[this.integer(0, chars.length - 1)]
    }
    return password
  }

  /**
   * 生成随机中文姓名
   * @returns 中文姓名字符串
   */
  static chineseName(): string {
    const surnames = [
      '王',
      '李',
      '张',
      '刘',
      '陈',
      '杨',
      '黄',
      '赵',
      '吴',
      '周',
      '徐',
      '孙',
      '马',
      '朱',
      '胡',
      '郭',
      '何',
      '林',
      '高',
      '罗'
    ]
    const names1 = [
      '伟',
      '芳',
      '娜',
      '秀英',
      '敏',
      '静',
      '丽',
      '强',
      '磊',
      '军',
      '洋',
      '勇',
      '艳',
      '杰',
      '娟',
      '涛',
      '明',
      '超',
      '秀兰',
      '霞'
    ]
    const names2 = ['平', '华', '文', '志', '建', '国', '永', '世', '家', '德']

    const surname = this.pick(surnames)!
    const hasMiddleName = this.boolean()
    let name = this.pick(names1)!
    if (hasMiddleName) {
      name += this.pick(names2)!
    }

    return surname + name
  }

  /**
   * 生成随机地址（中国大陆）
   * @returns 地址字符串
   */
  static address(): string {
    const provinces = ['北京市', '上海市', '广东省', '浙江省', '江苏省', '四川省']
    const cities = ['市辖区', '广州市', '深圳市', '杭州市', '南京市', '成都市']
    const districts = ['朝阳区', '海淀区', '浦东新区', '天河区', '福田区', '西湖区']
    const streets = ['人民路', '建设路', '解放路', '中山路', '和平路', '友谊路']
    const numbers = ['1号', '2号', '3号', '5号', '8号', '10号']

    const province = this.pick(provinces)!
    const city = this.pick(cities)!
    const district = this.pick(districts)!
    const street = this.pick(streets)!
    const number = this.pick(numbers)!

    return `${province}${city}${district}${street}${number}`
  }

  /**
   * 生成随机公司名称
   * @returns 公司名称字符串
   */
  static companyName(): string {
    const prefixes = ['北京', '上海', '广州', '深圳', '杭州', '成都']
    const names = ['科技', '网络', '信息', '数据', '软件', '智能']
    const suffixes = ['有限公司', '股份有限公司', '科技有限公司', '网络技术有限公司']

    const prefix = this.pick(prefixes)!
    const name = this.pick(names)!
    const suffix = this.pick(suffixes)!

    return `${prefix}${name}${suffix}`
  }

  /**
   * 生成随机银行卡号（16位）
   * @returns 银行卡号字符串
   */
  static bankCard(): string {
    return this.numberString(16)
  }
}

// 导出默认实例
export default RandomUtils
