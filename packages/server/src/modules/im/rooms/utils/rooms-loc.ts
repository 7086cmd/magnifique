import { tmpdir } from 'os'
import { resolve } from 'path'
import { createMemberIndex, createYearTransformer } from '../../../utils'
import routeIndex from '../../utils/route-index'

const createRoomLocation = (user: string) => {
  const index = routeIndex(user)
  if (index?.type === 'admin') {
    return resolve(tmpdir(), '..', 'magnifique', 'admin', 'secret', 'messages.sdbdata')
  } else if (index?.type === 'member') {
    return createMemberIndex(index.number)
  } else if (index?.type === 'class') {
    return resolve(tmpdir(), '..', 'magnifique', String(createYearTransformer(index.gradeid)), String(index.classid), 'messages.sdbdata')
  }
}

export { createRoomLocation }
