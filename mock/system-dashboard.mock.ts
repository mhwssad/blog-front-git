import { defineMock } from 'vite-plugin-mock-dev-server'
import { db, ok } from './shared'

function makeRange(rangeType: string) {
  const now = new Date()
  const fmt = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ')
  let startTime: string | null = null
  let endTime: string | null = fmt(now)

  if (rangeType === 'today') {
    startTime = fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate()))
  } else if (rangeType === 'week') {
    const d = new Date(now)
    d.setDate(d.getDate() - d.getDay())
    startTime = fmt(new Date(d.getFullYear(), d.getMonth(), d.getDate()))
  } else if (rangeType === 'month') {
    startTime = fmt(new Date(now.getFullYear(), now.getMonth(), 1))
  } else if (rangeType === 'custom') {
    startTime = null
  }

  return { startTime, endTime, rangeType }
}

function scale(total: number, factor: number): number {
  return Math.max(1, Math.round(total * factor))
}

function handle(req: any) {
  const m = String(req.method).toUpperCase()
  const url = new URL(req.url || '/', 'http://mock')
  const path = url.pathname
  const params = Object.fromEntries(url.searchParams)
  const rangeType = params.rangeType || 'today'
  const range = rangeType === 'custom'
    ? {
        startTime: params.startTime || null,
        endTime: params.endTime || null,
        rangeType,
      }
    : makeRange(rangeType)

  const factor: Record<string, number> = { today: 0.15, week: 0.4, month: 0.7, all: 1 }
  let f = factor[rangeType] ?? 1
  if (rangeType === 'custom' && range.startTime && range.endTime) {
    const start = new Date(range.startTime)
    const end = new Date(range.endTime)
    const days = Math.max(1, Math.ceil(Math.abs(end.getTime() - start.getTime()) / 86400000))
    f = Math.min(1, Math.max(0.1, days / 30))
  }

  if (m === 'GET' && path === '/api/sys/dashboard/overview') {
    const articles = db.articles || []
    const comments = db.comments || []
    const reports = db.reports || []
    const totalUsers = db.users.length
    return ok({
      range,
      registeredUserCount: scale(totalUsers, f),
      activeUserCount: scale(totalUsers, f * 0.6),
      authorCount: Math.max(1, Math.round(db.users.filter((u: any) => u.roleIds?.includes(2) || u.roleIds?.includes(3)).length * f)),
      articleCount: scale(articles.length, f),
      pendingArticleReviewCount: rangeType === 'all' ? 3 : rangeType === 'month' ? 2 : rangeType === 'week' ? 1 : 1,
      commentCount: scale(comments.length, f),
      chatMessageCount: scale(15, f),
      aiCallCount: scale(20, f),
      reportCount: scale(reports.length, f),
      pendingReportCount: rangeType === 'all' ? 2 : 1,
    })
  }

  if (m === 'GET' && path === '/api/sys/dashboard/content') {
    const articles = db.articles || []
    const comments = db.comments || []
    const totalLikes = articles.reduce((s: number, a: any) => s + (a.likeCount || 0), 0)
    const totalCollects = articles.reduce((s: number, a: any) => s + (a.collectCount || 0), 0)
    return ok({
      range,
      articleCount: scale(articles.length, f),
      pendingArticleReviewCount: rangeType === 'all' ? 3 : 1,
      commentCount: scale(comments.length, f),
      likeCount: scale(totalLikes, f),
      collectCount: scale(totalCollects, f),
    })
  }

  if (m === 'GET' && path === '/api/sys/dashboard/community') {
    const chatMessages = db.chatMessages || []
    const forumPosts = (db.forumPosts || []).filter((p: any) => !p.isHidden)
    const forumReplies = db.forumReplies || []
    const sections = db.forumSections || []

    const hotSections = sections
      .map((s: any) => {
        const sectionPosts = forumPosts.filter((p: any) => p.sectionId === s.id)
        const sectionReplies = forumReplies.filter((r: any) =>
          sectionPosts.some((p: any) => p.id === r.postId),
        )
        return {
          sectionId: s.id,
          sectionName: s.sectionName,
          postCount: scale(sectionPosts.length, f),
          replyCount: scale(sectionReplies.length, f),
          hotValue: scale(sectionPosts.length + sectionReplies.length, f),
        }
      })
      .sort((a: any, b: any) => b.hotValue - a.hotValue)
      .slice(0, 5)

    return ok({
      range,
      chatMessageCount: scale(chatMessages.length, f),
      lobbyMessageCount: scale(chatMessages.length * 0.3, f),
      groupCount: Math.max(0, Math.round(3 * f)),
      forumPostCount: scale(forumPosts.length, f),
      forumReplyCount: scale(forumReplies.length, f),
      hotSections,
    })
  }

  if (m === 'GET' && path === '/api/sys/dashboard/ai') {
    const usageLogs = db.aiUsageLogs || []
    const agentTasks = db.aiAgentTasks || []
    const successLogs = usageLogs.filter((l: any) => l.successStatus === 1)
    const failedLogs = usageLogs.filter((l: any) => l.successStatus === 0)
    const ragLogs = usageLogs.filter(
      (l: any) => l.requestSceneType === 'article' || l.requestSceneType === 'rag',
    )
    const successAgent = agentTasks.filter((t: any) => t.status === 'completed')
    const failedAgent = agentTasks.filter(
      (t: any) => t.status === 'failed' || t.status === 'timeout',
    )

    return ok({
      range,
      aiCallCount: scale(usageLogs.length, f),
      aiSuccessCallCount: scale(successLogs.length, f),
      aiFailedCallCount: scale(failedLogs.length, f),
      ragCallCount: scale(ragLogs.length, f),
      agentTaskCount: scale(agentTasks.length, f),
      agentSuccessTaskCount: scale(successAgent.length, f),
      agentFailedTaskCount: scale(failedAgent.length, f),
    })
  }

  if (m === 'GET' && path === '/api/sys/dashboard/governance') {
    const reports = db.reports || []
    const pending = reports.filter((r: any) => r.status === 0)
    const processing = reports.filter((r: any) => r.status === 1)
    const handled = reports.filter((r: any) => r.status === 2)
    const rejected = reports.filter((r: any) => r.status === 3)

    const punishmentMap: Record<string, number> = {}
    reports.forEach((r: any) => {
      if (r.punishmentType) {
        punishmentMap[r.punishmentType] = (punishmentMap[r.punishmentType] || 0) + 1
      }
    })
    const punishmentDistributions = Object.entries(punishmentMap).map(
      ([punishmentType, count]) => ({ punishmentType, count: scale(count, f) }),
    )

    return ok({
      range,
      reportCount: scale(reports.length, f),
      pendingReportCount: pending.length,
      processingReportCount: scale(processing.length, f),
      handledReportCount: scale(handled.length, f),
      rejectedReportCount: scale(rejected.length, f),
      averageHandleDurationMinutes: rangeType === 'today' ? 25 : rangeType === 'week' ? 38 : 45,
      punishmentDistributions,
    })
  }

  if (m === 'GET' && path === '/api/sys/dashboard/export') {
    return ok({
      exportUrl: '/api/sys/dashboard/export',
      exportTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    })
  }

  return ok(null, '未匹配到仪表盘接口', 404)
}

export default defineMock([
  { url: '/api/sys/dashboard/overview', method: 'GET', body: handle },
  { url: '/api/sys/dashboard/content', method: 'GET', body: handle },
  { url: '/api/sys/dashboard/community', method: 'GET', body: handle },
  { url: '/api/sys/dashboard/ai', method: 'GET', body: handle },
  { url: '/api/sys/dashboard/governance', method: 'GET', body: handle },
  { url: '/api/sys/dashboard/export', method: 'GET', body: handle },
])
