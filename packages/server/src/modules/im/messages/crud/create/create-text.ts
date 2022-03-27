import dayjs from 'dayjs'
import { createSdbdataSaver } from 'packages/server/src/modules/utils'
import { v4 } from 'uuid'
import { createSingleRoomItemGetter } from '../../../rooms/crud'
import createPath from '../../../utils/create-path'

const createTextMessageCreation = (roomId: string, content: message) => {
  const messageFileContent = createSingleRoomItemGetter(roomId)
  if (!messageFileContent.config.users.includes(content.creator)) {
    return {
      status: 'error',
      reason: 'no-auth',
    }
  }
  let id = v4()
  while (id in messageFileContent.details) {
    id = v4()
  }
  content.type = 'text'
  content.createDate = dayjs().toJSON()
  messageFileContent.details[id] = content
  createSdbdataSaver(createPath(roomId), messageFileContent)
  return {
    status: 'ok',
  }
}

export { createTextMessageCreation }
