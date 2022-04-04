import { ElNotification } from 'element-plus'
import { io } from 'socket.io-client'
import { Router } from 'vue-router'
import baseurl from '../baseurl'
import { createYearTransformer } from '../utils'
import { createNotification } from './notificate'

interface SubscribeOptions {
  username: string
  password: string
  contents: Array<'message' | 'deduction'>
}

interface SubscribeContent {
  type: 'message' | 'deduction'
  method: 'patch' | 'delete' | 'post'
  id: string
  title: string
  actioner: string
  receiver: string
  actioner_name: string
  receiver_name: string
}

const createMessageContent = (opt: SubscribeContent) => {
  const methodsExpressions = {
    patch: `${opt.receiver_name}：${opt.actioner_name}在${opt.title}修改了一条信息，请查收`,
    delete: `${opt.receiver_name}：${opt.actioner_name}在${opt.title}删除了一条信息，请查收`,
    post: `${opt.receiver_name}：收到${opt.actioner_name}在${opt.title}的一条信息，请查收`,
  }
  return methodsExpressions[opt.method]
}

const createSocketIO = (options: SubscribeOptions, router: Router) => {
  const params = new URLSearchParams()
  params.set('username', options.username)
  params.set('password', options.password)
  let url = ''
  if (import.meta.env.PROD) {
    url = window.location.href
  } else {
    url = baseurl
  }
  const URI = new URL(url)
  URI.protocol = 'ws:'
  URI.pathname = '/'
  URI.search = params.toString()
  const socket = io(URI.toString())
  socket.on('connect', () =>
    ElNotification({
      type: 'success',
      title: '已经连接到服务器',
    })
  )
  socket.on('message', (data: SubscribeContent) => {
    if (!data.receiver.includes('/')) return // admin, ignore.
    if (data.receiver.startsWith('class')) {
      if (data.receiver === options.username) {
        createNotification(createMessageContent(data), options.username, data.id, router)
      }
    } else {
      // member.
      const memberNum = Number(data.receiver.split('/')[1])
      const cid = createYearTransformer(Number(options.username.split('/')[1])) * 100 + Number(options.username.split('/')[2])
      if (Math.floor(memberNum / 100) === cid) {
        createNotification(createMessageContent(data), data.receiver, data.id, router)
      }
    }
  })
  return socket
}

export { createSocketIO }
