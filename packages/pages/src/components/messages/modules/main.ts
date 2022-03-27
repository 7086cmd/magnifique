import axios from 'axios'
import dayjs from 'dayjs'
import { ElMessageBox } from 'element-plus'
import baseurl from '../../../modules/baseurl'
import routeIndex from '../utils/route-index'

// const baseurl = `http://localhost/api/`

export class MessageClient {
  userConfig: fetchAsAdmin | fetchAsClass | fetchAsSingleMember | undefined
  userId: string
  password: string
  constructor(username: string, password: string) {
    this.userId = username
    this.password = password
    try {
      const router = routeIndex(username)
      if (router !== null) {
        const routing = router as fetchAsAdmin | fetchAsClass | fetchAsSingleMember
        routing.password = password
        this.userConfig = routing
      } else {
        throw 'Invalid Input Username: ' + username
      }
    } catch (e) {
      ElMessageBox.alert('执行出错：' + (e as string), '登录出错', {
        type: 'error',
        center: true,
      })
    }
  }
  getLatestRooms = async () => {
    return (
      await axios(baseurl + 'message/get/rooms', {
        params: {
          username: this.userId,
          password: this.password,
        },
      })
    ).data.details
  }
  getRoomMessages = async (roomId: string) => {
    return (
      await axios(baseurl + 'message/get/messages', {
        params: {
          username: this.userId,
          password: this.password,
          roomId: roomId,
        },
      })
    ).data.details.map((x: MessageItem) => {
      x.createDate = dayjs(x.createDate).format('YYYY/MM/DD HH:mm:ss')
      return x
    })
  }
  createMessage = async (roomId: string, messageContent: string, status: Record<string, boolean>) => {
    return (
      await axios(baseurl + 'message/create/message', {
        data: {
          username: this.userId,
          password: this.password,
          roomId,
          messageContent: {
            creator: this.userId,
            createData: dayjs().toJSON(),
            type: 'text',
            content: messageContent,
            status,
          },
        },
        method: 'post',
      })
    ).data
  }
}
