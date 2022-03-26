import { createSdbdataParser } from 'packages/server/src/modules/utils'
import { createRoomLocation } from '../../utils/rooms-loc'
import { createSingleRoomItemGetter } from './read-single-room'

const getRecent = (messageFile: MessageFile) => {
  if (Object.entries(messageFile.details).length === 0) {
    return '无最新消息'
  } else {
    let recentItem = Object.values(messageFile.details).reverse()[0] as message
    if (recentItem.type === 'text') {
      return `${recentItem.creator}: ${recentItem.content.substring(0, 8)}...`
    } else if (recentItem.type === 'file') {
      return `${recentItem.creator}: [文件]`
    } else {
      return `${recentItem.creator}: [图片]`
    }
    // return `${recentItem.creator}: ${recentItem.}`
  }
}
const readMyRooms = (user: string) => {
  // createPath(user)
  const location = createRoomLocation(user)
  const roomIds = createSdbdataParser(location as string).messageRooms as string[]
  return roomIds.map(item => ({
    title: createSingleRoomItemGetter(item).config.title,
    id: item,
    recent: getRecent(createSingleRoomItemGetter(item)),
  }))
}

export { readMyRooms }