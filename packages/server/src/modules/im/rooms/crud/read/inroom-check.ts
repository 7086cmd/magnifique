import { createRoomReader } from '.'

export function inRoomCheck(user: string, roomId: string) {
  return createRoomReader(user)
    .map(x => x.id)
    .includes(roomId)
}
