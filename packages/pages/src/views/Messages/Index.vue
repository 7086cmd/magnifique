<script lang="ts" setup>
/* global MessageItem */
import { ref, defineProps, toRefs } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { MessageClient } from '../../components/messages/modules/main'
import NProgress from 'nprogress'
import dayjs from 'dayjs'
import { ElNotification } from 'element-plus'
import type { ElScrollbar } from 'element-plus'
import failfuc from '../../modules/failfuc'

const props = defineProps<{
  username: string
  password: string
}>()

const { username, password } = toRefs(props)

const client = new MessageClient(username.value, password.value)

const items = ref<
  {
    title: string
    id: string
    recent: string
    members: {
      id: string
      name: string
    }[]
  }[]
>([])
const msgs = ref<(MessageItem & { editing: boolean })[]>([])

const refresh = async () => {
  NProgress.start()
  items.value = await client.getLatestRooms()
  NProgress.done()
}

let isShown = ref(false)
let roomData = ref({
  title: '',
  id: '',
  recent: '',
  members: [
    {
      id: '',
      name: '',
    },
  ],
})

let createMsgData = ref('')

const messageContent = ref<InstanceType<typeof ElScrollbar>>()

const getRoomMsg = async (roomId: string) => {
  createMsgData.value = ''
  NProgress.start()
  msgs.value = await client.getRoomMessages(roomId)
  roomData.value = items.value.filter(x => x.id === roomId)[0]
  NProgress.done(true)
  isShown.value = true
  setTimeout(() => messageContent.value?.setScrollTop(2160), 100)
}

refresh()

let searcher = ref('')

const emit = async () => {
  const roomId = roomData.value.id
  NProgress.start()
  const status: Record<string, boolean> = {}
  items.value.filter(x => x.id === roomId)[0].members.forEach(x => (status[x.id] = false))
  status[username.value] = true
  if (createMsgData.value.split('\n').length >= 20) {
    createMsgData.value = `::: details 由于本文过长，已将其包含在了该详细信息中，请点按展开\n${createMsgData.value}\n:::`
  }
  const result = await client.createMessage(roomId, createMsgData.value, status)
  if (result.status === 'ok') {
    ElNotification({
      title: '消息发送成功',
      type: 'success',
    })
  } else {
    failfuc(result.reason, result.text)
  }
  getRoomMsg(roomId)
  NProgress.done()
}

const deleteMessage = async (msgId: string) => {
  NProgress.start()
  const result = await client.deleteMessage(roomData.value.id, msgId)
  if (result.status === 'ok') {
    ElNotification({
      title: '消息发送成功',
      type: 'success',
    })
  } else {
    failfuc(result.reason, result.text)
  }
  getRoomMsg(roomData.value.id)
  NProgress.done()
}

let editContent = ref('')

const startEdit = (messageId: string) => {
  msgs.value.filter(x => x.id === messageId)[0].editing = true
  editContent.value = msgs.value.filter(x => x.id === messageId)[0].content
}

const createEdition = async (messageId: string) => {
  const roomId = roomData.value.id
  NProgress.start()

  msgs.value.filter(x => x.id === messageId)[0].editing = false
  const result = await client.updateMessage(roomId, messageId, editContent.value)
  if (result.status === 'ok') {
    ElNotification({
      title: '消息发送成功',
      type: 'success',
    })
  } else {
    failfuc(result.reason, result.text)
  }
  getRoomMsg(roomId)
  NProgress.done()
}

interface option {
  value: string
  label: string
  children?: option[]
}

let fullList = ref<option[]>([])

let isCreatingRoom = ref(false)

const fullListLoad = async () => {
  NProgress.start()
  fullList.value = await client.getFullList()
  isCreatingRoom.value = true
  NProgress.done()
}

const proping = ref({
  multiple: true,
})

const roomc = ref({
  title: '',
  description: '',
  users: [] as string[][] | string[],
})

const createRoom = async () => {
  NProgress.start()
  const users = roomc.value.users.map((item: string[] | string) => {
    item = (item as string[]).reverse()[0]
    return item
  })
  !users.includes(client.userId) && users.push(client.userId)
  roomc.value.users = users as string[]
  client.createRoom(
    roomc.value as {
      title: string
      description: string
      users: string[]
    }
  )
  NProgress.done()
}
</script>

<template>
  <div>
    <el-input v-model="searcher" size="large" placeholder="输入以检索" :prefix-icon="Search"></el-input>
    <el-button @click="fullListLoad">新建聊天组</el-button>
    <el-scrollbar max-height="720px">
      <el-divider />
      <div v-for="item in items" :key="item.id">
        <div v-if="item.title.includes(searcher)">
          <el-tooltip :content="'聊天组编号：' + item.id" placement="right" effect="light">
            <el-link :underline="false" style="font-size: 20px" @click="getRoomMsg(item.id)">
              {{ item.title }}
              <el-tag v-for="member in item.members" :key="member.id" v-text="member.name"></el-tag>
            </el-link>
          </el-tooltip>
          <br />
          <span style="color: gray; font-size: 14px">{{ item.recent }}</span>
          <el-divider border-style="dashed" />
        </div>
      </div>
      <div v-if="items.filter(item => item.title.includes(searcher)).length === 0">
        <el-empty description="可是你还没有参与或者匹配到搜索的聊天组诶" />
      </div>
    </el-scrollbar>
    <el-drawer v-model="isShown" direction="btt" :title="roomData.title" size="100%">
      <el-scrollbar ref="messageContent" max-height="960px">
        <el-timeline>
          <el-timeline-item v-for="msg in msgs" :key="msg.id" :timestamp="msg.createDate">
            <el-card shadow="never">
              <template #header>
                <el-dropdown>
                  <el-icon><More /></el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="startEdit(msg.id)">
                        <el-icon>
                          <Edit />
                        </el-icon>
                        修改
                      </el-dropdown-item>
                      <el-dropdown-item divided @click="deleteMessage(msg.id)">
                        <el-icon>
                          <Delete />
                        </el-icon>
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <span style="padding-left: 1em"></span>
                <el-link :underline="false" style="font-size: 16px">
                  {{ roomData.members.filter(x => x.id === msg.creator).map(x => x.name)[0] }}
                </el-link>
              </template>
              <template #default>
                <v-md-editor v-if="!msg.editing" v-model="msg.content" mode="preview"></v-md-editor>
                <v-md-editor
                  v-if="msg.editing"
                  v-model="editContent"
                  height="480px"
                  left-toolbar="undo redo clear | h bold italic emoji strikethrough quote tip | ul ol table hr todo-list | link image code | save"
                  @save="createEdition(msg.id)"
                ></v-md-editor>
                <div v-if="msg.editing">
                  <el-button type="primary" :disabled="editContent === msg.content || editContent === ''" @click="createEdition(msg.id)">保存</el-button>
                  <el-button @click="msg.editing = false">取消</el-button>
                </div>
              </template>
            </el-card>
          </el-timeline-item>
          <el-timeline-item :timestamp="dayjs().format('YYYY/MM/DD HH:mm:ss')">
            <v-md-editor
              v-model="createMsgData"
              height="480px"
              left-toolbar="undo redo clear | h bold italic emoji strikethrough quote tip | ul ol table hr todo-list | link image code | save"
              @save="emit"
            ></v-md-editor>
            <br />
            <el-button type="primary" :disabled="createMsgData.length === 0" @click="emit">发送</el-button>
            <el-button @click="isShown = false">关闭</el-button>
          </el-timeline-item>
        </el-timeline>
      </el-scrollbar>
    </el-drawer>
    <el-dialog v-model="isCreatingRoom" title="新建聊天组" center>
      <el-form :model="roomc">
        <el-form-item label="成员">
          <el-cascader v-model="roomc.users" filterable :options="fullList" :props="proping" :show-all-levels="false" collapse-tags clearable style="width: 100%"></el-cascader>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="roomc.title"></el-input>
        </el-form-item>
        <el-form-item label="介绍">
          <el-input v-model="roomc.description" type="textarea"></el-input>
        </el-form-item>
        <el-button @click="isCreatingRoom = false">取消</el-button>
        <el-button type="primary" @click="createRoom">确定</el-button>
      </el-form>
    </el-dialog>
  </div>
</template>
