<script setup lang="ts">
/* global DeductionList */
import { defineProps, ref, toRefs, unref } from 'vue'

const fbstatus = {
  normal: '未申诉',
  processing: '未处理',
  failed: '申诉失败',
}

const props = defineProps<{
  data: DeductionList
}>()

const { data } = toRefs(props)

const detail = ref(unref(data) as DeductionList)

const getColor = (deduction: number) => {
  if (deduction * 100 === 0) {
    return 'success'
  } else if (deduction * 100 === 5) {
    return 'info'
  } else if (deduction * 100 === 10) {
    return 'warning'
  } else if (deduction * 100 === 20) {
    return 'error'
  }
}
</script>
<template>
  <div>
    <el-descriptions :title="'扣分信息'" border>
      <el-descriptions-item label="违纪者">
        <el-tag type="warning" v-text="detail.person" />
      </el-descriptions-item>
      <el-descriptions-item label="扣分数">
        <el-tag :type="getColor(detail.deduction)" v-text="detail.deduction" />
      </el-descriptions-item>
      <el-descriptions-item label="原因">
        <el-tag v-text="detail.reason" />
      </el-descriptions-item>
      <el-descriptions-item label="地点">
        <el-tag v-text="detail.place" />
      </el-descriptions-item>
      <el-descriptions-item label="时间">
        {{ detail.time }}
      </el-descriptions-item>
      <el-descriptions-item label="扣分者">
        <el-tag type="info" v-text="detail.deductor.name" />
      </el-descriptions-item>
      <el-descriptions-item label="解释说明">
        {{ detail.description }}
      </el-descriptions-item>
      <el-descriptions-item label="申诉状态">{{ fbstatus[detail.status] }}</el-descriptions-item>
    </el-descriptions>
    <div style="font-size: 14px">
      <span>扣分编号: <el-tag type="info" v-text="data.id"></el-tag></span>
      <p v-if="data.status !== 'normal'">申诉原因：<markdown :content="detail.msgs.feedback" /></p>
      <br />
      <p v-if="data.status === 'failed'">驳回原因：<markdown :content="detail.msgs.turndown" /></p>
    </div>
  </div>
</template>
