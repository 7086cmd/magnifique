import { createSdbdataSaver } from 'packages/server/src/modules/utils'
import { createSingleRoomItemGetter } from '../../../rooms/crud'
import createPath from '../../../utils/create-path'

const createTextMessageUpdate = (roomId: string, messageId: string, currentContent: string, editor: string) => {
  const messageFileContent = createSingleRoomItemGetter(roomId)
  if (messageFileContent.details[messageId].creator !== editor) {
    return {
      status: 'error',
      reason: 'no-auth',
    }
  }
  messageFileContent.details[messageId].content = currentContent
  createSdbdataSaver(createPath(roomId), messageFileContent)
  return {
    status: 'ok',
  }
}

export { createTextMessageUpdate }
