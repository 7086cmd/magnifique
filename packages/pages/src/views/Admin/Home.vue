<script lang="ts" setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import baseurl from '../../modules/baseurl'
import { UserFilled as User, List, Back, Box, HomeFilled } from '@element-plus/icons-vue'
import ControlsPage from '../../components/controls-page.vue'
const router = useRouter()
const leftDrawerOpen = ref(true)
let pageSelected = ref('1')

if (localStorage.getItem('adminLoginInfo') == undefined) {
  if (inject('adminLoginInfo') == undefined) {
    router.push('/')
  }
}
try {
  window.atob(String(localStorage.getItem('adminLoginInfo')))
} catch (e) {
  router.push('/')
  localStorage.removeItem('adminLoginInfo')
}

const { password } = JSON.parse(window.atob(String(localStorage.getItem('adminLoginInfo'))))

axios({
  url: `${baseurl}admin/login?password=${password}`,
  data: {
    password: password,
  },
  method: 'get',
}).then(response => {
  if (response.data.status !== 'ok') {
    localStorage.removeItem('adminLoginInfo')
    router.push('/admin/login')
  }
})
</script>
<template>
  <el-container>
    <el-aside width="12%">
      <el-menu v-model="pageSelected" default-active="/admin/" :collapse="leftDrawerOpen" style="min-height: 1024px; padding-top: 2em" collapse-transition router>
        <el-menu-item index="/">
          <el-icon>
            <Back />
          </el-icon>
          <template #title> 返回主页 </template>
        </el-menu-item>
        <el-menu-item index="/admin/">
          <el-icon>
            <HomeFilled />
          </el-icon>
          <template #title> 主页 </template>
        </el-menu-item>
        <el-menu-item index="/admin/data/">
          <el-icon>
            <List />
          </el-icon>
          <template #title> 数据管理 </template>
        </el-menu-item>
        <el-menu-item index="/admin/member/">
          <el-icon>
            <User />
          </el-icon>
          <template #title> 成员管理 </template>
        </el-menu-item>
        <el-menu-item index="/admin/message/">
          <el-icon>
            <Box />
          </el-icon>
          <template #title> 消息中心 </template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="text-align: right">
        <controls-page type="admin" />
      </el-header>
      <el-main>
        <router-view v-slot="{ Component }">
          <transition name="fade">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
