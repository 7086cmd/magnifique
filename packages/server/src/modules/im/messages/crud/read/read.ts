import { createObjectToArrayTransformer } from 'packages/server/src/modules/utils'
import { createSingleRoomItemGetter } from '../../../rooms/crud'

export const createMessageReader = (roomId: string, requester: string) => {
  const messages = createSingleRoomItemGetter(roomId)
  if (!messages.config.users.includes(requester)) {
    return {
      status: 'error',
      reason: 'no-auth',
    }
  }
  return {
    status: 'ok',
    details: createObjectToArrayTransformer('id', messages.details) as MessageItem[],
  }
}
