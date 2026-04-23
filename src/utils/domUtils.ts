/**
 * DOM操作工具类
 * 提供常用的DOM元素操作、样式操作、事件处理等功能
 */

export class DomUtils {
  /**
   * 根据选择器获取DOM元素
   * @param selector CSS选择器
   * @param context 查询上下文，默认为document
   * @returns 匹配的第一个元素或null
   */
  static querySelector<T extends Element = Element>(
    selector: string,
    context: Document | Element = document
  ): T | null {
    return context.querySelector<T>(selector)
  }

  /**
   * 根据选择器获取所有匹配的DOM元素
   * @param selector CSS选择器
   * @param context 查询上下文，默认为document
   * @returns 匹配的元素数组
   */
  static querySelectorAll<T extends Element = Element>(
    selector: string,
    context: Document | Element = document
  ): T[] {
    return Array.from(context.querySelectorAll<T>(selector))
  }

  /**
   * 创建DOM元素
   * @param tagName 标签名
   * @param attributes 属性对象
   * @param textContent 文本内容
   * @param children 子元素
   * @returns 创建的DOM元素
   */
  static createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    attributes?: Record<string, string>,
    textContent?: string,
    children?: (Node | string)[]
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName)

    // 设置属性
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
          element.className = value
        } else if (key === 'innerHTML') {
          element.innerHTML = value
        } else if (key === 'textContent') {
          element.textContent = value
        } else {
          element.setAttribute(key, value)
        }
      })
    }

    // 设置文本内容
    if (textContent !== undefined) {
      element.textContent = textContent
    }

    // 添加子元素
    if (children) {
      children.forEach((child) => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child))
        } else {
          element.appendChild(child)
        }
      })
    }

    return element
  }

  /**
   * 添加CSS类
   * @param element DOM元素
   * @param classNames 类名，可以是字符串或数组
   */
  static addClass(element: Element, classNames: string | string[]): void {
    if (typeof classNames === 'string') {
      element.classList.add(classNames)
    } else {
      element.classList.add(...classNames)
    }
  }

  /**
   * 移除CSS类
   * @param element DOM元素
   * @param classNames 类名，可以是字符串或数组
   */
  static removeClass(element: Element, classNames: string | string[]): void {
    if (typeof classNames === 'string') {
      element.classList.remove(classNames)
    } else {
      element.classList.remove(...classNames)
    }
  }

  /**
   * 切换CSS类
   * @param element DOM元素
   * @param className 类名
   * @returns 切换后是否包含该类
   */
  static toggleClass(element: Element, className: string): boolean {
    return element.classList.toggle(className)
  }

  /**
   * 检查是否包含指定CSS类
   * @param element DOM元素
   * @param className 类名
   * @returns 是否包含该类
   */
  static hasClass(element: Element, className: string): boolean {
    return element.classList.contains(className)
  }

  /**
   * 获取元素的计算样式
   * @param element DOM元素
   * @param property CSS属性名
   * @returns 属性值
   */
  static getComputedStyle(element: Element, property: string): string {
    return window.getComputedStyle(element).getPropertyValue(property)
  }

  /**
   * 设置元素样式
   * @param element DOM元素
   * @param styles 样式对象
   */
  static setStyle(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
    Object.entries(styles).forEach(([property, value]) => {
      if (value == null) {
        return
      }

      const style = element.style as unknown as Record<string, string>
      if (property in element.style) {
        style[property] = String(value)
      } else {
        element.style.setProperty(property, String(value))
      }
    })
  }

  /**
   * 获取元素相对于文档的位置
   * @param element DOM元素
   * @returns 位置信息 {top, left, width, height}
   */
  static getElementRect(element: Element): {
    top: number
    left: number
    width: number
    height: number
  } {
    const rect = element.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

    return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      width: rect.width,
      height: rect.height
    }
  }

  /**
   * 滚动元素到视图
   * @param element DOM元素
   * @param options 滚动选项
   */
  static scrollIntoView(element: Element, options: ScrollIntoViewOptions = {}): void {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
      ...options
    })
  }

  /**
   * 添加事件监听器
   * @param element DOM元素
   * @param event 事件类型
   * @param handler 事件处理函数
   * @param options 事件选项
   */
  static addEventListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    event: K,
    handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void

  static addEventListener(
    element: HTMLElement,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    element.addEventListener(event, handler, options)
  }

  /**
   * 移除事件监听器
   * @param element DOM元素
   * @param event 事件类型
   * @param handler 事件处理函数
   * @param options 事件选项
   */
  static removeEventListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    event: K,
    handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void,
    options?: boolean | EventListenerOptions
  ): void

  static removeEventListener(
    element: HTMLElement,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void {
    element.removeEventListener(event, handler, options)
  }

  /**
   * 触发自定义事件
   * @param element DOM元素
   * @param eventName 事件名称
   * @param detail 事件详情
   * @param options 事件选项
   */
  static dispatchCustomEvent<T = unknown>(
    element: Element,
    eventName: string,
    detail?: T,
    options?: CustomEventInit<T>
  ): void {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true,
      ...options
    })
    element.dispatchEvent(event)
  }

  /**
   * 显示元素
   * @param element DOM元素
   * @param display 显示类型，默认为'block'
   */
  static show(element: HTMLElement, display: string = 'block'): void {
    element.style.display = display
  }

  /**
   * 隐藏元素
   * @param element DOM元素
   */
  static hide(element: HTMLElement): void {
    element.style.display = 'none'
  }

  /**
   * 检查元素是否可见
   * @param element DOM元素
   * @returns 是否可见
   */
  static isVisible(element: HTMLElement): boolean {
    return element.style.display !== 'none' && element.offsetParent !== null
  }

  /**
   * 淡入效果
   * @param element DOM元素
   * @param duration 动画持续时间(ms)，默认为300
   * @returns Promise
   */
  static fadeIn(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      element.style.opacity = '0'
      element.style.display = 'block'

      const start = performance.now()
      const animate = (currentTime: number) => {
        const elapsed = currentTime - start
        const progress = Math.min(elapsed / duration, 1)
        element.style.opacity = progress.toString()

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }

      requestAnimationFrame(animate)
    })
  }

  /**
   * 淡出效果
   * @param element DOM元素
   * @param duration 动画持续时间(ms)，默认为300
   * @returns Promise
   */
  static fadeOut(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      const start = performance.now()
      const initialOpacity = parseFloat(window.getComputedStyle(element).opacity) || 1

      const animate = (currentTime: number) => {
        const elapsed = currentTime - start
        const progress = Math.min(elapsed / duration, 1)
        element.style.opacity = (initialOpacity * (1 - progress)).toString()

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          element.style.display = 'none'
          resolve()
        }
      }

      requestAnimationFrame(animate)
    })
  }

  /**
   * 在指定元素前插入新元素
   * @param newNode 新元素
   * @param referenceNode 参考元素
   */
  static insertBefore(newNode: Node, referenceNode: Node): void {
    referenceNode.parentNode?.insertBefore(newNode, referenceNode)
  }

  /**
   * 在指定元素后插入新元素
   * @param newNode 新元素
   * @param referenceNode 参考元素
   */
  static insertAfter(newNode: Node, referenceNode: Node): void {
    referenceNode.parentNode?.insertBefore(newNode, referenceNode.nextSibling)
  }

  /**
   * 移除元素
   * @param element 要移除的元素
   * @returns 被移除的元素
   */
  static remove(element: Element): Element {
    return element.parentNode?.removeChild(element) || element
  }

  /**
   * 清空元素的所有子节点
   * @param element 要清空的元素
   */
  static empty(element: Element): void {
    while (element.firstChild) {
      element.removeChild(element.firstChild)
    }
  }

  /**
   * 检查元素是否匹配选择器
   * @param element DOM元素
   * @param selector CSS选择器
   * @returns 是否匹配
   */
  static matches(element: Element, selector: string): boolean {
    return element.matches(selector)
  }

  /**
   * 查找最近的匹配祖先元素
   * @param element 起始元素
   * @param selector CSS选择器
   * @returns 匹配的祖先元素或null
   */
  static closest(element: Element, selector: string): Element | null {
    return element.closest(selector)
  }

  /**
   * 获取元素的子元素（不包括文本节点）
   * @param element 父元素
   * @returns 子元素数组
   */
  static children(element: Element): Element[] {
    return Array.from(element.children)
  }

  /**
   * 获取元素的下一个兄弟元素（不包括文本节点）
   * @param element 当前元素
   * @returns 下一个兄弟元素或null
   */
  static nextElementSibling(element: Element): Element | null {
    return element.nextElementSibling
  }

  /**
   * 获取元素的上一个兄弟元素（不包括文本节点）
   * @param element 当前元素
   * @returns 上一个兄弟元素或null
   */
  static previousElementSibling(element: Element): Element | null {
    return element.previousElementSibling
  }

  /**
   * 检查元素是否包含另一个元素
   * @param parent 父元素
   * @param child 子元素
   * @returns 是否包含
   */
  static contains(parent: Node, child: Node): boolean {
    return parent.contains(child)
  }

  /**
   * 复制元素
   * @param element 要复制的元素
   * @param deep 是否深度复制（包括子元素），默认为true
   * @returns 复制的元素
   */
  static clone(element: Element, deep: boolean = true): Element {
    return element.cloneNode(deep) as Element
  }

  /**
   * 获取元素的数据属性
   * @param element DOM元素
   * @param name 数据属性名（不带data-前缀）
   * @returns 属性值
   */
  static getData(element: HTMLElement, name: string): string | null {
    return element.dataset[name] ?? null
  }

  /**
   * 设置元素的数据属性
   * @param element DOM元素
   * @param name 数据属性名（不带data-前缀）
   * @param value 属性值
   */
  static setData(element: HTMLElement, name: string, value: string): void {
    element.dataset[name] = value
  }

  /**
   * 移除元素的数据属性
   * @param element DOM元素
   * @param name 数据属性名（不带data-前缀）
   */
  static removeData(element: HTMLElement, name: string): void {
    delete element.dataset[name]
  }
}

export default DomUtils
