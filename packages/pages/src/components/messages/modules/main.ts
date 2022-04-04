import axios from 'axios'
import dayjs from 'dayjs'
import { ElMessageBox, ElNotification } from 'element-plus'
import failfuc from '../../../modules/failfuc'
import { unref } from 'vue'
import baseurl from '../../../modules/baseurl'
import routeIndex from '../utils/route-index'

// const baseurl = `http://localhost/api/`

interface FullList {
  label: string
  value: string
  children?: FullList[]
}

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
      await axios(baseurl + 'message/room', {
        params: {
          username: this.userId,
          password: this.password,
        },
      })
    ).data.details
  }
  getRoomMessages = async (roomId: string) => {
    return (
      await axios(baseurl + 'message/message', {
        params: {
          username: this.userId,
          password: this.password,
          roomId: roomId,
        },
      })
    ).data.details.map((x: MessageItem & { editing: boolean }) => {
      x.createDate = dayjs(x.createDate).format('YYYY/MM/DD HH:mm:ss')
      x.editing = false
      return x
    })
  }
  createMessage = async (roomId: string, messageContent: string, status: Record<string, boolean>) => {
    return (
      await axios(baseurl + 'message/message', {
        data: {
          auth: {
            username: this.userId,
            password: this.password,
          },
          data: {
            roomId,
            messageContent: {
              creator: this.userId,
              createData: dayjs().toJSON(),
              type: 'text',
              content: messageContent,
              status,
            },
          },
        },
        method: 'post',
      })
    ).data
  }
  deleteMessage = async (roomId: string, messageId: string) => {
    return (
      await axios(baseurl + 'message/message', {
        data: {
          auth: {
            username: this.userId,
            password: this.password,
          },
          data: {
            roomId,
            messageId,
          },
        },
        method: 'delete',
      })
    ).data
  }
  updateMessage = async (roomId: string, messageId: string, updateContent: string) => {
    return (
      await axios(baseurl + 'message/message', {
        data: {
          auth: {
            username: this.userId,
            password: this.password,
          },
          data: {
            roomId,
            messageId,
            updateContent,
          },
        },
        method: 'patch',
      })
    ).data
  }
  getFullList = async () => (await axios(baseurl + 'message/memberlist')).data.details
  createRoom = async (content: { users: string[]; title: string; description: string }) => {
    const result = await axios(baseurl + 'message/room', {
      data: {
        auth: {
          username: this.userId,
          password: this.password,
        },
        data: {
          ...content,
        },
      },
      method: 'post',
    })
    // return result.data
    if (result.data.status === 'ok') {
      ElNotification({
        title: '消息组创建成功',
        type: 'success',
      })
      return result.data.details
    } else if (result.data.status === 'error') {
      failfuc(result.data.reason, result.data.text)
    }
  }
  deleteRoom = async (roomId: string) => {
    const result = await axios(baseurl + 'message/room', {
      data: {
        auth: {
          username: this.userId,
          password: this.password,
        },
        data: {
          id: roomId,
        },
      },
      method: 'delete',
    })
    // return result.data
    if (result.data.status === 'ok') {
      ElNotification({
        title: '群组删除成功',
        type: 'success',
      })
      return result.data.details
    } else if (result.data.status === 'error') {
      failfuc(result.data.reason, result.data.text)
    }
  }
  getName = (fullList: FullList[], id: string) => {
    // .filter(item => item.value === id)[0].label
    return fullList.filter(item => item.value === id)[0].label
  }
  getFlatten = (fullList: FullList[]) => {
    const reduce = (items: FullList[]) => {
      items.forEach(item => {
        if (item.children) {
          items.push(...(reduce(item.children) as FullList[]))
        }
        // delete item.children
      })
      return items.filter(item => !item.children)
    }
    const lists = [] as FullList[]
    lists.push(...Array.from(unref(Object.assign([], fullList))))
    return reduce(lists)
  }
}
