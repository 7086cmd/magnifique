import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
import createEmojiPlugin from '@kangc/v-md-editor/lib/plugins/emoji/index'
import createKatexPlugin from '@kangc/v-md-editor/lib/plugins/katex/cdn'
import createTodoListPlugin from '@kangc/v-md-editor/lib/plugins/todo-list/index'
import createCopyCodePlugin from '@kangc/v-md-editor/lib/plugins/copy-code/index'
import createMermaidPlugin from '@kangc/v-md-editor/lib/plugins/mermaid/cdn'
import createAlignPlugin from '@kangc/v-md-editor/lib/plugins/align'
import createLineNumbertPlugin from '@kangc/v-md-editor/lib/plugins/line-number/index'

import Prism from 'prismjs'
import type Module from 'module'
import { extend } from './create-markdown-it'
import { Plugin } from 'vue'

export const installPlugin = (app: { use: (module: Module, options?: object) => void } & Plugin) => {
  app.use(vuepressTheme, {
    Prism,
    extend,
  })
  app.use(createEmojiPlugin)
  app.use(createKatexPlugin)
  app.use(createTodoListPlugin)
  app.use(createCopyCodePlugin)
  app.use(createMermaidPlugin)
  app.use(createAlignPlugin)
  app.use(createLineNumbertPlugin)
  return app
}
