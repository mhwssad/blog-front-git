/**
 * 日期时间工具类
 * 基于 date-fns 封装的常用时间处理方法
 */

import {
  format,
  parseISO,
  isValid,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isAfter,
  isBefore,
  isEqual,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  formatDistanceToNow,
  formatRelative,
  parse,
  set,
  getDay,
  getDate,
  getMonth,
  getYear,
  getHours,
  getMinutes,
  getSeconds,
  isToday,
  isYesterday,
  isTomorrow,
  isFuture,
  isPast,
  closestTo,
  max,
  min,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
  intervalToDuration,
  isWithinInterval
} from 'date-fns'
import { zhCN } from 'date-fns/locale'

/**
 * 日期时间工具类
 */
export class DateUtils {
  /**
   * 格式化日期
   * @param date 日期对象、时间戳或日期字符串
   * @param formatStr 格式化字符串，默认为 'yyyy-MM-dd HH:mm:ss'
   * @returns 格式化后的日期字符串
   */
  static formatDate(date: Date | number | string, formatStr = 'yyyy-MM-dd HH:mm:ss'): string {
    let dateObj: Date

    if (typeof date === 'string') {
      dateObj = parseISO(date)
    } else if (typeof date === 'number') {
      dateObj = new Date(date)
    } else {
      dateObj = date
    }

    if (!isValid(dateObj)) {
      return ''
    }

    return format(dateObj, formatStr, { locale: zhCN })
  }

  /**
   * 格式化为短日期
   * @param date 日期
   * @returns 格式化后的短日期字符串
   */
  static formatShortDate(date: Date | number | string): string {
    return this.formatDate(date, 'yyyy-MM-dd')
  }

  /**
   * 格式化为短时间
   * @param date 日期
   * @returns 格式化后的短时间字符串
   */
  static formatShortTime(date: Date | number | string): string {
    return this.formatDate(date, 'HH:mm:ss')
  }

  /**
   * 格式化为中文日期
   * @param date 日期
   * @returns 格式化后的中文日期字符串
   */
  static formatChineseDate(date: Date | number | string): string {
    return this.formatDate(date, 'yyyy年MM月dd日')
  }

  /**
   * 格式化为中文日期时间
   * @param date 日期
   * @returns 格式化后的中文日期时间字符串
   */
  static formatChineseDateTime(date: Date | number | string): string {
    return this.formatDate(date, 'yyyy年MM月dd日 HH时mm分ss秒')
  }

  /**
   * 解析日期字符串
   * @param dateStr 日期字符串
   * @param formatStr 格式化字符串
   * @returns 日期对象
   */
  static parseDate(dateStr: string, formatStr = 'yyyy-MM-dd HH:mm:ss'): Date {
    return parse(dateStr, formatStr, new Date())
  }

  /**
   * 获取当前时间戳
   * @returns 当前时间戳
   */
  static now(): number {
    return Date.now()
  }

  /**
   * 获取当前日期对象
   * @returns 当前日期对象
   */
  static today(): Date {
    return new Date()
  }

  /**
   * 日期加法
   * @param date 原始日期
   * @param amount 数量
   * @param unit 单位：days, weeks, months, years
   * @returns 计算后的日期
   */
  static add(
    date: Date | number | string,
    amount: number,
    unit: 'days' | 'weeks' | 'months' | 'years'
  ): Date {
    const dateObj = this.toDate(date)

    switch (unit) {
      case 'days':
        return addDays(dateObj, amount)
      case 'weeks':
        return addWeeks(dateObj, amount)
      case 'months':
        return addMonths(dateObj, amount)
      case 'years':
        return addYears(dateObj, amount)
      default:
        return dateObj
    }
  }

  /**
   * 日期减法
   * @param date 原始日期
   * @param amount 数量
   * @param unit 单位：days, weeks, months, years
   * @returns 计算后的日期
   */
  static subtract(
    date: Date | number | string,
    amount: number,
    unit: 'days' | 'weeks' | 'months' | 'years'
  ): Date {
    const dateObj = this.toDate(date)

    switch (unit) {
      case 'days':
        return subDays(dateObj, amount)
      case 'weeks':
        return subWeeks(dateObj, amount)
      case 'months':
        return subMonths(dateObj, amount)
      case 'years':
        return subYears(dateObj, amount)
      default:
        return dateObj
    }
  }

  /**
   * 获取日期开始时间
   * @param date 日期
   * @param unit 单位：day, week, month, year
   * @returns 开始时间
   */
  static startOf(date: Date | number | string, unit: 'day' | 'week' | 'month' | 'year'): Date {
    const dateObj = this.toDate(date)

    switch (unit) {
      case 'day':
        return startOfDay(dateObj)
      case 'week':
        return startOfWeek(dateObj, { weekStartsOn: 1 })
      case 'month':
        return startOfMonth(dateObj)
      case 'year':
        return startOfYear(dateObj)
      default:
        return dateObj
    }
  }

  /**
   * 获取日期结束时间
   * @param date 日期
   * @param unit 单位：day, week, month, year
   * @returns 结束时间
   */
  static endOf(date: Date | number | string, unit: 'day' | 'week' | 'month' | 'year'): Date {
    const dateObj = this.toDate(date)

    switch (unit) {
      case 'day':
        return endOfDay(dateObj)
      case 'week':
        return endOfWeek(dateObj, { weekStartsOn: 1 })
      case 'month':
        return endOfMonth(dateObj)
      case 'year':
        return endOfYear(dateObj)
      default:
        return dateObj
    }
  }

  /**
   * 比较日期
   * @param dateLeft 第一个日期
   * @param dateRight 第二个日期
   * @param comparison 比较类型：after, before, equal, sameDay, sameWeek, sameMonth, sameYear
   * @returns 比较结果
   */
  static compare(
    dateLeft: Date | number | string,
    dateRight: Date | number | string,
    comparison: 'after' | 'before' | 'equal' | 'sameDay' | 'sameWeek' | 'sameMonth' | 'sameYear'
  ): boolean {
    const leftDate = this.toDate(dateLeft)
    const rightDate = this.toDate(dateRight)

    switch (comparison) {
      case 'after':
        return isAfter(leftDate, rightDate)
      case 'before':
        return isBefore(leftDate, rightDate)
      case 'equal':
        return isEqual(leftDate, rightDate)
      case 'sameDay':
        return isSameDay(leftDate, rightDate)
      case 'sameWeek':
        return isSameWeek(leftDate, rightDate)
      case 'sameMonth':
        return isSameMonth(leftDate, rightDate)
      case 'sameYear':
        return isSameYear(leftDate, rightDate)
      default:
        return false
    }
  }

  /**
   * 计算日期差值
   * @param dateLeft 第一个日期
   * @param dateRight 第二个日期
   * @param unit 单位：days, weeks, months, years, hours, minutes, seconds
   * @returns 差值
   */
  static difference(
    dateLeft: Date | number | string,
    dateRight: Date | number | string,
    unit: 'days' | 'weeks' | 'months' | 'years' | 'hours' | 'minutes' | 'seconds'
  ): number {
    const leftDate = this.toDate(dateLeft)
    const rightDate = this.toDate(dateRight)

    switch (unit) {
      case 'days':
        return differenceInDays(leftDate, rightDate)
      case 'weeks':
        return differenceInWeeks(leftDate, rightDate)
      case 'months':
        return differenceInMonths(leftDate, rightDate)
      case 'years':
        return differenceInYears(leftDate, rightDate)
      case 'hours':
        return differenceInHours(leftDate, rightDate)
      case 'minutes':
        return differenceInMinutes(leftDate, rightDate)
      case 'seconds':
        return differenceInSeconds(leftDate, rightDate)
      default:
        return 0
    }
  }

  /**
   * 格式化相对时间
   * @param date 日期
   * @param addSuffix 是否添加后缀
   * @returns 相对时间字符串
   */
  static formatRelativeTime(date: Date | number | string, addSuffix = true): string {
    const dateObj = this.toDate(date)
    return formatDistanceToNow(dateObj, { addSuffix, locale: zhCN })
  }

  /**
   * 格式化为相对日期
   * @param date 日期
   * @param baseDate 基准日期，默认为当前日期
   * @returns 相对日期字符串
   */
  static formatRelative(date: Date | number | string, baseDate: Date = new Date()): string {
    const dateObj = this.toDate(date)
    return formatRelative(dateObj, baseDate, { locale: zhCN })
  }

  /**
   * 设置日期时间
   * @param date 原始日期
   * @param values 要设置的值
   * @returns 设置后的日期
   */
  static setDate(
    date: Date | number | string,
    values: {
      year?: number
      month?: number
      date?: number
      hours?: number
      minutes?: number
      seconds?: number
    }
  ): Date {
    const dateObj = this.toDate(date)
    return set(dateObj, values)
  }

  /**
   * 获取日期的某个部分
   * @param date 日期
   * @param part 部分：day, date, month, year, hours, minutes, seconds
   * @returns 对应的值
   */
  static get(
    date: Date | number | string,
    part: 'day' | 'date' | 'month' | 'year' | 'hours' | 'minutes' | 'seconds'
  ): number {
    const dateObj = this.toDate(date)

    switch (part) {
      case 'day':
        return getDay(dateObj)
      case 'date':
        return getDate(dateObj)
      case 'month':
        return getMonth(dateObj)
      case 'year':
        return getYear(dateObj)
      case 'hours':
        return getHours(dateObj)
      case 'minutes':
        return getMinutes(dateObj)
      case 'seconds':
        return getSeconds(dateObj)
      default:
        return 0
    }
  }

  /**
   * 检查是否为今天
   * @param date 日期
   * @returns 是否为今天
   */
  static isToday(date: Date | number | string): boolean {
    const dateObj = this.toDate(date)
    return isToday(dateObj)
  }

  /**
   * 检查是否为昨天
   * @param date 日期
   * @returns 是否为昨天
   */
  static isYesterday(date: Date | number | string): boolean {
    const dateObj = this.toDate(date)
    return isYesterday(dateObj)
  }

  /**
   * 检查是否为明天
   * @param date 日期
   * @returns 是否为明天
   */
  static isTomorrow(date: Date | number | string): boolean {
    const dateObj = this.toDate(date)
    return isTomorrow(dateObj)
  }

  /**
   * 检查是否为未来日期
   * @param date 日期
   * @returns 是否为未来日期
   */
  static isFuture(date: Date | number | string): boolean {
    const dateObj = this.toDate(date)
    return isFuture(dateObj)
  }

  /**
   * 检查是否为过去日期
   * @param date 日期
   * @returns 是否为过去日期
   */
  static isPast(date: Date | number | string): boolean {
    const dateObj = this.toDate(date)
    return isPast(dateObj)
  }

  /**
   * 检查日期是否有效
   * @param date 日期
   * @returns 是否有效
   */
  static isValid(date: Date | number | string): boolean {
    let dateObj: Date

    if (typeof date === 'string') {
      dateObj = parseISO(date)
    } else if (typeof date === 'number') {
      dateObj = new Date(date)
    } else {
      dateObj = date
    }

    return isValid(dateObj)
  }

  /**
   * 获取最近的日期
   * @param dateToCompare 比较的日期
   * @param dates 日期数组
   * @returns 最近的日期
   */
  static closestTo(
    dateToCompare: Date | number | string,
    dates: Array<Date | number | string>
  ): Date | undefined {
    const dateObj = this.toDate(dateToCompare)
    const dateObjects = dates.map((date) => this.toDate(date))
    return closestTo(dateObj, dateObjects)
  }

  /**
   * 获取最大的日期
   * @param dates 日期数组
   * @returns 最大的日期
   */
  static max(dates: Array<Date | number | string>): Date | null {
    const dateObjects = dates.map((date) => this.toDate(date))
    return max(dateObjects)
  }

  /**
   * 获取最小的日期
   * @param dates 日期数组
   * @returns 最小的日期
   */
  static min(dates: Array<Date | number | string>): Date | null {
    const dateObjects = dates.map((date) => this.toDate(date))
    return min(dateObjects)
  }

  /**
   * 获取日期区间内的所有日期
   * @param start 开始日期
   * @param end 结束日期
   * @returns 日期数组
   */
  static eachDayOfInterval(start: Date | number | string, end: Date | number | string): Date[] {
    const startDate = this.toDate(start)
    const endDate = this.toDate(end)
    return eachDayOfInterval({ start: startDate, end: endDate })
  }

  /**
   * 获取日期区间内的所有周
   * @param start 开始日期
   * @param end 结束日期
   * @returns 周数组
   */
  static eachWeekOfInterval(start: Date | number | string, end: Date | number | string): Date[] {
    const startDate = this.toDate(start)
    const endDate = this.toDate(end)
    return eachWeekOfInterval({ start: startDate, end: endDate })
  }

  /**
   * 获取日期区间内的所有月
   * @param start 开始日期
   * @param end 结束日期
   * @returns 月数组
   */
  static eachMonthOfInterval(start: Date | number | string, end: Date | number | string): Date[] {
    const startDate = this.toDate(start)
    const endDate = this.toDate(end)
    return eachMonthOfInterval({ start: startDate, end: endDate })
  }

  /**
   * 获取日期区间内的所有年
   * @param start 开始日期
   * @param end 结束日期
   * @returns 年数组
   */
  static eachYearOfInterval(start: Date | number | string, end: Date | number | string): Date[] {
    const startDate = this.toDate(start)
    const endDate = this.toDate(end)
    return eachYearOfInterval({ start: startDate, end: endDate })
  }

  /**
   * 计算日期区间持续时间
   * @param start 开始日期
   * @param end 结束日期
   * @returns 持续时间对象
   */
  static intervalToDuration(start: Date | number | string, end: Date | number | string) {
    const startDate = this.toDate(start)
    const endDate = this.toDate(end)
    return intervalToDuration({ start: startDate, end: endDate })
  }

  /**
   * 检查日期是否在区间内
   * @param date 检查的日期
   * @param start 开始日期
   * @param end 结束日期
   * @returns 是否在区间内
   */
  static isWithinInterval(
    date: Date | number | string,
    start: Date | number | string,
    end: Date | number | string
  ): boolean {
    const dateObj = this.toDate(date)
    const startDate = this.toDate(start)
    const endDate = this.toDate(end)
    return isWithinInterval(dateObj, { start: startDate, end: endDate })
  }

  /**
   * 时区转换：本地时间转UTC时间
   * @param date 本地时间
   * @param timeZone 时区，如 'Asia/Shanghai'
   * @returns UTC时间
   */
  static localToUtc(date: Date | number | string): Date {
    const dateObj = this.toDate(date)
    // 使用toLocaleString获取指定时区的时间字符串，然后解析为UTC时间
    const timeString = dateObj.toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })

    // 解析时间字符串并创建UTC日期
    const [datePart, timePart] = timeString.split(', ')
    const [month, day, year] = datePart!.split('/')
    const [hours, minutes, seconds] = timePart!.split(':')

    return new Date(
      Date.UTC(
        parseInt(year!),
        parseInt(month!) - 1,
        parseInt(day!),
        parseInt(hours!),
        parseInt(minutes!),
        parseInt(seconds!)
      )
    )
  }

  /**
   * 时区转换：UTC时间转本地时间
   * @param date UTC时间
   * @param timeZone 时区，如 'Asia/Shanghai'
   * @returns 本地时间
   */
  static utcToLocal(date: Date | number | string, timeZone: string): Date {
    const dateObj = this.toDate(date)
    // 使用toLocaleString转换为指定时区的时间字符串
    const timeString = dateObj.toLocaleString('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })

    // 解析时间字符串并创建日期
    const [datePart, timePart] = timeString.split(', ')
    const [month, day, year] = datePart!.split('/')
    const [hours, minutes, seconds] = timePart!.split(':')

    return new Date(
      parseInt(year!),
      parseInt(month!) - 1,
      parseInt(day!),
      parseInt(hours!),
      parseInt(minutes!),
      parseInt(seconds!)
    )
  }

  /**
   * 格式化时区时间
   * @param date 日期
   * @param formatStr 格式化字符串
   * @param timeZone 时区，如 'Asia/Shanghai'
   * @returns 格式化后的时间字符串
   */
  static formatTimeZone(
    date: Date | number | string,
    formatStr = 'yyyy-MM-dd HH:mm:ss',
    timeZone: string
  ): string {
    const dateObj = this.toDate(date)
    // 使用标准format函数，添加时区信息
    const formatted = format(dateObj, formatStr, { locale: zhCN })
    const offset = dateObj.getTimezoneOffset()
    const offsetHours = Math.floor(Math.abs(offset) / 60)
    const offsetMinutes = Math.abs(offset) % 60
    const offsetSign = offset <= 0 ? '+' : '-'
    const offsetString = `UTC${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`
    return `${formatted} ${offsetString} (${timeZone})`
  }

  /**
   * 转换为Date对象
   * @param date 日期
   * @returns Date对象
   */
  private static toDate(date: Date | number | string): Date {
    if (typeof date === 'string') {
      return parseISO(date)
    } else if (typeof date === 'number') {
      return new Date(date)
    } else {
      return date
    }
  }

  /**
   * 获取当前时间戳（秒）
   * @returns 当前时间戳（秒）
   */
  static timestamp(): number {
    return Math.floor(Date.now() / 1000)
  }

  /**
   * 时间戳转日期
   * @param timestamp 时间戳（毫秒）
   * @returns 日期对象
   */
  static fromTimestamp(timestamp: number): Date {
    return new Date(timestamp)
  }

  /**
   * 时间戳转日期字符串
   * @param timestamp 时间戳（毫秒）
   * @param formatStr 格式化字符串
   * @returns 格式化后的日期字符串
   */
  static formatTimestamp(timestamp: number, formatStr = 'yyyy-MM-dd HH:mm:ss'): string {
    return this.formatDate(this.fromTimestamp(timestamp), formatStr)
  }

  /**
   * 获取友好的时间显示
   * @param date 日期
   * @returns 友好的时间显示
   */
  static friendlyTime(date: Date | number | string): string {
    const dateObj = this.toDate(date)

    if (this.isToday(dateObj)) {
      return `今天 ${this.formatDate(dateObj, 'HH:mm')}`
    } else if (this.isYesterday(dateObj)) {
      return `昨天 ${this.formatDate(dateObj, 'HH:mm')}`
    } else if (this.isTomorrow(dateObj)) {
      return `明天 ${this.formatDate(dateObj, 'HH:mm')}`
    } else {
      // 如果是今年，不显示年份
      if (this.isSameYear(dateObj, new Date())) {
        return this.formatDate(dateObj, 'MM-dd HH:mm')
      } else {
        return this.formatDate(dateObj, 'yyyy-MM-dd HH:mm')
      }
    }
  }

  /**
   * 检查是否为闰年
   * @param year 年份
   * @returns 是否为闰年
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  }

  /**
   * 获取月份的天数
   * @param year 年份
   * @param month 月份（0-11）
   * @returns 天数
   */
  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate()
  }

  /**
   * 检查是否为同一年
   * @param date1 日期1
   * @param date2 日期2
   * @returns 是否为同一年
   */
  static isSameYear(date1: Date | number | string, date2: Date | number | string): boolean {
    const dateObj1 = this.toDate(date1)
    const dateObj2 = this.toDate(date2)
    return getYear(dateObj1) === getYear(dateObj2)
  }

  /**
   * 获取星期几的中文表示
   * @param date 日期
   * @returns 星期几的中文表示
   */
  static getChineseDayOfWeek(date: Date | number | string): string {
    const dateObj = this.toDate(date)
    const day = getDay(dateObj)
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    return days[day]!
  }

  /**
   * 获取月份的中文表示
   * @param date 日期
   * @returns 月份的中文表示
   */
  static getChineseMonth(date: Date | number | string): string {
    const dateObj = this.toDate(date)
    const month = getMonth(dateObj)
    const months = [
      '一月',
      '二月',
      '三月',
      '四月',
      '五月',
      '六月',
      '七月',
      '八月',
      '九月',
      '十月',
      '十一月',
      '十二月'
    ]
    return months[month]!
  }
}

// 导出默认实例
export default DateUtils
