import type { ArticleSaveRequest, CategoryAdminVO } from '@/api/types'
import { stripMarkdownMeta } from '@/utils/markdown'

export interface CategoryOption {
  id: number
  label: string
}

export type EditorTab = 'preview' | 'html'

// 创建全新的表单默认值，避免多个编辑实例之间共享引用状态。
export function createArticleFormData(): ArticleSaveRequest {
  return {
    title: '',
    summary: '',
    content: '',
    coverImage: '',
    isTop: 0,
    isOriginal: 1,
    sourceUrl: '',
    status: 0,
    publishTime: '',
    accessLevel: 0,
    remark: '',
    categoryIds: [],
    tagIds: [],
    accessList: [],
  }
}

// 把树形分类拍平成级联标签，方便在多选框中直接展示层级关系。
export function buildCategoryOptions(categories: CategoryAdminVO[]): CategoryOption[] {
  const options: CategoryOption[] = []

  function walk(nodes: CategoryAdminVO[], prefix = ''): void {
    nodes.forEach(node => {
      const label = prefix ? `${prefix} / ${node.name}` : node.name
      options.push({ id: node.id, label })

      if (node.children?.length) {
        walk(node.children, label)
      }
    })
  }

  walk(categories)
  return options
}

// 编辑器和预览区都只关心正文本身，这里先清掉 Markdown frontmatter 和空段落噪音。
export function normalizeArticleHtml(value: string): string {
  return stripMarkdownMeta(value)
    .replace(/<p><br><\/p>/g, '')
    .replace(/<p>\s*<\/p>/g, '')
    .trim()
}

// 做轻量格式化，主要为了让源码编辑区更容易人工校对，不承担完整 prettify 职责。
export function formatArticleHtml(value: string): string {
  const source = normalizeArticleHtml(value)
  if (!source) {
    return ''
  }

  return source
    .replace(/></g, '>\n<')
    .replace(
      /(<(?:h\d|p|ul|ol|li|blockquote|pre|table|tr|td|th|div|hr|img|figure|section)[^>]*>)/g,
      '\n$1'
    )
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
