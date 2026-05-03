import { log } from '@/composables/useLogger'

/**
 * 文件处理工具类
 * 提供常用的文件操作方法
 */

/**
 * 文件大小单位
 */
export enum FileSizeUnit {
  B = 'B',
  KB = 'KB',
  MB = 'MB',
  GB = 'GB',
  TB = 'TB'
}

/**
 * 文件类型映射
 */
export const FILE_TYPE_MAP: Record<string, string[]> = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'],
  video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
  audio: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'],
  document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz'],
  code: ['js', 'ts', 'html', 'css', 'json', 'xml', 'py', 'java', 'go', 'rs']
}

/**
 * 文件处理工具类
 */
export class FileUtils {
  /**
   * 格式化文件大小
   * @param bytes 文件大小（字节）
   * @param unit 单位，默认为自动
   * @param decimals 保留小数位数，默认为2
   * @returns 格式化后的文件大小
   */
  static formatFileSize(bytes: number, unit: FileSizeUnit | 'auto' = 'auto', decimals = 2): string {
    if (bytes === 0) return '0 B'

    const k = 1024
    const sizes = [
      FileSizeUnit.B,
      FileSizeUnit.KB,
      FileSizeUnit.MB,
      FileSizeUnit.GB,
      FileSizeUnit.TB
    ]
    const i = unit === 'auto' ? Math.floor(Math.log(bytes) / Math.log(k)) : sizes.indexOf(unit)

    if (i === -1) {
      throw new Error(`无效的文件单位: ${unit}`)
    }

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
  }

  /**
   * 将格式化的文件大小转换为字节数
   * @param sizeStr 格式化的文件大小，如 '1.5 MB'
   * @returns 字节数
   */
  static parseFileSize(sizeStr: string): number {
    const match = sizeStr.match(/^([\d.]+)\s*(B|KB|MB|GB|TB)$/i)
    if (!match || !match[1] || !match[2]) {
      throw new Error('无效的文件大小格式')
    }

    const value = parseFloat(match[1])
    const unit = match[2].toUpperCase() as FileSizeUnit

    const k = 1024
    const units = [
      FileSizeUnit.B,
      FileSizeUnit.KB,
      FileSizeUnit.MB,
      FileSizeUnit.GB,
      FileSizeUnit.TB
    ]
    const index = units.indexOf(unit)

    return Math.round(value * Math.pow(k, index))
  }

  /**
   * 获取文件扩展名
   * @param filename 文件名
   * @returns 扩展名（小写）
   */
  static getFileExtension(filename: string): string {
    const parts = filename.split('.')
    if (parts.length < 2) return ''
    return parts.pop()!.toLowerCase()
  }

  /**
   * 获取文件名（不含扩展名）
   * @param filename 文件名
   * @returns 文件名（不含扩展名）
   */
  static getFileName(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.')
    if (lastDotIndex === -1) return filename
    return filename.substring(0, lastDotIndex)
  }

  /**
   * 获取文件类型分类
   * @param filename 文件名或扩展名
   * @returns 文件类型分类
   */
  static getFileType(filename: string): string {
    const ext = this.getFileExtension(filename)
    for (const [type, extensions] of Object.entries(FILE_TYPE_MAP)) {
      if (extensions.includes(ext)) {
        return type
      }
    }
    return 'unknown'
  }

  /**
   * 检查文件类型是否匹配
   * @param filename 文件名
   * @param types 文件类型数组，如 ['image', 'video']
   * @returns 是否匹配
   */
  static isFileType(filename: string, types: string[]): boolean {
    const fileType = this.getFileType(filename)
    return types.includes(fileType)
  }

  /**
   * 检查文件扩展名是否匹配
   * @param filename 文件名
   * @param extensions 扩展名数组，如 ['jpg', 'png']
   * @returns 是否匹配
   */
  static isFileExtension(filename: string, extensions: string[]): boolean {
    const ext = this.getFileExtension(filename)
    return extensions.map((e) => e.toLowerCase()).includes(ext)
  }

  /**
   * 下载文件
   * @param url 文件URL
   * @param filename 文件名
   */
  static downloadFile(url: string, filename?: string): void {
    const link = document.createElement('a')
    link.href = url
    if (filename) {
      link.download = filename
    }
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * 下载Blob数据
   * @param blob Blob对象
   * @param filename 文件名
   */
  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    this.downloadFile(url, filename)
    URL.revokeObjectURL(url)
  }

  /**
   * 读取文件为文本
   * @param file 文件对象
   * @returns Promise<string>
   */
  static readAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }

  /**
   * 读取文件为DataURL
   * @param file 文件对象
   * @returns Promise<string>
   */
  static readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }

  /**
   * 读取文件为ArrayBuffer
   * @param file 文件对象
   * @returns Promise<ArrayBuffer>
   */
  static readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * 读取文件为Base64
   * @param file 文件对象
   * @returns Promise<string>
   */
  static readAsBase64(file: File): Promise<string> {
    return this.readAsDataURL(file).then((dataUrl) => {
      const base64 = dataUrl.split(',')[1]
      if (!base64) {
        throw new Error('无法解析Base64数据')
      }
      return base64
    })
  }

  /**
   * 压缩图片
   * @param file 图片文件
   * @param options 压缩选项
   * @returns Promise<Blob>
   */
  static compressImage(
    file: File,
    options: {
      maxWidth?: number
      maxHeight?: number
      quality?: number
      format?: 'image/jpeg' | 'image/png' | 'image/webp'
    } = {}
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const { maxWidth = 1920, maxHeight = 1080, quality = 0.8, format = 'image/jpeg' } = options

      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('无法创建Canvas上下文'))
          return
        }

        // 计算缩放比例
        let width = img.width
        let height = img.height
        const ratio = Math.min(maxWidth / width, maxHeight / height)

        if (ratio < 1) {
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        canvas.width = width
        canvas.height = height

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height)

        // 导出压缩后的图片
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('图片压缩失败'))
            }
          },
          format,
          quality
        )
      }

      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 将图片转换为Canvas
   * @param file 图片文件
   * @returns Promise<HTMLCanvasElement>
   */
  static imageToCanvas(file: File): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('无法创建Canvas上下文'))
          return
        }

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        resolve(canvas)
      }

      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 获取图片尺寸
   * @param file 图片文件
   * @returns Promise<{width: number, height: number}>
   */
  static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 导出CSV文件
   * @param data 数据数组
   * @param filename 文件名
   * @param headers 表头数组
   */
  static exportCSV(data: Record<string, unknown>[], filename: string, headers?: string[]): void {
    const csvContent = this.convertToCSV(data, headers)
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    this.downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`)
  }

  /**
   * 将数据转换为CSV格式
   * @param data 数据数组
   * @param headers 表头数组
   * @returns CSV字符串
   */
  static convertToCSV(data: Record<string, unknown>[], headers?: string[]): string {
    if (data.length === 0) return ''

    const keys = headers || Object.keys(data[0]!)
    const headerRow = keys.join(',')

    const rows = data.map((item) => {
      return keys
        .map((key) => {
          const value = item[key]
          // 处理包含逗号、引号或换行符的值
          if (value === null || value === undefined) return ''
          const strValue = String(value)
          if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
            return `"${strValue.replace(/"/g, '""')}"`
          }
          return strValue
        })
        .join(',')
    })

    return [headerRow, ...rows].join('\n')
  }

  /**
   * 导出JSON文件
   * @param data 数据对象
   * @param filename 文件名
   * @param pretty 是否格式化，默认为true
   */
  static exportJSON(data: unknown, filename: string, pretty = true): void {
    const jsonContent = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    this.downloadBlob(blob, filename.endsWith('.json') ? filename : `${filename}.json`)
  }

  /**
   * 导出文本文件
   * @param content 文本内容
   * @param filename 文件名
   */
  static exportText(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
    this.downloadBlob(blob, filename.endsWith('.txt') ? filename : `${filename}.txt`)
  }

  /**
   * 将DataURL转换为Blob
   * @param dataUrl DataURL字符串
   * @returns Blob对象
   */
  static dataURLToBlob(dataUrl: string): Blob {
    const parts = dataUrl.split(',')
    const mimeMatch = parts[0]?.match(/:(.*?);/)
    if (!mimeMatch || !parts[1]) {
      throw new Error('无效的DataURL格式')
    }
    const mime = mimeMatch[1]
    const bstr = atob(parts[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
  }

  /**
   * 将Blob转换为DataURL
   * @param blob Blob对象
   * @returns Promise<string>
   */
  static blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  }

  /**
   * 将Base64转换为Blob
   * @param base64 Base64字符串
   * @param mimeType MIME类型
   * @returns Blob对象
   */
  static base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64)
    const byteArrays: BlobPart[] = []

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512)
      const byteNumbers = new Array(slice.length)
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray.buffer)
    }

    return new Blob(byteArrays, { type: mimeType })
  }

  /**
   * 将Blob转换为Base64
   * @param blob Blob对象
   * @returns Promise<string>
   */
  static blobToBase64(blob: Blob): Promise<string> {
    return this.blobToDataURL(blob).then((dataUrl) => {
      const base64 = dataUrl.split(',')[1]
      if (!base64) {
        throw new Error('无法解析Base64数据')
      }
      return base64
    })
  }

  /**
   * 验证文件大小
   * @param file 文件对象
   * @param maxSize 最大大小（字节）
   * @returns 是否通过验证
   */
  static validateFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize
  }

  /**
   * 验证文件类型
   * @param file 文件对象
   * @param allowedTypes 允许的类型数组，如 ['image/jpeg', 'image/png']
   * @returns 是否通过验证
   */
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type)
  }

  /**
   * 验证文件扩展名
   * @param file 文件对象
   * @param allowedExtensions 允许的扩展名数组，如 ['jpg', 'png']
   * @returns 是否通过验证
   */
  static validateFileExtension(file: File, allowedExtensions: string[]): boolean {
    return this.isFileExtension(file.name, allowedExtensions)
  }

  /**
   * 获取MIME类型
   * @param filename 文件名
   * @returns MIME类型
   */
  static getMimeType(filename: string): string {
    const ext = this.getFileExtension(filename)
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      bmp: 'image/bmp',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      ico: 'image/x-icon',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain',
      json: 'application/json',
      xml: 'application/xml',
      html: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
      ts: 'application/typescript',
      mp3: 'audio/mpeg',
      mp4: 'video/mp4',
      zip: 'application/zip',
      rar: 'application/vnd.rar'
    }
    return mimeMap[ext] || 'application/octet-stream'
  }

  /**
   * 生成唯一文件名
   * @param filename 原始文件名
   * @returns 唯一文件名
   */
  static generateUniqueFilename(filename: string): string {
    const ext = this.getFileExtension(filename)
    const name = this.getFileName(filename)
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `${name}_${timestamp}_${random}.${ext}`
  }

  /**
   * 批量处理文件
   * @param files 文件数组
   * @param processor 处理函数
   * @returns Promise<T[]>
   */
  static async processFiles<T>(files: File[], processor: (file: File) => Promise<T>): Promise<T[]> {
    const results: T[] = []
    for (const file of files) {
      try {
        const result = await processor(file)
        results.push(result)
      } catch (error) {
        log.file.error(`处理文件 ${file.name} 失败`, error)
      }
    }
    return results
  }

  /**
   * 创建文件缩略图
   * @param file 图片文件
   * @param size 缩略图尺寸
   * @returns Promise<Blob>
   */
  static createThumbnail(file: File, size = 150): Promise<Blob> {
    return this.compressImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.8,
      format: 'image/jpeg'
    })
  }

  /**
   * 裁剪图片
   * @param file 图片文件
   * @param options 裁剪选项
   * @returns Promise<Blob>
   */
  static cropImage(
    file: File,
    options: {
      x: number
      y: number
      width: number
      height: number
      format?: 'image/jpeg' | 'image/png' | 'image/webp'
      quality?: number
    }
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const { x, y, width, height, format = 'image/jpeg', quality = 0.8 } = options

      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('无法创建Canvas上下文'))
          return
        }

        canvas.width = width
        canvas.height = height

        ctx.drawImage(img, x, y, width, height, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('图片裁剪失败'))
            }
          },
          format,
          quality
        )
      }

      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 旋转图片
   * @param file 图片文件
   * @param degrees 旋转角度（90的倍数）
   * @param format 输出格式
   * @returns Promise<Blob>
   */
  static rotateImage(
    file: File,
    degrees: number,
    format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('无法创建Canvas上下文'))
          return
        }

        // 标准化角度为0-360
        const normalizedDegrees = ((degrees % 360) + 360) % 360

        // 根据旋转角度设置画布尺寸
        if (normalizedDegrees === 90 || normalizedDegrees === 270) {
          canvas.width = img.height
          canvas.height = img.width
        } else {
          canvas.width = img.width
          canvas.height = img.height
        }

        // 移动原点到画布中心
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((normalizedDegrees * Math.PI) / 180)
        ctx.drawImage(img, -img.width / 2, -img.height / 2)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('图片旋转失败'))
            }
          },
          format,
          0.8
        )
      }

      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 合并多个文件
   * @param files 文件数组
   * @param filename 输出文件名
   */
  static mergeFiles(files: File[], filename: string): void {
    if (files.length === 0) {
      throw new Error('文件列表不能为空')
    }
    const blobs = files.map((file) => new Blob([file], { type: file.type }))
    const mergedBlob = new Blob(blobs, { type: files[0]!.type })
    this.downloadBlob(mergedBlob, filename)
  }

  /**
   * 截取文件片段
   * @param file 文件对象
   * @param start 开始位置
   * @param end 结束位置
   * @returns Blob
   */
  static sliceFile(file: File, start: number, end?: number): Blob {
    return file.slice(start, end)
  }

  /**
   * 获取文件信息
   * @param file 文件对象
   * @returns 文件信息对象
   */
  static getFileInfo(file: File): {
    name: string
    size: number
    sizeFormatted: string
    type: string
    extension: string
    category: string
    lastModified: Date
  } {
    return {
      name: file.name,
      size: file.size,
      sizeFormatted: this.formatFileSize(file.size),
      type: file.type,
      extension: this.getFileExtension(file.name),
      category: this.getFileType(file.name),
      lastModified: new Date(file.lastModified)
    }
  }
}

// 导出默认实例
export default FileUtils
