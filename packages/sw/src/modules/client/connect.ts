import createIndex from 'packages/pages/src/components/messages/utils/create-index'
import { io } from 'socket.io-client'
import { newNotification } from '../notification/create'
import { ServiceWorkerNotification } from '../notification/types'

const sw = self as unknown as ServiceWorkerGlobalScope

type options = fetchAsClass | fetchAsAdmin | fetchAsSingleMember

const connect = (content: options) => {
  const url = new URL(sw.location.href)
  if (content.type === 'class') {
    const params = new URLSearchParams()
    params.set('gradeid', String(content.gradeid))
    params.set('classid', String(content.classid))
    params.set('from', 'class')

    url.protocol = 'ws:'
    url.pathname = ''
    url.search = params.toString()
  }
  const socket = io(url.toString())
  socket.on('deduction', (data: ServiceWorkerNotification.IOContent) => {
    if (data.sendTo.includes(createIndex(content) as string)) {
      data.sendTo.forEach(item => {
        newNotification({
          user: item,
          content: data.content,
          id: data.id,
          type: 'deduction',
          action: data.action,
        })
      })
    }
  })
}

export { connect }
