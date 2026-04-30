import type { ArticleSaveRequest, CategoryAdminVO } from '@/types/api-types'
import { stripMarkdownMeta } from '@/utils/markdown'

export function createEmptyForm(): ArticleSaveRequest {
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

export function buildCategoryOptions(
  categories: CategoryAdminVO[]
): { id: number; label: string }[] {
  const options: { id: number; label: string }[] = []

  function walk(nodes: CategoryAdminVO[], prefix = ''): void {
    for (const node of nodes) {
      const label = prefix ? `${prefix} / ${node.name}` : node.name
      options.push({ id: node.id, label })
      if (node.children?.length) {
        walk(node.children, label)
      }
    }
  }

  walk(categories)
  return options
}

export function normalizeHtml(value: string): string {
  return stripMarkdownMeta(value)
    .replace(/<p><br><\/p>/g, '')
    .replace(/<p>\s*<\/p>/g, '')
    .trim()
}

export function formatHtml(value: string): string {
  const source = normalizeHtml(value)
  if (!source) return ''

  return source
    .replace(/></g, '>\n<')
    .replace(
      /(<(?:h\d|p|ul|ol|li|blockquote|pre|table|tr|td|th|div|hr|img|figure|section)[^>]*>)/g,
      '\n$1'
    )
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
