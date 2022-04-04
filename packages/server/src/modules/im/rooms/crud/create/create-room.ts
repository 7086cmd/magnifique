import dayjs from 'dayjs'
import { difference } from 'lodash'
import { v1 } from 'uuid'
import { createSdbdataSaver } from '../../../../utils'
import createPath from '../../../utils/create-path'
import { getAllRoomsDetail } from '../read/vail-all-rooms'
import { createMessageRoomAccountRecorder } from './create-record'

const createRoom = (config: { title: string; description: string; users: Array<string>; password?: string }) => {
  let id = v1()
  const roomConfig = {
    ...config,
    id,
    createDate: dayjs().toJSON(),
  } as messageConfig
  if ('password' in config) {
    delete config.password
  }
  const dts = getAllRoomsDetail()
  const vai = dts.filter(item => difference(item.users, config.users).length === 0 && difference(config.users, item.users).length === 0) // 去重
  if (vai.length !== 0) {
    return {
      status: 'ok',
      details: vai[0].id,
    }
  }
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
