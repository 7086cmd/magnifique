<script lang="ts" setup>
import { ref } from 'vue'
import { Close, Minus, Plus } from '@element-plus/icons-vue'
import { hideWindow, minWindow, maxWindow } from '../tauri'

let isClient = ref(false)
try {
  if (window.magnifique.isElectron === true) {
    isClient.value = true
  }
  // eslint-disable-next-line no-empty
} catch (_e) {}

const closeServer = () => {
  isClient.value && window.magnifique.closeServer()
  hideWindow()
}
const minServerWindow = () => {
  isClient.value && window.magnifique.minServerWindow()
  minWindow()
}
const maxServerWindow = () => {
  isClient.value && window.magnifique.maxServerWindow()
  maxWindow()
}
</script>
<template>
  <div>
    <div style="text-align: right">
      <el-button style="text-align: right" :icon="Minus" type="warning" circle plain size="default" @click="minServerWindow()"> </el-button>
      <el-button style="text-align: right" :icon="Plus" type="success" circle plain size="default" @click="maxServerWindow()"> </el-button>
      <el-button style="text-align: right" :icon="Close" type="danger" circle plain size="default" @click="closeServer()"> </el-button>
    </div>
  </div>
</template>
