import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import * as ElIconModules from '@element-plus/icons-vue'
import elementPlusLang from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import './index.css'
import 'katex/dist/katex.css'
import 'katex/dist/katex.mjs'
import 'nprogress/nprogress.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { ElMessageBox } from 'element-plus'
import TagPurple from './components/tags/tag.purple.vue'
import MonacoEditor from './modules/editor/index.vue'
import ImageReader from './modules/image/upload.vue'
import MessageItem from './components/messages/message-item.vue'
import Prism from 'prismjs'
import VueMarkdownEditor from '@kangc/v-md-editor'
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
import createEmojiPlugin from '@kangc/v-md-editor/lib/plugins/emoji/index'
import createKatexPlugin from '@kangc/v-md-editor/lib/plugins/katex/cdn'
import createTodoListPlugin from '@kangc/v-md-editor/lib/plugins/todo-list/index'
import createCopyCodePlugin from '@kangc/v-md-editor/lib/plugins/copy-code/index'
import createMermaidPlugin from '@kangc/v-md-editor/lib/plugins/mermaid/cdn'
import createAlignPlugin from '@kangc/v-md-editor/lib/plugins/align'
import createLineNumbertPlugin from '@kangc/v-md-editor/lib/plugins/line-number/index'
import type MarkdownIt from 'markdown-it'
import SubPlugin from 'markdown-it-sub'
import SupPlugin from 'markdown-it-sup'
import AbbrPlugin from 'markdown-it-abbr'
import MarkPlugin from 'markdown-it-mark'
import InsPlugin from 'markdown-it-ins'
import FootnotePlugin from 'markdown-it-footnote'
import ApexCharts from 'vue3-apexcharts'
import Menus from 'vue3-menus'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import '@kangc/v-md-editor/lib/theme/style/vuepress.css'
import '@kangc/v-md-editor/lib/plugins/mermaid/mermaid.css'
import '@kangc/v-md-editor/lib/plugins/copy-code/copy-code.css'
import '@kangc/v-md-editor/lib/plugins/todo-list/todo-list.css'
import '@kangc/v-md-editor/lib/plugins/emoji/emoji.css'
import '@kangc/v-md-editor/lib/style/preview.css'
import './tauri'

const app = createApp(App)

app.use(ElementPlus, {
  locale: elementPlusLang,
  size: 'default',
})
// app.use(Vant)
for (const iconName in ElIconModules) {
  if (Reflect.has(ElIconModules, iconName)) {
    const item = ElIconModules[iconName]
    app.component(iconName, item)
  }
}
app.component('MonacoEditor', MonacoEditor)
app.component('TagPurple', TagPurple)
app.component('ImageReader', ImageReader)
app.component('MessageItem', MessageItem)
app.use(router)
// app.use(store)
app.use(i18n)
VueMarkdownEditor.use(vuepressTheme, {
  Prism,
  extend(md: MarkdownIt) {
    md.set({
      html: true,
      breaks: true,
    })
    md.use(SubPlugin)
    md.use(SupPlugin)
    md.use(FootnotePlugin)
    md.use(InsPlugin)
    md.use(MarkPlugin)
    md.use(AbbrPlugin)
  },
})
VueMarkdownEditor.use(createEmojiPlugin())
VueMarkdownEditor.use(createKatexPlugin())
VueMarkdownEditor.use(createTodoListPlugin())
VueMarkdownEditor.use(createCopyCodePlugin())
VueMarkdownEditor.use(createMermaidPlugin())
VueMarkdownEditor.use(createAlignPlugin())
VueMarkdownEditor.use(createLineNumbertPlugin())
app.use(VueMarkdownEditor)
app.use(ApexCharts)
app.use(Menus)
app.mount('#app')

if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  ElMessageBox.alert('检测到该为深色模式，目前未适配。', '深色模式提醒', {
    center: true,
    type: 'warning',
  })
}

window.addEventListener('beforeunload', () => {
  window.open(window.location.href)
})
