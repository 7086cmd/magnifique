<script setup lang="ts">
/* global VolunteerCombo */
import { defineProps, ref, toRefs, unref } from 'vue'
import dayjs from 'dayjs'

const props = defineProps<{
  data: VolunteerCombo
}>()

const status = {
  done: 'success',
  planning: 'warning',
  miss: 'error',
}

const { data } = toRefs(props)

const detail = ref(unref(data) as VolunteerCombo)
</script>
<template>
  <div>
    <el-descriptions :title="'义工信息'" border>
      <el-descriptions-item label="义工参与者">
        <div v-if="['number', 'string'].includes(typeof detail.person)">
          <el-tag :type="status[detail.status]" v-text="detail.person" />
        </div>
        <div v-else>
          <el-tag v-for="item in detail.records" :key="item" :type="status[item.status]" v-text="item.person" />
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="义工时长">
        <el-tag type="" v-text="detail.duration + '小时'" />
      </el-descriptions-item>
      <el-descriptions-item label="义工项目">
        <el-tag v-text="detail.project" />
      </el-descriptions-item>
      <el-descriptions-item label="义工地点">
        {{ detail.place }}
      </el-descriptions-item>
      <el-descriptions-item label="时间">
        {{ dayjs(detail.time).format('YYYY-MM-DD HH:mm:ss') }}
      </el-descriptions-item>
    </el-descriptions>
    义工编号：<el-tag type="info">{{ detail.idInUserData }}</el-tag> <br />义工登记编号：<el-tag type="info">{{ detail.createId }}</el-tag>
  </div>
</template>
