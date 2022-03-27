import { createSdbdataSaver } from 'packages/server/src/modules/utils'
import { createSingleRoomItemGetter } from '../../../rooms/crud'
import createPath from '../../../utils/create-path'

const createMessageDeletion = (roomId: string, messageId: string, actioner: string) => {
  const roomFileContent = createSingleRoomItemGetter(roomId)
  if (roomFileContent.details[messageId].creator !== actioner) {
    return {
      status: 'error',
      reason: 'no-auth',
    }
  }
  delete roomFileContent.details[messageId]
  createSdbdataSaver(createPath(roomId), roomFileContent)
  return {
    status: 'ok',
  }
}

export { createMessageDeletion }
