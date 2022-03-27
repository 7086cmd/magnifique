<script lang="ts" setup>
/* global WorkflowList */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref, reactive, Ref } from 'vue'
import axios from 'axios'
import { Refresh } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { ElLoading } from 'element-plus'
import baseurl from '../../../modules/baseurl'
import failfuc from '../../../modules/failfuc'
import sucfuc from '../../../modules/sucfuc'

const { number, password } = JSON.parse(window.atob(String(sessionStorage.getItem('memberLoginInfo'))))
let formRef = ref(null)
let isSubmitingNewWorkFlow = ref(false)
let newWorkFlow = ref(false)
let workflows: Ref<any[]> = ref([])
let isFetchingWorkflows = ref(true)
let workflowInformation = reactive({
  title: '',
  description: '',
  deadline: '',
  importance: 0,
  password,
})
let isActing = ref(false)
const statuses = {
  planning: {
    color: 'primary',
    label: '计划中',
  },
  working: {
    color: 'warning',
    label: '实现中',
  },
  success: {
    color: 'success',
    label: '已完成',
  },
  depracted: {
    color: 'error',
    label: '已放弃',
  },
}

const tableRowClassName = ({ row }: { row: WorkflowList & { statusCode: string } }) => {
  return statuses[row.statusCode].color + '-row'
}

const refresh = () => {
  isFetchingWorkflows.value = true
  axios(`${baseurl}member/${number}/workflow/get?password=${password}`).then(response => {
    workflows.value = response.data.details as any[]
    workflows.value.filter((item: any) => {
      item.deadline = dayjs(item.deadline).format('YYYY/MM/DD HH:mm:ss')
      item.start = dayjs(item.start).format('YYYY/MM/DD HH:mm:ss')
      item.statusCode = item.status
      item.status = statuses[item.status].label
    })
    isFetchingWorkflows.value = false
  })
}

refresh()

const newWorkFlowAction = async () => {
  if (workflowInformation.deadline == '') {
    failfuc('无截止日期', '')
  } else if (workflowInformation.title.split('').length >= 20 || workflowInformation.title.split('').length <= 5) {
    failfuc('标题字数不合格，要求5-20个字', '')
  } else {
    isSubmitingNewWorkFlow.value = true
    const response = await axios(`${baseurl}member/${number}/workflow/new`, {
      data: workflowInformation,
      method: 'post',
    })
    isSubmitingNewWorkFlow.value = false
    if (response.data.status == 'ok') {
      sucfuc()
    } else {
      failfuc(response.data.reason, response.data.text)
    }
    newWorkFlow.value = false
    refresh()
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const statusAction = async (props: any, action: string) => {
  // isActing.value = true
  const loadingStatus = ElLoading.service({
    fullscreen: true,
    text: '正在操作中...',
  })
  const response = await axios(`${baseurl}member/${number}/workflow/${action}`, {
    method: 'post',
    data: {
      id: props.row.id,
      password,
    },
  })
  loadingStatus.close()
  if (response.data.status == 'ok') {
    sucfuc()
  } else {
    failfuc(response.data.reason, response.data.text)
  }
  refresh()
}
</script>
<template>
  <div>
    <el-skeleton :loading="isFetchingWorkflows" :rows="4" animated :throttle="500">
      <template #default>
        <el-card shadow="never">
          <el-table :data="workflows" max-height="640px" highlight-current-row :row-class-name="tableRowClassName" style="width: 100%; height: 100%">
            <el-table-column type="expand">
              <template #header><el-button type="text" :icon="Refresh" @click="refresh()"></el-button></template>
              <template #default="props">
                <el-descriptions :title="'工作流' + props.row.id + '信息'" border>
                  <el-descriptions-item label="标题">{{ props.row.title }}</el-descriptions-item>
                  <el-descriptions-item label="说明">{{ props.row.description }}</el-descriptions-item>
                  <el-descriptions-item label="截止日期">{{ props.row.deadline }}</el-descriptions-item>
                  <el-descriptions-item label="状态">{{ props.row.status }}</el-descriptions-item>
                  <el-descriptions-item label="开始日期">{{ props.row.start }}</el-descriptions-item>
                </el-descriptions>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="标题"></el-table-column><el-table-column prop="deadline" label="截止日期"></el-table-column>
            <el-table-column prop="status" label="状态"></el-table-column>
            <el-table-column align="right">
              <template #header><el-button type="text" @click="newWorkFlow = true">新建工作</el-button></template>
              <template #default="props">
                <el-button type="text" :disabled="props.row.statusCode !== 'planning'" @click="statusAction(props, 'start')">开始</el-button>
                <el-button type="text" :disabled="props.row.statusCode !== 'working'" @click="statusAction(props, 'pause')">放下</el-button>
                <el-button type="text" :disabled="props.row.statusCode !== 'working'" @click="statusAction(props, 'finish')">成功</el-button>
                <el-button type="text" :disabled="props.row.statusCode !== 'working'" @click="statusAction(props, 'quit')">放弃</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </template>
    </el-skeleton>
    <el-dialog ref="formRef" v-model="newWorkFlow" v-loading="isActing" title="新建工作" destroy-on-close center width="60%">
      <el-form :model="workflowInformation">
        <el-form-item label="工作标题"><el-input v-model="workflowInformation.title"></el-input></el-form-item>
        <el-form-item label="工作细则"><el-input v-model="workflowInformation.description" type="textarea" :autosize="{ minRows: 6, maxRows: 10 }"></el-input></el-form-item>
        <el-form-item label="截止日期"><el-date-picker v-model="workflowInformation.deadline" type="datetime" style="width: 100%"></el-date-picker></el-form-item>
        <el-form-item label="重要性"><el-input-number v-model="workflowInformation.importance" :min="1" :max="10" style="width: 100%"></el-input-number></el-form-item>
      </el-form>
      <template #footer>
        <span> <el-button @click="newWorkFlow = false">取消</el-button><el-button type="primary" :loading="isSubmitingNewWorkFlow" @click="newWorkFlowAction">确定</el-button> </span>
      </template>
    </el-dialog>
  </div>
</template>

<style>
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
