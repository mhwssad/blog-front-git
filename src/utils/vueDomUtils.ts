/**
 * Vue专用的DOM操作工具类
 * 提供与Vue框架更好集成的DOM操作方法
 */

import { nextTick } from 'vue'
import { DomUtils } from './domUtils'

class VueDomUtils {
  /**
   * 在Vue组件中安全地查询DOM元素
   * @param selector CSS选择器
   * @param componentRef Vue组件引用或DOM元素
   * @returns 匹配的第一个元素或null
   */
  static querySelector<T extends Element = Element>(
    selector: string,
    componentRef?: { $el?: Element } | Element
  ): T | null {
    const context = componentRef
      ? (('$el' in componentRef ? componentRef.$el : componentRef) as Element)
      : document

    return context.querySelector<T>(selector)
  }

  /**
   * 在Vue组件中安全地查询所有匹配的DOM元素
   * @param selector CSS选择器
   * @param componentRef Vue组件引用或DOM元素
   * @returns 匹配的元素数组
   */
  static querySelectorAll<T extends Element = Element>(
    selector: string,
    componentRef?: { $el?: Element } | Element
  ): T[] {
    const context = componentRef
      ? (('$el' in componentRef ? componentRef.$el : componentRef) as Element)
      : document

    return Array.from(context.querySelectorAll<T>(selector))
  }

  /**
   * 等待Vue更新完成后执行DOM操作
   * @param callback DOM操作回调函数
   */
  static async afterUpdate(callback: () => void): Promise<void> {
    await nextTick()
    callback()
  }

  /**
   * 获取Vue组件的根DOM元素
   * @param component Vue组件实例
   * @returns 根DOM元素或null
   */
  static getRootElement(component: { $el?: Element }): Element | null {
    return component.$el || null
  }

  /**
   * 获取Vue组件中具有ref属性的DOM元素
   * @param component Vue组件实例
   * @param refName ref名称
   * @returns DOM元素或null
   */
  static getRefElement<T extends Element = Element>(
    component: { $refs: Record<string, unknown> },
    refName: string
  ): T | null {
    const ref = component.$refs[refName]
    if (!ref) return null

    // 处理单个ref和数组ref的情况
    if (Array.isArray(ref)) {
      return ref.length > 0 ? ref[0] : null
    }

    return ref as T
  }

  /**
   * 获取Vue组件中所有具有相同ref名称的DOM元素
   * @param component Vue组件实例
   * @param refName ref名称
   * @returns DOM元素数组
   */
  static getRefElements<T extends Element = Element>(
    component: { $refs: Record<string, unknown> },
    refName: string
  ): T[] {
    const ref = component.$refs[refName]
    if (!ref) return []

    // 处理单个ref和数组ref的情况
    if (Array.isArray(ref)) {
      return ref.filter((el) => el instanceof Element) as T[]
    }

    return [ref].filter((el) => el instanceof Element) as T[]
  }

  /**
   * 为Vue组件中的元素添加事件监听器，并在组件卸载时自动清理
   * @param component Vue组件实例
   * @param element DOM元素
   * @param event 事件类型
   * @param handler 事件处理函数
   * @param options 事件选项
   */
  static addEventListenerWithCleanup<K extends keyof HTMLElementEventMap>(
    component: { onUnmounted?: (fn: () => void) => void },
    element: HTMLElement,
    event: K,
    handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void

  static addEventListenerWithCleanup(
    component: { onUnmounted?: (fn: () => void) => void },
    element: HTMLElement,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    element.addEventListener(event, handler, options)

    // 在组件卸载时移除事件监听器
    if (component.onUnmounted) {
      component.onUnmounted(() => {
        element.removeEventListener(event, handler, options)
      })
    }
  }

  /**
   * 为Vue组件中的元素添加IntersectionObserver，并在组件卸载时自动清理
   * @param component Vue组件实例
   * @param element 要观察的DOM元素
   * @param callback 回调函数
   * @param options 观察选项
   */
  static observeIntersection(
    component: { onUnmounted?: (fn: () => void) => void },
    element: Element,
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ): IntersectionObserver {
    const observer = new IntersectionObserver(callback, options)
    observer.observe(element)

    // 在组件卸载时停止观察
    if (component.onUnmounted) {
      component.onUnmounted(() => {
        observer.disconnect()
      })
    }

    return observer
  }

  /**
   * 为Vue组件中的元素添加ResizeObserver，并在组件卸载时自动清理
   * @param component Vue组件实例
   * @param element 要观察的DOM元素
   * @param callback 回调函数
   */
  static observeResize(
    component: { onUnmounted?: (fn: () => void) => void },
    element: Element,
    callback: ResizeObserverCallback
  ): ResizeObserver {
    const observer = new ResizeObserver(callback)
    observer.observe(element)

    // 在组件卸载时停止观察
    if (component.onUnmounted) {
      component.onUnmounted(() => {
        observer.disconnect()
      })
    }

    return observer
  }

  /**
   * 为Vue组件中的元素添加MutationObserver，并在组件卸载时自动清理
   * @param component Vue组件实例
   * @param element 要观察的DOM元素
   * @param callback 回调函数
   * @param options 观察选项
   */
  static observeMutations(
    component: { onUnmounted?: (fn: () => void) => void },
    element: Element,
    callback: MutationCallback,
    options?: MutationObserverInit
  ): MutationObserver {
    const observer = new MutationObserver(callback)
    observer.observe(element, options)

    // 在组件卸载时停止观察
    if (component.onUnmounted) {
      component.onUnmounted(() => {
        observer.disconnect()
      })
    }

    return observer
  }

  /**
   * 创建Portal效果，将内容渲染到指定容器中
   * @param component Vue组件实例
   * @param content 要渲染的内容
   * @param containerSelector 容器选择器，默认为body
   * @returns 渲染的DOM元素
   */
  static createPortal(
    component: { onUnmounted?: (fn: () => void) => void },
    content: string | Element,
    containerSelector: string = 'body'
  ): Element {
    const container = DomUtils.querySelector(containerSelector)
    if (!container) {
      throw new Error(`Container not found: ${containerSelector}`)
    }

    let element: Element
    if (typeof content === 'string') {
      element = DomUtils.createElement('div', { className: 'vue-portal' })
      element.innerHTML = content
    } else {
      element = content
    }

    container.appendChild(element)

    // 在组件卸载时移除portal内容
    if (component.onUnmounted) {
      component.onUnmounted(() => {
        DomUtils.remove(element)
      })
    }

    return element
  }

  /**
   * 滚动到Vue组件中的指定元素
   * @param component Vue组件实例
   * @param selector 要滚动到的元素选择器
   * @param options 滚动选项
   */
  static scrollToElement(
    component: { $el?: Element },
    selector: string,
    options: ScrollIntoViewOptions = {}
  ): void {
    const element = this.querySelector(selector, component)
    if (element) {
      DomUtils.scrollIntoView(element, options)
    }
  }

  /**
   * 获取Vue组件中元素的计算样式
   * @param component Vue组件实例
   * @param selector 元素选择器
   * @param property CSS属性名
   * @returns 属性值
   */
  static getComputedStyle(
    component: { $el?: Element },
    selector: string,
    property: string
  ): string | null {
    const element = this.querySelector(selector, component)
    return element ? DomUtils.getComputedStyle(element, property) : null
  }

  /**
   * 为Vue组件中的元素添加CSS类
   * @param component Vue组件实例
   * @param selector 元素选择器
   * @param classNames 类名，可以是字符串或数组
   */
  static addClass(
    component: { $el?: Element },
    selector: string,
    classNames: string | string[]
  ): void {
    const elements = this.querySelectorAll(selector, component)
    elements.forEach((element) => DomUtils.addClass(element, classNames))
  }

  /**
   * 为Vue组件中的元素移除CSS类
   * @param component Vue组件实例
   * @param selector 元素选择器
   * @param classNames 类名，可以是字符串或数组
   */
  static removeClass(
    component: { $el?: Element },
    selector: string,
    classNames: string | string[]
  ): void {
    const elements = this.querySelectorAll(selector, component)
    elements.forEach((element) => DomUtils.removeClass(element, classNames))
  }

  /**
   * 切换Vue组件中元素的CSS类
   * @param component Vue组件实例
   * @param selector 元素选择器
   * @param className 类名
   */
  static toggleClass(component: { $el?: Element }, selector: string, className: string): boolean[] {
    const elements = this.querySelectorAll(selector, component)
    return elements.map((element) => DomUtils.toggleClass(element, className))
  }

  /**
   * 检查Vue组件中的元素是否包含指定CSS类
   * @param component Vue组件实例
   * @param selector 元素选择器
   * @param className 类名
   * @returns 是否包含该类
   */
  static hasClass(component: { $el?: Element }, selector: string, className: string): boolean {
    const element = this.querySelector(selector, component)
    return element ? DomUtils.hasClass(element, className) : false
  }
}

export default VueDomUtils
