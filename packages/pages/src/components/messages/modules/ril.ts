// Render Markdown Inline
import { useSpeechSynthesis } from '@vueuse/core'
import MarkdownIt from 'markdown-it'
import MarkdownItAbbr from 'markdown-it-abbr'
import MarkdownItEmoji from 'markdown-it-emoji'
import MarkdownItIns from 'markdown-it-ins'
import MarkdownItMark from 'markdown-it-mark'
import MarkdownItMathTex from 'markdown-it-mathtex'
import MarkdownItSub from 'markdown-it-sub'
import MarkdownItSup from 'markdown-it-sup'
import twemoji from 'twemoji'

export const renderMarkdownInline = (val: string, render?: (param: MarkdownIt) => MarkdownIt) => {
  let md = new MarkdownIt()
  md.set({
    html: true,
    // breaks: true,
  })
  md.renderer.rules.emoji = (token, idx) => twemoji.parse(token[idx].content)
  if (render) md = render(md)
  md.use(MarkdownItAbbr).use(MarkdownItEmoji).use(MarkdownItIns).use(MarkdownItMark).use(MarkdownItMathTex).use(MarkdownItSub).use(MarkdownItSup)
  // console.log(md.renderInline(val))
  return md.renderInline(val)
  // return md.render(val)
}

export const fetchContent = (val: string) => {
  return renderMarkdownInline(val).replace(/<[^>]+>/g, '')
}

export const readMarkdown = (val: string) => {
  const ctx = fetchContent(val)
  useSpeechSynthesis(ctx, {
    lang: 'zh-CN',
  }).speak()
}
