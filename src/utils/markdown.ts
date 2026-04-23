const MARKDOWN_META_PREFIX = '<!--ARTICLE_MARKDOWN:'
const MARKDOWN_META_SUFFIX = '-->'

function normalizeLineBreaks(value: string): string {
  return value.replace(/\r\n?/g, '\n')
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeHtmlAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, '&#96;')
}

function encodeBase64Unicode(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''

  bytes.forEach(byte => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary)
}

function decodeBase64Unicode(value: string): string | null {
  try {
    const binary = atob(value)
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}

export function stripMarkdownMeta(content: string): string {
  return content.replace(/^<!--ARTICLE_MARKDOWN:[A-Za-z0-9+/=]+-->\s*/u, '')
}

function createCodeToken(index: number): string {
  return `@@MD_CODE_${index}@@`
}

function parseInlineMarkdown(value: string): string {
  const tokens: string[] = []
  let rendered = escapeHtml(value)

  rendered = rendered.replace(/`([^`\n]+)`/g, (_, code: string) => {
    const token = createCodeToken(tokens.length)
    tokens.push(`<code>${escapeHtml(code)}</code>`)
    return token
  })

  rendered = rendered.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_, alt: string, src: string, title?: string) => {
      const titleAttr = title ? ` title="${escapeHtmlAttribute(title)}"` : ''
      return `<img src="${escapeHtmlAttribute(src)}" alt="${escapeHtmlAttribute(alt)}"${titleAttr} />`
    }
  )

  rendered = rendered.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text: string, href: string) => {
    return `<a href="${escapeHtmlAttribute(href)}" target="_blank" rel="noopener noreferrer">${text}</a>`
  })

  rendered = rendered.replace(/~~(.+?)~~/g, '<del>$1</del>')
  rendered = rendered.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  rendered = rendered.replace(/__(.+?)__/g, '<strong>$1</strong>')
  rendered = rendered.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
  rendered = rendered.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, '$1<em>$2</em>')

  tokens.forEach((token, index) => {
    rendered = rendered.replace(createCodeToken(index), token)
  })

  return rendered
}

function isHorizontalRule(line: string): boolean {
  return /^(\*\s*){3,}$/.test(line) || /^(-\s*){3,}$/.test(line) || /^(_\s*){3,}$/.test(line)
}

function isListLine(line: string): boolean {
  return /^(\s*)([-*+]|\d+\.)\s+/.test(line)
}

function isBlockStart(line: string): boolean {
  const trimmed = line.trim()
  return (
    trimmed === '' ||
    /^#{1,6}\s+/.test(trimmed) ||
    trimmed.startsWith('>') ||
    trimmed.startsWith('```') ||
    isHorizontalRule(trimmed) ||
    isListLine(line)
  )
}

function renderList(lines: string[], startIndex: number): { html: string; nextIndex: number } {
  const firstMatch = lines[startIndex]?.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/)
  if (!firstMatch) {
    return { html: '', nextIndex: startIndex + 1 }
  }

  const ordered = /\d+\./.test(firstMatch[2] ?? '')
  const items: string[] = []
  let index = startIndex

  while (index < lines.length) {
    const match = lines[index]?.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/)
    if (!match || /\d+\./.test(match[2] ?? '') !== ordered) {
      break
    }

    let content = (match[3] ?? '').trim()
    index += 1

    while (index < lines.length) {
      const continuation = lines[index] ?? ''
      if (continuation.trim() === '') {
        index += 1
        break
      }
      if (isBlockStart(continuation)) {
        break
      }
      content += ` ${continuation.trim()}`
      index += 1
    }

    items.push(`<li>${parseInlineMarkdown(content)}</li>`)
  }

  const tag = ordered ? 'ol' : 'ul'
  return {
    html: `<${tag}>${items.join('')}</${tag}>`,
    nextIndex: index,
  }
}

export function markdownToHtml(markdown: string): string {
  const source = normalizeLineBreaks(markdown).trim()
  if (!source) {
    return ''
  }

  const lines = source.split('\n')
  const blocks: string[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index] ?? ''
    const trimmed = line.trim()

    if (!trimmed) {
      index += 1
      continue
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      const level = (headingMatch[1] ?? '').length
      blocks.push(`<h${level}>${parseInlineMarkdown((headingMatch[2] ?? '').trim())}</h${level}>`)
      index += 1
      continue
    }

    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3).trim()
      const codeLines: string[] = []
      index += 1

      while (index < lines.length && !(lines[index] ?? '').trim().startsWith('```')) {
        codeLines.push(lines[index] ?? '')
        index += 1
      }

      if (index < lines.length) {
        index += 1
      }

      const languageClass = language ? ` class="language-${escapeHtmlAttribute(language)}"` : ''
      blocks.push(`<pre><code${languageClass}>${escapeHtml(codeLines.join('\n'))}</code></pre>`)
      continue
    }

    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = []

      while (index < lines.length && (lines[index] ?? '').trim().startsWith('>')) {
        quoteLines.push((lines[index] ?? '').replace(/^\s*>\s?/, ''))
        index += 1
      }

      blocks.push(`<blockquote>${markdownToHtml(quoteLines.join('\n'))}</blockquote>`)
      continue
    }

    if (isHorizontalRule(trimmed)) {
      blocks.push('<hr />')
      index += 1
      continue
    }

    if (isListLine(line)) {
      const list = renderList(lines, index)
      blocks.push(list.html)
      index = list.nextIndex
      continue
    }

    const paragraphLines: string[] = [trimmed]
    index += 1

    while (index < lines.length) {
      const nextLine = lines[index] ?? ''
      if (!nextLine.trim() || isBlockStart(nextLine)) {
        break
      }
      paragraphLines.push(nextLine.trim())
      index += 1
    }

    blocks.push(`<p>${parseInlineMarkdown(paragraphLines.join(' '))}</p>`)
  }

  return blocks.join('\n')
}

function normalizeTextNode(value: string): string {
  return value.replace(/\s+/g, ' ')
}

function nodesToMarkdown(nodes: Node[]): string {
  return nodes.map(node => nodeToMarkdown(node)).join('')
}

function listToMarkdown(element: HTMLElement, ordered: boolean): string {
  const items = Array.from(element.children)
    .filter(child => child instanceof HTMLElement && child.tagName.toLowerCase() === 'li')
    .map((child, index) => {
      const prefix = ordered ? `${index + 1}. ` : '- '
      const content = nodesToMarkdown(Array.from(child.childNodes)).trim()
      const normalized = content.replace(/\n/g, '\n  ')
      return `${prefix}${normalized}`
    })

  return items.join('\n') + '\n\n'
}

function nodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return normalizeTextNode(node.textContent ?? '')
  }

  if (!(node instanceof HTMLElement)) {
    return ''
  }

  const tagName = node.tagName.toLowerCase()

  if (/^h[1-6]$/.test(tagName)) {
    const level = Number(tagName.slice(1))
    return `${'#'.repeat(level)} ${nodesToMarkdown(Array.from(node.childNodes)).trim()}\n\n`
  }

  switch (tagName) {
    case 'p':
      return `${nodesToMarkdown(Array.from(node.childNodes)).trim()}\n\n`
    case 'br':
      return '  \n'
    case 'strong':
    case 'b':
      return `**${nodesToMarkdown(Array.from(node.childNodes))}**`
    case 'em':
    case 'i':
      return `*${nodesToMarkdown(Array.from(node.childNodes))}*`
    case 'del':
    case 's':
      return `~~${nodesToMarkdown(Array.from(node.childNodes))}~~`
    case 'code':
      if (node.parentElement?.tagName.toLowerCase() === 'pre') {
        return node.textContent ?? ''
      }
      return `\`${node.textContent ?? ''}\``
    case 'pre': {
      const codeElement = node.querySelector('code')
      const languageClass = codeElement?.className.match(/language-([\w-]+)/)?.[1] ?? ''
      const language = languageClass ? languageClass : ''
      const code = codeElement?.textContent ?? node.textContent ?? ''
      return `\`\`\`${language}\n${code.replace(/\n+$/g, '')}\n\`\`\`\n\n`
    }
    case 'blockquote': {
      const content = nodesToMarkdown(Array.from(node.childNodes)).trim()
      return `${content
        .split('\n')
        .map(line => (line ? `> ${line}` : '>'))
        .join('\n')}\n\n`
    }
    case 'ul':
      return listToMarkdown(node, false)
    case 'ol':
      return listToMarkdown(node, true)
    case 'a': {
      const href = node.getAttribute('href') ?? ''
      const text = nodesToMarkdown(Array.from(node.childNodes)).trim() || href
      return `[${text}](${href})`
    }
    case 'img': {
      const src = node.getAttribute('src') ?? ''
      const alt = node.getAttribute('alt') ?? ''
      return `![${alt}](${src})`
    }
    case 'hr':
      return '---\n\n'
    case 'div':
    case 'section':
    case 'article':
    case 'main':
      return `${nodesToMarkdown(Array.from(node.childNodes))}\n`
    default:
      return nodesToMarkdown(Array.from(node.childNodes))
  }
}

function cleanupMarkdown(value: string): string {
  return value
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function htmlToMarkdown(content: string): string {
  const html = stripMarkdownMeta(content).trim()
  if (!html) {
    return ''
  }

  if (typeof DOMParser === 'undefined') {
    return cleanupMarkdown(html.replace(/<[^>]+>/g, ' '))
  }

  const document = new DOMParser().parseFromString(html, 'text/html')
  return cleanupMarkdown(nodesToMarkdown(Array.from(document.body.childNodes)))
}

export function extractMarkdownSource(content: string | null | undefined): string {
  const source = String(content ?? '')
  const match = source.match(/^<!--ARTICLE_MARKDOWN:([A-Za-z0-9+/=]+)-->/u)
  if (match?.[1]) {
    const decoded = decodeBase64Unicode(match[1])
    if (decoded !== null) {
      return normalizeLineBreaks(decoded)
    }
  }

  return htmlToMarkdown(source)
}

export function composeMarkdownHtmlContent(markdown: string): string {
  const source = normalizeLineBreaks(markdown).trim()
  if (!source) {
    return ''
  }

  const html = markdownToHtml(source)
  const encoded = encodeBase64Unicode(source)
  return `${MARKDOWN_META_PREFIX}${encoded}${MARKDOWN_META_SUFFIX}\n${html}`
}
