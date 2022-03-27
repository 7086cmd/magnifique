import { createYearTransformer } from 'packages/pages/src/modules/utils'
import { getSingleMemberAsRaw } from 'packages/server/src/modules/powers/member'
import { createSdbdataParser } from 'packages/server/src/modules/utils'
import routeIndex from '../../../utils/route-index'
import { createRoomLocation } from '../../utils/rooms-loc'
import { createSingleRoomItemGetter } from './read-single-room'

const getClassName = (gradeid: number, classid: number) => {
  const gids = ['', '初一', '初二', '初三']
  if (![1, 2, 3].includes(gradeid)) {
    for (let i = 1; i <= 3; i++) {
      if (createYearTransformer(i) === gradeid) gradeid = i
    }
  }
  return `${gids[gradeid]}（${classid}）班`
}

const getPerson = (personId: string) => {
  const result = routeIndex(personId)
  if (result?.type === 'admin') return '管理员'
  else if (result?.type === 'member') return getSingleMemberAsRaw(result.number).details?.name
  else if (result?.type === 'class') return getClassName(result.gradeid, result.classid)
  else return ''
}

const getRecent = (messageFile: MessageFile) => {
  if (Object.entries(messageFile.details).length === 0) {
    return '无最新消息'
  } else {
    let recentItem = Object.values(messageFile.details).reverse()[0] as message
    const creator = getPerson(recentItem.creator)
    if (recentItem.type === 'text') {
      return `${creator}: ${recentItem.content.substring(0, 8)}...`
    } else if (recentItem.type === 'file') {
      return `${creator}: [文件]`
    } else {
      return `${creator}: [图片]`
    }
    // return `${recentItem.creator}: ${recentItem.}`
  }
}

const readMyRooms = (user: string) => {
  // createPath(user)
  const location = createRoomLocation(user)
  const roomIds = createSdbdataParser(location as string).messageRooms as string[]
  if (typeof roomIds === 'undefined') {
    return []
  }
  return (
    roomIds.map(item => ({
      title: createSingleRoomItemGetter(item).config.title,
      id: item,
      recent: getRecent(createSingleRoomItemGetter(item)),
      members: createSingleRoomItemGetter(item).config.users.map(x => ({ id: x, name: getPerson(x) })),
    })) ?? []
  )
}

export { readMyRooms }
