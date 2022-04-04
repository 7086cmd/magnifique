import { createSdbdataSaver } from 'packages/server/src/modules/utils'
import { createSingleRoomItemGetter } from '..'
import createPath from '../../../utils/create-path'

// createSingleRoomItemGetter

const editRoomTitle = (current: string, id: string) => {
  const room = createSingleRoomItemGetter(id)
  room.config.title = current
  createSdbdataSaver(createPath(id), room)
  return {
    status: 'ok',
  }
}

export { editRoomTitle }
