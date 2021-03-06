<!-- @format -->

<script lang="ts" setup>
/* global MessageItem, defineProps */
import { ref, toRefs, watch, h } from "vue";
import { Search } from "@element-plus/icons-vue";
import { MessageClient } from "../../components/messages/modules/main";
// import dayjs from 'dayjs'
import { ElMessageBox, ElNotification } from "element-plus";
import type { ElScrollbar, ElInput } from "element-plus";
import failfuc from "../../modules/failfuc";
import { onStartTyping, useSpeechRecognition } from "@vueuse/core";
import {
  ArrowLeft,
  More,
  Plus,
  Delete,
  ArrowRight,
  Close,
  Check,
  Upload,
  Microphone,
} from "@element-plus/icons-vue";
import { uniq } from "lodash";
import { useRoute, useRouter } from "vue-router";
import MessagePiece from "../../components/messages/piece.vue";
import { menusItemType } from "vue3-menus";
import { MessageRoomSubscribor } from "../../components/messages/socket/init";

const route = useRoute();
const router = useRouter();

const props = defineProps<{
  username: string;
  password: string;
}>();

const { username, password } = toRefs(props);

const client = new MessageClient(username.value, password.value);

const items = ref<
  {
    title: string;
    id: string;
    recent: string;
    members: {
      id: string;
      name: string;
    }[];
    unreaded: number;
    className: string;
  }[]
>([]);

const load = ref(true);
const msgs = ref<(MessageItem & { editing: boolean })[]>([]);

const refresh = async () => {
  load.value = true;
  const rangers = ["Down", "Up", "Left", "Right"];
  items.value = (await client.getLatestRooms()).map(
    (x: Record<string, unknown>) => {
      x.className =
        "animate__animated animate__fadeIn" +
        rangers[Math.round(Math.random() * 4)];
      return x;
    }
  );
  load.value = false;
};

let isShown = ref(false);
let roomData = ref({
  title: "",
  id: "",
  recent: "",
  members: [
    {
      id: "",
      name: "",
    },
  ],
});

const isFetchingItems = ref(false);

let createMsgData = ref("");

const messageContent = ref<InstanceType<typeof ElScrollbar>>();

let memberIngroup = ref<string[]>([]);

const getRoomMsg = async (roomId: string) => {
  createMsgData.value = "";
  load.value = true;
  msgs.value = await client.getRoomMessages(roomId);
  roomData.value = items.value.filter((x) => x.id === roomId)[0];
  memberIngroup.value = roomData.value.members.map((x) => x.id);
  load.value = false;
  isShown.value = true;
  setTimeout(() => messageContent.value?.setScrollTop(2160), 100);
};
isFetchingItems.value = true;
refresh().then(() => {
  isFetchingItems.value = false;
  if (route.params.id !== undefined) {
    getRoomMsg(route.params.id as string);
  }
});

let searcher = ref("");

const emit = async () => {
  const roomId = roomData.value.id;
  load.value = true;
  const status: Record<string, boolean> = {};
  items.value
    .filter((x) => x.id === roomId)[0]
    .members.forEach((x) => (status[x.id] = false));
  status[username.value] = true;
  const result = await client.createMessage(
    roomId,
    createMsgData.value,
    status
  );
  if (result.status !== "ok") {
    failfuc(result.reason, result.text);
  }
  getRoomMsg(roomId);
  load.value = false;
};

const deleteMessage = async (msgId: string) => {
  load.value = true;
  const result = await client.deleteMessage(roomData.value.id, msgId);
  if (result.status !== "ok") {
    failfuc(result.reason, result.text);
  }
  getRoomMsg(roomData.value.id);
  load.value = false;
};

let editContent = ref("");

const startEdit = (messageId: string) => {
  msgs.value.filter((x) => x.id === messageId)[0].editing = true;
  editContent.value = msgs.value.filter((x) => x.id === messageId)[0].content;
};

const createEdition = async (messageId: string) => {
  const roomId = roomData.value.id;
  load.value = true;

  msgs.value.filter((x) => x.id === messageId)[0].editing = false;
  const result = await client.updateMessage(
    roomId,
    messageId,
    editContent.value
  );
  if (result.status !== "ok") {
    failfuc(result.reason, result.text);
  }
  getRoomMsg(roomId);
  load.value = false;
};

interface option {
  value: string;
  label: string;
  children?: option[];
}

let fullList = ref<option[]>([]);

let isFetchingFullListOrCreatingRoom = ref(false);
let isOpenCreateWindow = ref(false);

const fullListLoad = async () => {
  isOpenCreateWindow.value = true;
  isFetchingFullListOrCreatingRoom.value = true;
  fullList.value = Object.assign([], await client.getFullList());
  fullList.value = fullList.value.filter(
    (item) => item.children?.filter((it) => it.children).length !== 0
  );
  isFetchingFullListOrCreatingRoom.value = false;
};

watch(isOpenCreateWindow, () => {
  if (isOpenCreateWindow.value) {
    if (username.value === "admin") {
      router.push("/admin/message/create/");
    } else {
      router.push(`/${username.value.split("/")[0]}/message/create`);
    }
  } else {
    if (username.value === "admin") {
      router.push("/admin/message/");
    } else {
      router.push(`/${username.value.split("/")[0]}/message/`);
    }
  }
});

const roomc = ref({
  title: "",
  description: "",
  users: [] as string[],
});

const createRoom = async () => {
  load.value = true;
  roomc.value.users.push(username.value);
  roomc.value.users = uniq(roomc.value.users);
  const id = (await client.createRoom(roomc.value)) as string;
  await refresh();
  getRoomMsg(id);
  isOpenCreateWindow.value = false;
  load.value = false;
};

if (route.params.status === "create") {
  let users = (route.query.with as string).split(",");
  fullListLoad();
  route.query.with && (roomc.value.users = users);
  route.query.title && (roomc.value.title = route.query.title as string);
  route.query.confirm && users.length < 2 && createRoom();
  // createRoom()
}

const inputRef = ref<InstanceType<typeof ElInput>>();

onStartTyping(() => {
  inputRef.value?.focus();
});

const subscribor = ref<MessageRoomSubscribor>();

watch(isShown, async () => {
  if (isShown.value === false) {
    load.value = true;
    subscribor.value?.unsubscribe();
    items.value = await client.getLatestRooms();
    if (username.value === "admin") {
      router.push("/admin/message");
    } else {
      router.push(`/${username.value.split("/")[0]}/message`);
    }
    load.value = false;
  } else if (isShown.value === true) {
    subscribor.value = new MessageRoomSubscribor({
      account: username.value,
      password: password.value,
      roomId: roomData.value.id,
      refresher: getRoomMsg,
    });
    subscribor.value.subscribe();
    if (username.value === "admin") {
      router.push("/admin/message/room/" + roomData.value.id);
    } else {
      router.push(
        `/${username.value.split("/")[0]}/message/room/${roomData.value.id}`
      );
    }
  }
});

let editingTitle = ref(false);

const deleteGroup = async () => {
  ElMessageBox.prompt(
    h("span", null, [h("b", null, "危险！此操作不可逆！"), "输入密码以继续"]),
    "Think Twice, Delete Once!",
    {
      type: "error",
      center: true,
      inputType: "password",
      roundButton: true,
      inputValidator: (val) =>
        window.btoa(val) !== password.value ? "密码错误" : true,
    }
  ).then(async () => {
    load.value = true;
    await client.deleteRoom(roomData.value.id);
    editingTitle.value = false;
    isShown.value = false;
    await refresh();
    load.value = false;
  });
};

// let useRichTextEditor = ref(false)

const groupMenus = ref({
  menus: [
    {
      label: "修改群名",
    },
    {
      label: "成员管理",
      click: async () => {
        fullList.value = Object.assign([], await client.getFullList());
        editingTitle.value = true;
      },
    },
    {
      label: "解散群组",
      click: deleteGroup,
    },
  ] as menusItemType[],
  zIndex: 10000,
});

let useId = ref("");

const blockMessageMenus = ref({
  menus: [
    {
      label: "修改",
      tip: "修改消息内容",
      click: () => startEdit(useId.value),
    },
    {
      label: "撤回",
      tip: "撤回消息",
      click: () => deleteMessage(useId.value),
    },
  ],
  zIndex: 9000,
});

window.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.keyCode === 13 && isShown.value) emit();
});

let contexted = ref("");
let showIt = ref(false);

const speechScanner = useSpeechRecognition({
  lang: "zh-CN",
  interimResults: true,
  continuous: true,
});
watch(speechScanner.result, () => {
  createMsgData.value = speechScanner.result.value;
});

let uploadData = ref({});

let isUploading = ref(false);

const createUploader = () => {
  uploadData.value = client.fileCenter.uploadData(roomData.value.id);
  isUploading.value = true;
};

const uploadSuccess = async () => {
  ElNotification({ title: "上传成功", type: "success" });
  await getRoomMsg(roomData.value.id);
};

const handleUploadImage = async (
  _evt: Event,
  insertImage: (param: { desc: string; url: string }) => void,
  files: Array<File>
) => {
  insertImage({
    url: (await client.fileCenter.upload(
      roomData.value.id,
      files[0]
    )) as string,
    desc: files[0].name,
  });
};
</script>

<template>
  <div v-loading="load" @click="showIt = false" @contextmenu.prevent>
    <el-row>
      <el-col :span="1">
        <el-button
          circle
          type="success"
          text
          bg
          round
          size="large"
          :icon="Plus"
          @click="fullListLoad"
        />
      </el-col>
      <el-col :span="1"> </el-col>
      <el-col :span="18">
        <el-input
          ref="inputRef"
          v-model="searcher"
          size="large"
          placeholder="输入以检索"
          :prefix-icon="Search"
        />
      </el-col>
      <el-col :span="1"></el-col>
      <el-col :span="1">
        <el-button
          v-if="
            showIt &&
            items.filter((x) => x.id === contexted)[0].members.length > 2
          "
          class="animate__animated animate__zoomInRight"
          circle
          type="danger"
          text
          bg
          size="small"
          :icon="Delete"
          @click="deleteGroup()"
        />
      </el-col>
    </el-row>
    <el-divider />
    <el-scrollbar v-loading="isFetchingItems" max-height="480px">
      <div v-for="item in items" :key="item.id">
        <div v-if="item.title.toLowerCase().includes(searcher.toLowerCase())">
          <el-tooltip
            :content="'聊天组编号：' + item.id"
            placement="right"
            effect="light"
          >
            <el-button
              text
              :style="{ fontSize: '16px' }"
              size="small"
              @click="getRoomMsg(item.id)"
              @mouseover="contexted = item.id"
              @click.stop
              @contextmenu.prevent="showIt = true"
            >
              {{ item.title }}
              <el-badge v-if="item.unreaded" :value="item.unreaded"></el-badge>
              <span v-if="item.members.length > 2">
                <el-tag type="warning" v-text="'群组'" /><el-tag
                  v-for="member in item.members"
                  :key="member.id"
                  v-text="member.name"
                >
                </el-tag>
              </span>
              <span v-else-if="item.members.length === 2">
                <el-tag type="success" v-text="'单聊'" />
              </span>
            </el-button>
          </el-tooltip>
          <br />
          <span style="color: gray; font-size: 14px">{{ item.recent }}</span>
          <el-divider />
        </div>
      </div>
      <div
        v-if="
          items.filter((item) => item.title.includes(searcher)).length === 0 &&
          !isFetchingItems
        "
      >
        <el-empty description="可是你还没有参与或者匹配到搜索的聊天组诶" />
      </div>
    </el-scrollbar>
    <el-dialog
      v-model="editingTitle"
      v-loading="load"
      direction="ltr"
      size="25%"
      :title="'成员管理 | ' + roomData.title"
      center
    >
      <el-tree-select
        v-model="memberIngroup"
        :data="fullList"
        style="width: 100%"
        multiple
        filterable
      />
      <el-divider />
      <div style="text-align: center">
        <el-button text bg round @click="editingTitle = false">取消</el-button>
        <el-button text bg round type="primary">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      v-model="isOpenCreateWindow"
      v-loading="load || isFetchingFullListOrCreatingRoom"
      title="新建聊天组"
      center
    >
      <el-form :model="roomc">
        <el-form-item label="成员">
          <el-tree-select
            v-model="roomc.users"
            show-checkbox
            :data="fullList"
            style="width: 100%"
            multiple
            filterable
          />
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="roomc.title"></el-input>
        </el-form-item>
        <el-button bg text type="primary" @click="createRoom">确定</el-button>
      </el-form>
    </el-dialog>
    <el-drawer
      v-model="isShown"
      v-loading="load"
      direction="btt"
      size="100%"
      :show-close="false"
    >
      <template #title>
        <el-page-header
          v-menus:right="groupMenus"
          :icon="ArrowLeft"
          @back="isShown = false"
        >
          <template #content>
            <span>{{ roomData.title }}</span>
            <el-button
              v-if="!editingTitle && roomData.members.length > 2"
              v-menus:left="groupMenus"
              :icon="More"
              text
              bg
              circle
              type="text"
              @click.stop
            />
          </template>
        </el-page-header>
      </template>
      <el-scrollbar
        ref="messageContent"
        v-loading="load"
        min-height="480px"
        style="height: 60%"
      >
        <div
          v-for="msg in msgs"
          :key="msg.id"
          className="animate__animated animate__slideInDown"
        >
          <div
            v-if="msg.content.length > 1000 && msg.type !== 'file'"
            @mouseover="useId = msg.id"
          >
            <el-card v-menus="blockMessageMenus" shadow="never">
              <template #header>
                <el-link :underline="false" style="font-size: 16px">
                  {{
                    roomData.members
                      .filter((x) => x.id === msg.creator)
                      .map((x) => x.name)[0]
                  }}
                </el-link>
              </template>
              <template #default>
                <v-md-editor
                  v-if="!msg.editing"
                  v-model="msg.content"
                  class="animate__animated animate__slideInRight"
                  mode="preview"
                ></v-md-editor>
                <v-md-editor
                  v-if="msg.editing"
                  v-model="editContent"
                  height="480px"
                  left-toolbar="undo redo clear | h bold italic emoji strikethrough quote tip | ul ol table hr todo-list | link image code | save"
                  :disabled-menus="[]"
                  @save="createEdition(msg.id)"
                  @upload-image="handleUploadImage"
                />
                <br />
                <div v-if="msg.editing" style="text-align: right">
                  <el-button
                    circle
                    type="danger"
                    text
                    bg
                    :icon="Close"
                    @click="msg.editing = false"
                  />
                  <el-button
                    circle
                    type="success"
                    text
                    bg
                    :disabled="
                      editContent === msg.content || editContent === ''
                    "
                    :icon="Check"
                    @click="createEdition(msg.id)"
                  />
                </div>
              </template>
            </el-card>
          </div>
          <p
            v-else-if="msg.type !== 'file'"
            className="animate__animated animate__slideInDown"
            style="padding-top: 8px"
          >
            <span
              v-if="msg.creator !== username"
              style="font-size: 12px; color: gray"
              >{{
                roomData.members
                  .filter((x) => x.id === msg.creator)
                  .map((x) => x.name)[0]
              }}
            </span>
            <message-piece
              :content="msg"
              :username="username"
              :client="client"
              :room-id="roomData.id"
              :rfmethod="getRoomMsg"
            ></message-piece>
          </p>
          <file-message
            v-else
            :id="msg.content"
            :room="roomData.id"
            :client="client"
            :msg="msg.id"
            :roomperson="roomData.members"
            :refresh="getRoomMsg"
          />
        </div>
      </el-scrollbar>
      <v-md-editor
        v-model="createMsgData"
        height="30%"
        style="padding-left: 3em; padding-right: 3em; height: 30%"
        left-toolbar="undo redo clear | h bold italic emoji strikethrough quote tip | ul ol table hr todo-list | link image code | save"
        :disabled-menus="[]"
        @save="emit"
        @upload-image="handleUploadImage"
      />
      <br />
      <div style="text-align: right">
        <el-tooltip content="语音输入" placement="top" effect="light">
          <el-button
            circle
            type="primary"
            text
            bg
            :disabled="!speechScanner.isSupported"
            :icon="Microphone"
            @click="speechScanner.toggle()"
          />
        </el-tooltip>
        <el-tooltip content="上传文件" placement="top" effect="light">
          <el-button
            circle
            type="warning"
            text
            bg
            :icon="Upload"
            @click="createUploader"
          />
        </el-tooltip>
        <el-tooltip content="关闭窗口" placement="top" effect="light">
          <el-button
            circle
            type="danger"
            text
            bg
            :icon="Close"
            @click="isShown = false"
          />
        </el-tooltip>
        <el-tooltip content="发送消息" placement="top" effect="light">
          <el-button
            circle
            type="success"
            text
            bg
            :loading="load"
            :disabled="createMsgData.length === 0"
            :icon="ArrowRight"
            @click="emit"
          />
        </el-tooltip>
      </div>
    </el-drawer>
    <el-dialog v-model="isUploading" v-loading="load" center title="上传文件">
      <el-upload
        class="upload-demo"
        drag
        :action="client.fileCenter.uploadDesc"
        multiple
        method="put"
        :data="uploadData"
        :on-success="uploadSuccess"
        style="text-align: center"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div className="el-upload__text">
          将文件拖拽到这里或者<em>点击此处</em>
        </div>
        <template #tip>
          <div className="el-upload__tip">任意文件格式，小于80MiB</div>
        </template>
      </el-upload>
    </el-dialog>
  </div>
</template>
