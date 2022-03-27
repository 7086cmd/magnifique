<script lang="ts" setup>
import { ref } from 'vue'
import controls from '../components/controls.vue'
import MemberLogin from './Member/Login.vue'
import ClassLogin from './Class/ClassLogin.vue'
import { useRouter } from 'vue-router'
import AdminLogin from './Admin/Login.vue'
import { useWebNotification } from '@vueuse/core'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const choice = ref('class')

const toTag = (tag: string) => {
  router.push('/' + tag + '/')
}

const supportment = useWebNotification({
  title: '欢迎使用Magnifique',
  dir: 'auto',
  lang: 'zh-cn',
}).isSupported

if (!supportment) {
  ElMessageBox.alert('请开启通知', '未开启通知', {
    center: true,
    type: 'warning',
  })
}
</script>

<template>
  <div className="background_must_be_gray">
    <el-container>
      <el-header style="text-align: right; height: 30%">
        <controls />
      </el-header>
      <el-container>
        <el-aside width="30%"></el-aside>
        <el-main style="padding-top: 15%">
          <!-- <v-md-editor
            v-model="txt"
            height="400px"
            style="text-align: left"
            left-toolbar="undo redo clear | h bold italic emoji strikethrough quote tip | ul ol table hr todo-list | link image code | save"
          ></v-md-editor> -->
          <el-card shadow="never">
            <el-tabs v-model="choice">
              <el-tab-pane name="class" label="班级登录">
                <class-login></class-login>
                <el-button style="width: 100%" plain @click="toTag('class')">已登录</el-button>
              </el-tab-pane>
              <el-tab-pane name="member" label="成员登录">
                <member-login></member-login>
                <el-button style="width: 100%" plain @click="toTag('member')">已登录</el-button>
              </el-tab-pane>
              <el-tab-pane name="admin" label="管理员登录">
                <admin-login></admin-login>
                <el-button style="width: 100%" plain @click="toTag('admin')">已登录</el-button>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-main>
        <el-aside width="30%"> </el-aside>
      </el-container>
    </el-container>
  </div>
</template>
