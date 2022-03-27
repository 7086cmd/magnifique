import routeIndex from '../../../utils/route-index'
import { createAdminRecorder } from './admin-record'
import { createClassRecorder } from './class-record'
import { createMemberRecorder } from './member-record'

const createMessageRoomAccountRecorder = (account: string, id: string) => {
  const indexer = routeIndex(account)
  if (indexer?.type === 'admin') {
    createAdminRecorder(id)
  } else if (indexer?.type === 'class') {
    createClassRecorder(indexer.gradeid, indexer.classid, id)
  } else if (indexer?.type === 'member') {
    createMemberRecorder(indexer.number, id)
  }
}

export { createMessageRoomAccountRecorder }
