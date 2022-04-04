import { renderMarkdownInline, fetchContent, readMarkdown } from 'packages/pages/src/components/messages/modules/ril'

const str = renderMarkdownInline(":sparkles:你好呀**星光闪烁** :grinning: :pisces: $f(x)=ax^2+bx+c$\n```javascript\nconsole.log('ok')\n```")

console.log(str)

const ctn = fetchContent(":sparkles:你好呀**星光闪烁** :grinning: :pisces: $f(x)=ax^2+bx+c$\n```javascript\nconsole.log('ok')\n```")

console.log(ctn)

// readMarkdown(":sparkles:你好呀**星光闪烁** :grinning: :pisces: $f(x)=ax^2+bx+c$\n```javascript\nconsole.log('ok')\n```")
