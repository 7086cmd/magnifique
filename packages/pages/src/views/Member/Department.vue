<script setup lang="ts">
/* global member */
import { ref } from 'vue'
import axios from 'axios'
import baseurl from '../../modules/baseurl'
import volunteerPage from './departments/volunteer.vue'
import WorkFlowPage from './departments/WorkFlow.vue'
import personExample from '../../../examples/person'
import DeductionPage from '../../components/powers/deduction/deduction.vue'
import PostPage from '../../components/powers/post/post.vue'
import NProgress from 'nprogress'
const { number, password } = JSON.parse(window.atob(String(sessionStorage.getItem('memberLoginInfo'))))
let choice = ref('member')
let me = ref<member>(personExample())
axios(`${baseurl}member/getinfo/${number}/raw`).then(response => {
  me.value = response.data.details as member
  NProgress.done()
})
</script>

<template>
  <div>
    <el-tabs v-model="choice" tab-position="left">
      <el-tab-pane label="工作流" name="workflow">
        <work-flow-page />
      </el-tab-pane>
      <el-tab-pane label="义工" name="volunteer">
        <volunteer-page />
      </el-tab-pane>
      <el-tab-pane v-if="me.union.duty.includes('deduction')" label="扣分" name="deduction">
        <deduction-page type="member" :number="number" :password="password" />
      </el-tab-pane>
      <el-tab-pane label="投稿" name="post">
        <post-page type="member" :number="number" :password="password" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
