import type MarkdownIt from 'markdown-it'
import SubPlugin from 'markdown-it-sub'
import SupPlugin from 'markdown-it-sup'
export function extend(md: MarkdownIt) {
  md.set({
    html: true,
    breaks: true,
  })
  md.use(SubPlugin)
  md.use(SupPlugin)
}
