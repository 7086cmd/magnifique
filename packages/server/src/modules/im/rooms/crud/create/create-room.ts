import dayjs from 'dayjs'
import { v1 } from 'uuid'
import { createSdbdataSaver } from '../../../../utils'
import createPath from '../../../utils/create-path'
import { createMessageRoomAccountRecorder } from './create-record'

const createRoom = (config: { title: string; description: string; users: Array<string> }) => {
  let id = v1()
  const roomConfig = {
    ...config,
    id,
    createDate: dayjs().toJSON(),
  } as messageConfig
  const itemPath = createPath(id)
  createSdbdataSaver(itemPath, {
    config: roomConfig,
    details: {},
  } as MessageFile)
  config.users.forEach(value => {
    createMessageRoomAccountRecorder(value, id)
  })
  return {
    status: 'ok',
    details: id,
  }
}

export { createRoom }
