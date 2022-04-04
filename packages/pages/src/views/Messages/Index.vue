<script lang="ts" setup>
/* global MessageItem */
import { ref, defineProps, toRefs, watch, h } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { MessageClient } from '../../components/messages/modules/main'
import NProgress from 'nprogress'
// import dayjs from 'dayjs'
import { ElMessageBox, ElNotification } from 'element-plus'
import type { ElScrollbar, ElInput } from 'element-plus'
import failfuc from '../../modules/failfuc'
import { onStartTyping } from '@vueuse/core'
import { ArrowLeft, More, Close } from '@element-plus/icons-vue'
import { uniq } from 'lodash'
import { useRoute, useRouter } from 'vue-router'
import MessagePiece from '../../components/messages/piece.vue'

const route = useRoute()
const router = useRouter()

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

refresh().then(() => {
  if (route.params.id !== undefined) {
    getRoomMsg(route.params.id as string)
  }
})

let searcher = ref('')

const emit = async () => {
  const roomId = roomData.value.id
  NProgress.start()
  const status: Record<string, boolean> = {}
  items.value.filter(x => x.id === roomId)[0].members.forEach(x => (status[x.id] = false))
  status[username.value] = true
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

let fullListFlatten = ref<option[]>([])

const fullListLoad = async () => {
  NProgress.start()
  fullList.value = Object.assign([], await client.getFullList())
  fullListFlatten.value = client.getFlatten(Object.assign([], await client.getFullList()))
  // console.log(fullList.value, fullListFlatten.value)
  fullList.value = fullList.value.filter(item => item.children?.filter(it => it.children).length !== 0)
  isCreatingRoom.value = true
  NProgress.done()
}

const proping = ref({
  multiple: true,
  emitPath: false,
  // checkStrictly: true,
  expandTrigger: 'hover',
})

const roomc = ref({
  title: '',
  description: '',
  users: [] as string[],
})

const createRoom = async () => {
  NProgress.start()
  roomc.value.users.push(username.value)
  roomc.value.users = uniq(roomc.value.users)
  const id = (await client.createRoom(roomc.value)) as string
  await refresh()
  getRoomMsg(id)
  isCreatingRoom.value = false
  NProgress.done()
}

const inputRef = ref<InstanceType<typeof ElInput>>()

onStartTyping(() => {
  inputRef.value?.focus()
})

watch(roomc.value, () => {
  roomc.value.users = uniq(roomc.value.users)
  // console.log(roomc.value)
})

watch(isShown, async () => {
  if (isShown.value === false) {
    NProgress.start()
    items.value = await client.getLatestRooms()
    if (username.value === 'admin') {
      router.push('/admin/message')
    } else {
      router.push(`/${username.value.split('/')[0]}/message`)
    }
    NProgress.done()
  } else if (isShown.value === true) {
    if (username.value === 'admin') {
      router.push('/admin/message/' + roomData.value.id)
    } else {
      router.push(`/${username.value.split('/')[0]}/message/${roomData.value.id}`)
    }
  }
})

let editingTitle = ref(false)

const deleteGroup = async () => {
  ElMessageBox.prompt(h('span', null, [h('b', null, '危险！此操作不可逆！'), '输入密码以继续']), 'Think Twice, Delete Once!', {
    type: 'error',
    center: true,
    inputType: 'password',
    roundButton: true,
    inputValidator: val => (window.btoa(val) !== password.value ? '密码错误' : true),
  }).then(async () => {
    NProgress.start()
    await client.deleteRoom(roomData.value.id)
    editingTitle.value = false
    isShown.value = false
    await refresh()
    NProgress.done()
  })
}

let useRichTextEditor = ref(false)
</script>

<template>
  <div>
    <el-input ref="inputRef" v-model="searcher" size="large" placeholder="输入以检索" :prefix-icon="Search"></el-input>
    <el-button round @click="fullListLoad">新建聊天组</el-button>
    <el-scrollbar max-height="720px">
      <el-divider />
      <div v-for="item in items" :key="item.id">
        <div v-if="item.title.toLowerCase().includes(searcher.toLowerCase())">
          <el-tooltip :content="'聊天组编号：' + item.id" placement="right" effect="light">
            <el-link :underline="false" style="font-size: 20px" @click="getRoomMsg(item.id)">
              {{ item.title }}
              <span v-if="item.members.length > 2"><el-tag type="warning" v-text="'群组'" /><el-tag v-for="member in item.members" :key="member.id" v-text="member.name"></el-tag></span>
              <span v-else-if="item.members.length === 2"><el-tag type="success" v-text="'单聊'" /></span>
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
    <el-drawer v-model="editingTitle" direction="ltr" size="25%" :title="'更多 | ' + roomData.title" :modal="false">
      <van-cell title="群名" :value="roomData.title"></van-cell>
      <el-popconfirm title="确定要解散吗？" icon-color="red" confirm-button-type="danger" @confirm="deleteGroup">
        <template #reference>
          <el-button round type="danger" plain style="width: 100%">解散</el-button>
        </template>
      </el-popconfirm>
    </el-drawer>
    <el-drawer v-model="isShown" direction="rtl" size="70%" :close-on-click-modal="true" :show-close="false" :modal="true">
      <template #title>
        <el-page-header :icon="ArrowLeft" @back="isShown = false">
          <template #content>
            <span v-if="!editingTitle">{{ roomData.title }}</span>
            <el-button v-if="!editingTitle && roomData.members.length > 2" round type="text" :icon="More" @click="editingTitle = true" />
            <el-row>
              <el-col :span="16"><el-input v-if="editingTitle" v-model="roomData.title" /></el-col>
              <el-col :span="4"><el-button v-if="editingTitle" round type="text" :icon="Close" @click="editingTitle = false" /></el-col>
            </el-row>
          </template>
          <template #title> <sub style="font-size: 14px">返回</sub> </template>
        </el-page-header>
      </template>
      <el-scrollbar ref="messageContent" max-height="480px" style="height: 60%">
        <div v-for="msg in msgs" :key="msg.id">
          <div v-if="msg.content.length > 50">
            <el-card v-if="!msg.editing" shadow="never">
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
                <v-md-editor v-model="msg.content" mode="preview"></v-md-editor>
              </template>
            </el-card>
            <v-md-editor
              v-if="msg.editing"
              v-model="editContent"
              height="480px"
              left-toolbar="undo redo clear | h bold italic emoji strikethrough quote tip | ul ol table hr todo-list | link image code | save"
              @save="createEdition(msg.id)"
            ></v-md-editor>
            <div v-if="msg.editing">
              <el-button round type="primary" :disabled="editContent === msg.content || editContent === ''" @click="createEdition(msg.id)">保存</el-button>
              <el-button round @click="msg.editing = false">取消</el-button>
            </div>
          </div>
          <p v-else style="padding-top: 8px"><message-piece :content="msg" :username="username" :client="client" :room-id="roomData.id"></message-piece></p>
        </div>
      </el-scrollbar>
      <v-md-editor
        v-model="createMsgData"
        height="30%"
        style="padding-left: 3em; padding-right: 3em; height: 30%"
        left-toolbar="undo redo clear | h bold italic emoji strikethrough quote tip | ul ol table hr todo-list | link image code | save"
        @save="emit"
      />
      <br />
      <el-button round type="primary" :disabled="createMsgData.length === 0" @click="emit">发送</el-button>
      <el-button round @click="isShown = false">关闭</el-button>
    </el-drawer>
    <el-dialog v-model="isCreatingRoom" title="新建聊天组" center>
      <el-form :model="roomc">
        <el-form-item label="成员">
          <el-cascader-panel v-model="roomc.users" filterable :options="fullList" :props="proping" :show-all-levels="false" collapse-tags clearable style="width: 100%"></el-cascader-panel>
        </el-form-item>
        <el-form-item label="选中">
          <!-- <el-tag v-for="item in roomc.users" :key="item" plain v-text="client.getName(fullListFlatten, item)"></el-tag> -->
          <el-select-v2 v-model="roomc.users" :options="fullListFlatten" style="width: 100%" multiple></el-select-v2>
        </el-form-item>
        <el-form-item label="标题" :disable="roomc.users.length === 1 || (roomc.users.length === 2 && roomc.users.includes(username))">
          <el-input v-model="roomc.title"></el-input>
        </el-form-item>
        <el-form-item label="介绍">
          <el-input v-model="roomc.description" type="textarea"></el-input>
        </el-form-item>
        <el-button round @click="isCreatingRoom = false">取消</el-button>
        <el-button round type="primary" @click="createRoom">确定</el-button>
      </el-form>
    </el-dialog>
  </div>
</template>
