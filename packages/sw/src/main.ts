import { connect } from './modules/client/connect'
import { ServiceWorkerNotification } from './modules/notification/types'

const sw = self as unknown as ServiceWorkerGlobalScope
sw.addEventListener('message', event => {
  const data = event.data as ServiceWorkerNotification.InstallParams
  connect(data.user)
})
