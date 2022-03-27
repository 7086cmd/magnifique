import createPath from '../../../utils/create-path'
import { createSdbdataParser } from 'packages/server/src/modules/utils'

const createSingleRoomItemGetter = (roomId: string) => {
  return createSdbdataParser(createPath(roomId)) as MessageFile
}

export { createSingleRoomItemGetter }
