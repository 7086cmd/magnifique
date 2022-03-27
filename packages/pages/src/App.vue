<script lang="ts" setup>
import { useTitle, useNetwork, useBroadcastChannel } from '@vueuse/core'
import { watch } from 'vue'
const title = useTitle()
title.value = 'Magnifique'
const online = useNetwork().isOnline
const { isSupported, data, post } = useBroadcastChannel({
  name: 'magnifique-window-controller',
})

if (isSupported) {
  watch(data, () => {
    if (data.value === 'connected') {
      window.close()
    }
  })

  post('connected')
}
</script>

<template>
  <div>
    <el-alert v-if="!online" title="连接已断开" description="请检查网络连接" type="error" center show-icon />
    <router-view></router-view>
  </div>
</template>
