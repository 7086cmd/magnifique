// Delete Steps
/*
<summary>
1. Read The `Sdbdata` List.
2. ForEach to delete the connect list
3. Delete Sdbdata File.
</summary>
*/

import { rmSync } from 'fs'
import { createSdbdataParser } from 'packages/server/src/modules/utils'
import createPath from '../../../utils/create-path'
import { removeUserInRoom } from './delete-person'

const deleteRoom = (roomId: string) => {
  const roomFilePath = createPath(roomId)
  const roomInfo = createSdbdataParser(roomFilePath) as MessageFile
  const Lists = roomInfo.config.users
  Lists.forEach(item => {
    removeUserInRoom(item, roomId)
  })
  rmSync(roomFilePath)
  return {
    status: 'ok',
  }
}

export { deleteRoom }
