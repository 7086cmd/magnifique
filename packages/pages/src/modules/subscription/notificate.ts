import { ElMessage, ElNotification } from 'element-plus'
import { useWebNotification } from '@vueuse/core'
import knockingSound from '../../assets/knocking.mp3'
import { useSound } from '@vueuse/sound'
import { Router } from 'vue-router'

const createNotification = (body: string, id: string, rid: string, router: Router) => {
  // const router = useRouter()
  const { isSupported, onClick, show } = useWebNotification({
    title: body,
    renotify: true,
    lang: 'zh-cn',
    dir: 'ltr',
    tag: 'message',
  })
  ElNotification({
    title: body,
    type: 'warning',
  })
  if (!window.Notification) {
    ElMessage({
      message: '您未开启通知或者浏览器不支持通知。',
    })
    return
  }
  Notification.requestPermission().then(result => {
    if (result === 'denied') {
      ElMessage({
        message: '请开启通知',
        type: 'error',
      })
    }
  })
  const sound = useSound(knockingSound)
  sound.play()
  if (!isSupported) {
    ElMessage({
      message: '您未开启通知或者浏览器不支持通知。',
    })
    return
  }
  show()
  onClick.on(() => {
    const uri = window.location.href
    const url = new URL(uri)
    url.pathname = `/${id.split('/')[0]}/message/${rid}`
    const bse = new URL(uri)
    bse.pathname = '/login/' + id
    const pms = new URLSearchParams()
    pms.set('redirection', url.pathname)
    bse.search = pms.toString()
    if (id.startsWith('class')) router.push(url.pathname)
    if (id.startsWith('member')) router.push(bse.pathname + '?' + bse.search)
  })
}
export { createNotification }
