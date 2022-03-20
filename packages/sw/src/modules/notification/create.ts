/// env serviceworker
/// <environment type="serviceworker" />

import routeIndex from '../utils/route-index'
import { ServiceWorkerNotification } from './types'

/* eslint-env serviceworker */
const sw: ServiceWorkerGlobalScope = self as never

const newNotification = (content: ServiceWorkerNotification.ShowParams) => {
  sw.registration.showNotification(content.content, {
    actions: [
      {
        action: 'show',
        title: '快速查看',
      },
    ],
  })
  sw.addEventListener('notificationclick', event => {
    // sw.clients.openWindow(content.type)
    const indexRouter = routeIndex(content.user) as fetcherOptions

    if (event.action === 'show') {
      if (content.type === 'message') {
        if (indexRouter.type === 'admin') {
          sw.clients.openWindow('/admin/message/')
        } else if (indexRouter.type === 'class') {
          sw.clients.openWindow('/class/message/')
        } else if (indexRouter.type === 'member') {
          sw.clients.openWindow('/member/message/')
        }
      } else if (content.type === 'deduction') {
        sw.clients.openWindow('/class/list/')
      }
    }
  })
}

export { newNotification }
