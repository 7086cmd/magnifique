<script lang="ts" setup>
import { useTitle, useNetwork, useBroadcastChannel } from '@vueuse/core'
import axios from 'axios'
import { ref, watch } from 'vue'
import baseurl from './modules/baseurl'
import { createSocketIO } from './modules/subscription/socket.io'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import nProgress from 'nprogress'

const router = useRouter()

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

if ('classLoginInfo' in window.localStorage) {
  ElNotification({
    title: '已检测到班级登录信息，正在验证',
    type: 'info',
  })
  const { gradeid, classid, password } = JSON.parse(window.atob(String(localStorage.getItem('classLoginInfo'))))
  axios(`${baseurl}class/${gradeid}/${classid}/login?password=${password}`).then(response => {
    if (response.data.status !== 'ok') {
      ElNotification({
        title: '班级登录信息出现问题，无法正常连接到服务器，请登陆后重新加载。',
        type: 'error',
      })
      localStorage.removeItem('classLoginInfo')
    } else {
      ElNotification({
        title: '班级登录信息正确，正在尝试连接到服务器',
        type: 'warning',
      })
      const id = ref('class/' + gradeid + '/' + classid)
      nProgress.start()
      createSocketIO(
        {
          username: id.value,
          password,
          contents: ['message'],
        },
        router
      )
      nProgress.done()
    }
  })
}
</script>

<template>
  <div>
    <el-alert v-if="!online" title="连接已断开" description="请检查网络连接" type="error" center show-icon />
    <router-view></router-view>
  </div>
</template>
