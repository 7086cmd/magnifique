<script lang="ts" setup>
import { ref } from 'vue'
import NProgress from 'nprogress'
import axios from 'axios'
import baseurl from '../../modules/baseurl'
import MemberDescription from '../../components/lists/MemberDescription.vue'

NProgress.start()

const { number } = JSON.parse(window.atob(String(sessionStorage.getItem('memberLoginInfo'))))
const name = ref('')
const score = ref(0)
let col = ref('success')
let actions = ref(0)
let violation = ref(0)
let department = ref('')
let whatdo = ref('')
let aboutme = ref({})
let loaded = ref(false)

axios(`${baseurl}member/getinfo/${number}/`).then(response => {
  aboutme.value = response.data.details
  loaded.value = true
  name.value = response.data.details.name
  let total = response.data.details.record.score
  actions.value = response.data.details.record.actions
  violation.value = response.data.details.record.violation
  department.value = response.data.details.in
  whatdo.value = response.data.details.do
  NProgress.done()
  let itv = setInterval(() => {
    score.value++
    if (score.value >= 80) {
      col.value = 'success'
    } else if (score.value >= 60 && score.value < 80) {
      col.value = 'warning'
    } else if (score.value < 60) {
      col.value = 'exception'
    }
    if (score.value >= total) {
      clearInterval(itv)
    }
  }, 8)
})
</script>
<template>
  <div>
    <h3>仪表盘</h3>
    <el-divider>{{ whatdo }} {{ name }}</el-divider>
    <el-row :gutter="8">
      <el-col :span="10">
        <el-card class="box-card" shadow="never">
          <el-progress type="dashboard" :percentage="score" :status="col">
            <template #default="{ percentage }">
              <span className="percentage-value">{{ percentage }}</span>
              <span className="percentage-label">素质分</span>
            </template>
          </el-progress>
        </el-card>
      </el-col>
      <el-col :span="7">
        <el-card class="box-card" shadow="never">
          <span className="percentage-value-2">{{ actions }}</span>
          <span className="percentage-label-2">操作</span>
        </el-card>
      </el-col>
      <el-col :span="7">
        <el-card class="box-card" shadow="never">
          <template #default>
            <span className="percentage-value-2">{{ violation }}</span>
            <span className="percentage-label-2">违纪</span>
          </template>
        </el-card>
      </el-col>
    </el-row>
    <el-divider>{{ whatdo }} {{ name }}</el-divider>
    <el-card v-if="loaded" shadow="never" class="box-card">
      <member-description :data="aboutme" />
    </el-card>
  </div>
</template>

<style>
.percentage-value {
  display: block;
  margin-top: 10px;
  font-size: 28px;
}

.percentage-label {
  display: block;
  margin-top: 10px;
  font-size: 12px;
}
.percentage-value-2 {
  display: block;
  margin-top: 10px;
  font-size: 56px;
}
.percentage-label-2 {
  display: block;
  margin-top: 12px;
  font-size: 18px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-lighter);
}
.el-table .error-row {
  --el-table-tr-bg-color: var(--el-color-error-lighter);
}
.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-lighter);
}
.el-table .primary-row {
  --el-table-tr-bg-color: var(--el-color-primary-lighter);
}
</style>
