<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import baseurl from '../../modules/baseurl'
import { List, Back, Box, Odometer, Magnet } from '@element-plus/icons-vue'
import ControlsPage from '../../components/controls-page.vue'
import { ElMessageBox } from 'element-plus'

let heightClient = ref(window.innerHeight)

const router = useRouter()
let pageSelected = ref('1')
let name = ref('')
try {
  window.atob(String(sessionStorage.getItem('memberLoginInfo')))
} catch (e) {
  router.push('/')
  sessionStorage.removeItem('memberLoginInfo')
}

const { number, password } = JSON.parse(window.atob(String(sessionStorage.getItem('memberLoginInfo'))))

axios(`${baseurl}member/getinfo/${number}/`).then(response => {
  name.value = response.data.details.name
})

axios(`${baseurl}member/${number}/login?password=${password}`).then(response => {
  if (response.data.status !== 'ok') {
    sessionStorage.removeItem('memberLoginInfo')
    ElMessageBox.alert('您的密码有误，已为您引导到班级界面，点击“成员登录”即可再次登录。', '密码错误', {
      type: 'error',
      center: true,
    })
    router.push('/')
  }
})
</script>
<template>
  <el-container>
    <el-aside width="12%">
      <el-menu v-model="pageSelected" default-active="/member/" :collapse="true" style="min-height: 1024px; padding-top: 2em" collapse-transition router>
        <el-menu-item index="/">
          <el-icon>
            <Back />
          </el-icon>
          <template #title> 返回主页 </template>
        </el-menu-item>
        <el-menu-item index="/member/">
          <el-icon>
            <Odometer />
          </el-icon>
          <template #title> 仪表盘 </template>
        </el-menu-item>
        <el-menu-item index="/member/department/">
          <el-icon>
            <List />
          </el-icon>
          <template #title> 数据处理 </template>
        </el-menu-item>
        <el-menu-item index="/member/admin/">
          <el-icon>
            <Magnet />
          </el-icon>
          <template #title> 管理 </template>
        </el-menu-item>
        <el-menu-item index="/member/message/">
          <el-icon>
            <Box />
          </el-icon>
          <template #title> 消息中心 </template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="text-align: right">
        <el-affix :offset="20">
          <controls-page type="member" :number="number" :name="name" />
        </el-affix>
      </el-header>

      <el-main>
        <el-scrollbar always :height="Math.floor((heightClient * 4) / 5)">
          <router-view v-slot="{ Component }">
            <el-scrollbar always>
              <transition name="fade">
                <el-scrollbar always>
                  <component :is="Component" />
                </el-scrollbar>
              </transition>
            </el-scrollbar>
          </router-view>
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>
</template>
