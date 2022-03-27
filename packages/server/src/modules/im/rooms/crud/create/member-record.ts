import { has } from 'lodash'
import { getSingleMemberAsRaw } from 'packages/server/src/modules/powers/member'
import { createMemberIndex, createSdbdataSaver } from 'packages/server/src/modules/utils'

const createMemberRecorder = (number: number, id: string) => {
  let inf = getSingleMemberAsRaw(number).details as member
  if (!has(inf, 'messageRooms')) {
    inf.messageRooms = [] as string[]
  }
  inf.messageRooms.push(id)
  createSdbdataSaver(createMemberIndex(number), inf)
}
export { createMemberRecorder }
