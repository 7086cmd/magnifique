<script lang="ts" setup>
/* global VolunteerList */
import { ref, reactive } from 'vue'
import axios from 'axios'
import { Refresh } from '@element-plus/icons-vue'
import baseurl from '../../../modules/baseurl'
import volunteerExample from '../../../../examples/volunteer'
import failfuc from '../../../modules/failfuc'
import sucfuc from '../../../modules/sucfuc'
import VolunteerDescription from '../../../components/lists/VolunteerDescription.vue'
import dayjs from 'dayjs'
import { v4 } from 'uuid'

const { number, password } = JSON.parse(window.atob(String(sessionStorage.getItem('memberLoginInfo'))))
let isSubmiting = ref(false)
let isRegistingVolunteer = ref(false)
let volunteerData = reactive(volunteerExample())
volunteerData.status = 'planning'
volunteerData.person = number
let loading = ref(true)
let volunteerDetail = ref([])
const refresh = () => {
  loading.value = true
  axios(`${baseurl}member/${number}/volunteer/get?password=${password}`).then(response => {
    loading.value = false
    if (response.data.status == 'ok') {
      volunteerDetail.value = response.data.details as VolunteerList[]
    }
  })
}
refresh()
const createRegistry = async () => {
  if (volunteerData.project === '') {
    failfuc('没有输入义工项目名称', '')
  } else if (volunteerData.place == '') {
    failfuc('没有输入地点', '')
  } else if (!dayjs(volunteerData.time).isValid()) {
    failfuc('时间输入不正确', '')
  } else {
    isSubmiting.value = true
    const response = await axios(`${baseurl}member/${number}/volunteer/create`, {
      data: {
        volunteer: volunteerData,
        password,
        number,
      },
      method: 'post',
    })
    isSubmiting.value = false
    if (response.data.status == 'ok') {
      sucfuc()
      volunteerData.time = dayjs().toJSON()
      volunteerData.createId = v4()
      volunteerData.person = []
      volunteerData.project = ''
      volunteerData.place = ''
      refresh()
    } else {
      failfuc(response.data.reason, response.data.text)
    }
  }
}
</script>
<template>
  <transition name="el-fade-in" appear>
    <div>
      <el-skeleton :loading="loading" animated :rows="10" :throttle="500">
        <template #default>
          <el-card shadow="never">
            <el-table :data="volunteerDetail" highlight-current-row max-height="480px">
              <el-table-column type="expand">
                <template #header>
                  <el-button type="text" :icon="Refresh" @click="refresh()" />
                </template>
                <template #default="props">
                  <volunteer-description :data="props.row" />
                </template>
              </el-table-column>
              <el-table-column label="参与者">
                <template #default="props">
                  <el-tag v-if="['number', 'string'].includes(typeof props.row.person)" type="success" v-text="props.row.person" />
                  <el-tag v-for="item in props.row.person" v-else :key="item" type="success" v-text="item" />
                </template>
              </el-table-column>
              <el-table-column prop="project" label="义工项目" />
              <el-table-column label="义工时长">
                <template #default="props"> {{ props.row.duration }}小时 </template>
              </el-table-column>
              <el-table-column label="登记状态">
                <template #default="props">
                  <el-tag v-if="props.row.status === 'done'" type="success">已完成</el-tag>
                  <el-tag v-else-if="props.row.status === 'planning'" type="warning">计划中</el-tag>
                  <el-tag v-else type="error">已错过</el-tag>
                </template>
              </el-table-column>
              <el-table-column align="right" fixed="right">
                <template #header>
                  <el-button type="text" @click="isRegistingVolunteer = true"> 义工登记 </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </template>
      </el-skeleton>
      <el-dialog v-model="isRegistingVolunteer" title="义工登记" center>
        <template #header>义工登记</template>
        <el-form v-model="volunteerData" title="义工登记">
          <el-form-item label="义工时间">
            <el-date-picker v-model="volunteerData.time" type="datetime" style="width: 100%" />
          </el-form-item>
          <el-form-item label="义工项目">
            <el-input v-model="volunteerData.project"></el-input>
          </el-form-item>
          <el-form-item label="义工地点">
            <el-input v-model="volunteerData.place" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }"></el-input>
          </el-form-item>
          <el-form-item label="义工时长">
            <el-slider v-model="volunteerData.duration" :step="0.5" :min="0" :max="3"></el-slider>
            <!-- 一次登记不得超过3小时 -->
            <el-input-number v-model="volunteerData.duration" style="width: 100%" :step="0.5" />
          </el-form-item>
          <el-form-item label="创建ID">
            <el-input v-model="volunteerData.createId" readonly></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span>
            <el-button @click="isRegistingVolunteer = false"> 取消 </el-button>
            <el-button type="primary" :loading="isSubmiting" @click="createRegistry"> 确定 </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </transition>
</template>

<style>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-lighter);
}
.el-table .error-row {
  --el-table-tr-bg-color: var(--el-color-error-lighter);
}
.class-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
