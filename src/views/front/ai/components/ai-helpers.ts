export const SCENE_OPTIONS = [
  { label: '通用问答', value: 'general' },
  { label: '文章生成', value: 'article' },
  { label: '社区问答', value: 'forum' },
  { label: '知识检索', value: 'knowledge' },
  { label: '代码辅助', value: 'code' },
] as const

export const PROMPT_MAP: Record<string, string[]> = {
  general: ['帮我梳理一下这个问题', '给我一个可执行方案', '把结论列成要点'],
  article: ['生成一篇结构清晰的文章', '给我一个文章大纲', '优化这段内容表达'],
  forum: ['根据社区内容给出建议', '总结用户关注的问题', '生成回复草稿'],
  knowledge: ['从知识库里检索相关内容', '列出可引用的来源', '总结关联结论'],
  code: ['检查这段代码的问题', '给出重构建议', '写一个可复用实现'],
}

export function formatAITime(value?: string | null): string {
  if (!value) return ''
  const date = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 16)
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  if (date.toDateString() === now.toDateString()) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`
  }
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
