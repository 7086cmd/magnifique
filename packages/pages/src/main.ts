import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import * as ElIconModules from '@element-plus/icons-vue'
import elementPlusLang from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import './index.css'
import 'nprogress/nprogress.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { ElMessageBox } from 'element-plus'
import TagPurple from './components/tags/tag.purple.vue'
import MonacoEditor from './modules/editor/index.vue'
import ImageReader from './modules/image/upload.vue'
import MessageItem from './components/messages/components.vue'
import VueMarkdownEditor from '@kangc/v-md-editor'
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import { installPlugin } from './plugins/markdown'

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
app.use(installPlugin(VueMarkdownEditor))
app.use(installPlugin(VMdPreview))
app.mount('#app')

if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  ElMessageBox.alert('检测到该为深色模式，目前未适配。', '深色模式提醒', {
    center: true,
    type: 'warning',
  })
}
