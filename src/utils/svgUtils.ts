/**
 * SVG 图标工具类
 */

/**
 * 已注册的 SVG 图标集合
 */
const registeredIcons = new Set<string>()

/**
 * 注册 SVG 图标
 * @param iconName 图标名称
 */
export function registerSvgIcon(iconName: string): void {
  registeredIcons.add(iconName)
}

/**
 * 批量注册 SVG 图标
 * @param icons 图标名称数组
 */
export function registerSvgIcons(icons: string[]): void {
  icons.forEach((icon) => registeredIcons.add(icon))
}

/**
 * 检查 SVG 图标是否已注册
 * @param iconName 图标名称
 */
export function hasSvgIcon(iconName: string): boolean {
  return registeredIcons.has(iconName)
}

/**
 * 获取所有已注册的 SVG 图标
 */
export function getRegisteredIcons(): string[] {
  return Array.from(registeredIcons)
}

/**
 * 清除所有已注册的 SVG 图标
 */
export function clearRegisteredIcons(): void {
  registeredIcons.clear()
}

/**
 * 将 SVG 字符串转换为 DOM 元素
 * @param svgString SVG 字符串
 * @returns SVG 元素
 */
export function svgStringToElement(svgString: string): SVGSVGElement | null {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')
  const svgElement = doc.querySelector('svg')
  return svgElement as SVGSVGElement | null
}

/**
 * 获取 SVG 元素的 viewBox 属性
 * @param svgElement SVG 元素
 * @returns viewBox 字符串
 */
export function getSvgViewBox(svgElement: SVGSVGElement): string {
  return svgElement.getAttribute('viewBox') || '0 0 16 16'
}

/**
 * 提取 SVG 内容（去除 svg 标签）
 * @param svgString SVG 字符串
 * @returns SVG 内容
 */
export function extractSvgContent(svgString: string): string {
  // 移除 XML 声明
  const content = svgString.replace(/<\?xml[^>]*\?>/g, '')

  // 提取 svg 标签内的内容
  const match = content.match(/<svg[^>]*>([\s\S]*)<\/svg>/)
  if (match && match[1]) {
    return match[1].trim()
  }

  return content
}

/**
 * 为 SVG 内容添加 ID（用于 sprites）
 * @param svgContent SVG 内容
 * @param id 图标 ID
 * @returns 处理后的 SVG 内容
 */
export function addSvgId(svgContent: string, id: string): string {
  // 检查是否已经有 id 属性
  if (svgContent.includes('id=')) {
    return svgContent
  }

  // 在第一个标签中添加 id 属性
  return svgContent.replace(/<([a-z][a-z0-9]*)/i, `<$1 id="icon-${id}"`)
}

/**
 * 合并多个 SVG 为一个 sprite
 * @param svgs SVG 对象数组，包含 name 和 svgString
 * @returns 合并后的 SVG sprite 字符串
 */
export function mergeSvgSprites(svgs: Array<{ name: string; svgString: string }>): string {
  let viewBox = '0 0 16 16'
  const symbols: string[] = []

  for (const { name, svgString } of svgs) {
    const svgElement = svgStringToElement(svgString)
    if (svgElement) {
      viewBox = getSvgViewBox(svgElement)
      const content = extractSvgContent(svgString)
      const symbol = `<symbol id="icon-${name}" viewBox="${viewBox}">${content}</symbol>`
      symbols.push(symbol)
      registerSvgIcon(name)
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display:none;">${symbols.join('')}</svg>`
}
