<script lang="ts" setup>
/* global defineProps, MessageItem */
import { renderMarkdownInline } from './modules/ril'
import { toRefs, ref, shallowRef } from 'vue'
import type { MessageClient } from './modules/main'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps<{
  content: MessageItem
  username: string
  client: MessageClient
  roomId: string
}>()

const { content, username, client, roomId } = toRefs(props)

const val = ref(renderMarkdownInline(content.value.content))

const menus = shallowRef({
  menus: [
    {
      label: '撤回',
      icon: Delete,
      click: () => {
        client.value.deleteMessage(roomId.value, content.value.id)
      },
    },
  ],
})
</script>

<template>
  <div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="content.creator === username" id="msg" v-menus:right="menus" style="text-align: right"><span id="msgi" style="background-color: #ecf5ff" v-html="val"></span></div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-else id="msg" style="text-align: left"><span id="msgi" style="background-color: #f4f4f5" v-html="val"></span></div>
  </div>
</template>

<style scoped>
#msg {
  border-radius: 8px;
  font-size: 18px;
  width: auto;
}
#msgi {
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 8px;
}
</style>
