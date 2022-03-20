<script setup lang="ts">
import { defineProps, toRefs } from 'vue'
import dayjs from 'dayjs'
import routeIndex from './utils/route-index'
type markdown = string
const props = defineProps<{
  content: markdown
  creator: string
  createDate: string | Date
}>()

const { content, creator, createDate } = toRefs(props)
</script>

<template>
  <el-card>
    <template #header>
      {{ routeIndex(creator) }}
      {{ dayjs(createDate).format('YYYY-MM-DD HH:mm:ss') }}
    </template>
    <template #default>
      <v-md-preview :text="content"></v-md-preview>
    </template>
  </el-card>
</template>
