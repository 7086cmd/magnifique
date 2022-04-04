import { difference } from 'lodash'
import { createSdbdataSaver } from 'packages/server/src/modules/utils'
import { addUserInRoom } from '.'
import { createSingleRoomItemGetter } from '..'
import createPath from '../../../utils/create-path'
import { removeUserInRoom } from '../delete/delete-person'
import { editRoomDesc } from './desc'
import { editRoomTitle } from './title'

export default (id: string, current: messageConfig) => {
  const lts = createSingleRoomItemGetter(id)
  if (lts.config.title !== current.title) editRoomTitle(current.title, id)
  if (lts.config.description !== current.description) editRoomDesc(current.description, id)
  const addedUsers = difference(current.users, lts.config.users)
  const removedUsers = difference(lts.config.users, current.users)
  addedUsers.forEach(item => addUserInRoom(item, id))
  removedUsers.forEach(item => removeUserInRoom(item, id))
  lts.config.users = current.users
  createSdbdataSaver(createPath(id), lts)
  return {
    status: 'ok',
  }
}
