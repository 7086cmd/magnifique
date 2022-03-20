import { createRoomLocation } from '../../utils/rooms-loc'
import { createSdbdataParser, createSdbdataSaver } from 'packages/server/src/modules/utils'
import type { PathLike } from 'fs'

const removeUserInRoom = (user: string, id: string) => {
  const userFile = createRoomLocation(user)
  const userFileContent = createSdbdataParser(userFile as PathLike) as
    | {
        messageRooms: Array<string>
      }
    | member
  userFileContent.messageRooms.filter(x => x !== id)
  createSdbdataSaver(userFile as PathLike, userFileContent)
}

export { removeUserInRoom }
