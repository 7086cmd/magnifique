<script setup lang="ts">
/* global member */
import { ref } from 'vue'
import axios from 'axios'
import baseurl from '../../../modules/baseurl'
import MemberPage from './member.vue'
import DeductionPage from '../../../components/powers/deduction/deduction.vue'
import PostPage from '../../../components/powers/post/post.vue'
import VolunteerPage from './volunteer.vue'
import personExample from '../../../../examples/person'
import nProgress from 'nprogress'
const { number, password } = JSON.parse(window.atob(String(sessionStorage.getItem('memberLoginInfo'))))
let choice = ref('')
let got = ref(false)
let me = ref<member>(personExample())
nProgress.start()
axios(`${baseurl}member/getinfo/${number}/raw`).then(response => {
  me.value = response.data.details as member
  got.value = true
  nProgress.done()
})
</script>

<template>
  <div>
    <el-tabs v-model="choice" tab-position="left">
      <el-tab-pane v-if="['minister'].includes(me.union.position)" label="成员" name="member">
        <member-page />
      </el-tab-pane>
      <el-tab-pane v-if="me.union.admin.includes('deduction')" label="扣分" name="deduction">
        <deduction-page type="member_admin" :number="number" :password="password" />
      </el-tab-pane>
      <el-tab-pane v-if="me.union.admin.includes('post')" label="稿件" name="post">
        <post-page type="member_admin" :number="number" :password="password" />
      </el-tab-pane>
      <el-tab-pane v-if="['vice-minister', 'minister'].includes(me.union.position) || me.union.admin.includes('member-volunteer')" label="成员义工" name="member-volunteer">
        <volunteer-page type="member" />
      </el-tab-pane>
      <el-tab-pane v-if="me.union.admin.includes('volunteer')" label="义工" name="volunteer">
        <volunteer-page type="volunteer" />
      </el-tab-pane>
    </el-tabs>
    <el-card v-if="!me.union.position.includes('minister') && !me.union.position.includes('chairman') && got" shadow="never">
      <el-result icon="error" title="不可使用" sub-title="不具有管理权限" />
    </el-card>
  </div>
</template>
