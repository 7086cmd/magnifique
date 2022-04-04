import dayjs from 'dayjs'
import { createYearTransformer } from 'packages/pages/src/modules/utils'
import { getSingleMemberAsRaw } from 'packages/server/src/modules/powers/member'
import { messageActions } from '../../..'
import routeIndex from '../../../utils/route-index'
import { createSingleRoomItemGetter } from './read-single-room'
import { getAllRooms } from './vail-all-rooms'

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
  const roomIds = getAllRooms(user)
  if (typeof roomIds === 'undefined') {
    return []
  }

  return roomIds
    .map(item => {
      const roomInf = createSingleRoomItemGetter(item)
      return {
        title:
          roomInf.config.users.length === 1 ? `我（${getPerson(user)}）` : roomInf.config.users.length !== 2 ? roomInf.config.title : getPerson(roomInf.config.users.filter(item => item !== user)[0]),
        id: item,
        recent: getRecent(createSingleRoomItemGetter(item)),
        members: createSingleRoomItemGetter(item).config.users.map(x => ({ id: x, name: getPerson(x) })),
      }
    })
    .sort((item1, item2) => {
      const i1rec = messageActions.createMessageReader(item1.id, item1.members.map(item => item.id)[0]).details
      const i2rec = messageActions.createMessageReader(item2.id, item2.members.map(item => item.id)[0]).details
      const i1s = i1rec?.sort((a, b) => dayjs(b.createDate).unix() - dayjs(a.createDate).unix())[0]
      const i2s = i2rec?.sort((a, b) => dayjs(b.createDate).unix() - dayjs(a.createDate).unix())[0]
      return dayjs(i2s?.createDate).unix() - dayjs(i1s?.createDate).unix()
    })
}

export { readMyRooms, getPerson }
