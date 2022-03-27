<script setup lang="ts">
/* global fetcherOptions, DeductionList, member */
import { DeductionFetcher } from './fetcher'
import { defineProps, reactive, ref, watch } from 'vue'
import { Refresh, Box, CirclePlus, DeleteFilled, QuestionFilled as q, Flag } from '@element-plus/icons-vue'
import { ElLoading, ElMessageBox } from 'element-plus'
import sucfuc from '../../../modules/sucfuc'
import failfuc from '../../../modules/failfuc'
import axios from 'axios'
import baseurl from '../../../modules/baseurl'
import { createArrayToObjectTramsformer } from '../../../modules/utils'
import dayjs from 'dayjs'
import DeductionDescription from '../../lists/DeductionDescription.vue'
import toPort from '../../../modules/to-port'

let isClient = ref(false)

try {
  if (window.magnifique.isElectron === true) {
    isClient.value = true
  }
  // eslint-disable-next-line no-empty
} catch (_e) {}
const props = defineProps<{
  password: string
  classid?: number
  gradeid?: number
  number?: number
  type: fetcherOptions['type']
  name?: string
}>()

const fetcher = new DeductionFetcher(props as unknown as fetcherOptions)
let exportTime = ref([])
let isExporting = ref(false)
let exportTypes = ref([
  {
    label: '班级单位',
    value: 'class',
  },
  {
    label: '扣分单位',
    value: 'detail',
  },
])
let isSubmiting = ref(false)
let exportType = ref('')
const createDataAdmin = async () => {
  isSubmiting.value = true
  const response = await axios(`${baseurl}admin/export/deduction/${exportType.value}/`, {
    data: {
      password: props.password,
      start: dayjs(exportTime.value[0]).toJSON(),
      end: dayjs(exportTime.value[1]).toJSON(),
    },
    method: 'post',
  })
  isSubmiting.value = false
  if (response.data.status == 'ok') {
    sucfuc()
    window.open(toPort(`${baseurl}admin/export/download/${response.data.details.token}`), isClient.value ? '_self' : '_blank')
  } else {
    failfuc(response.data.reason, response.data.text)
  }
}

const createDataMember = async () => {
  isSubmiting.value = true
  const response = await axios(`${baseurl}member/admin/export/deduction/${exportType.value}/`, {
    data: {
      password: props.password,
      start: dayjs(exportTime.value[0]).toJSON(),
      end: dayjs(exportTime.value[1]).toJSON(),
      number: props.number,
    },
    method: 'post',
  })
  isSubmiting.value = false
  if (response.data.status == 'ok') {
    sucfuc()
    window.open(toPort(`${baseurl}admin/export/download/${response.data.details.token}`), isClient.value ? '_self' : '_blank')
  } else {
    failfuc(response.data.reason, response.data.text)
  }
}

let deductionData = reactive(fetcher.deductionExample)

let newDeduction = ref(false)
let isFetching = ref(false)

let data = ref<DeductionList[]>([])

const tableRowClassName = (scope: { row: DeductionList }) => {
  const statuses = {
    processing: 'warning-row',
    failed: 'success-row',
    normal: '',
  }
  return statuses[scope.row.status]
}

const fetching = () => {
  isFetching.value = true
  fetcher.get().then(result => (data.value = result.details as DeductionList[]).map(item => (item.time = dayjs(item.time).format('YYYY-MM-DD HH:mm:ss'))))
  isFetching.value = false
}

let typs = ref<string[]>([])
let typicals = ref<string[]>([])
let dets = ref<
  Record<
    string,
    {
      deduction: number
    }
  >
>({})

;(async () => {
  let data1 = (await axios(`${baseurl}member/getinfo/${props.number}/raw`)).data.details as member
  deductionData.deductor.name = data1.name
  deductionData.deductor.number = Number(props.number)
  const result = (await axios(`${baseurl}department/`)).data
  const typesOfDeduction = result.details.departments[data1.union.department].classes as {
    reason: string
    deduction: number
  }[]
  typicals.value = typesOfDeduction.map(item => item.reason) as string[]
  dets.value = createArrayToObjectTramsformer('reason', typesOfDeduction) as Record<
    string,
    {
      deduction: number
    }
  >
})().catch(() => {
  // normal.
})

const turnDown = (prop: { row: DeductionList }) => {
  ElMessageBox.prompt('驳回原因', '驳回', {
    type: 'warning',
    center: true,
    cancelButtonText: '取消',
    confirmButtonText: '确定',
    inputType: 'textarea',
  }).then(async result => {
    const delLoad = ElLoading.service({
      text: '正在驳回，请稍后',
    })
    fetcher
      .decline({
        id: prop.row.id,
        violater: prop.row.person,
        message: result.value,
      })
      .then(result => {
        if (result.status == 'ok') {
          sucfuc()
        } else {
          failfuc(result.reason, result.text)
        }
      })
    delLoad.close()
    fetching()
  })
}

const submitDeduction = async () => {
  let allSuccess = true
  let msgs: string[] = []
  const ded = async () => {
    if (deductionData.person >= 21000000 || deductionData.person <= 10000000) {
      failfuc('学号错误', '')
    } else if (typs.value.length == 0) {
      failfuc('类型错误', '')
    } else if (deductionData.place == '') {
      failfuc('地点错误', '')
    } else if (!dayjs(deductionData.time).isValid()) {
      failfuc('日期错误', '')
    } else {
      isFetching.value = true
      for (let i = 0; i in typs.value; i++) {
        let data = deductionData
        data.reason = typs.value[i]
        data.deduction = dets.value[typs.value[i]].deduction
        data.person = Number(data.person)
        const response = await fetcher.create(data)
        isFetching.value = false
        if (response.status !== 'ok') {
          allSuccess = false
          msgs.push(response.reason)
        }
      }
      if (allSuccess) {
        ElMessageBox.alert('操作成功', '成功', {
          type: 'success',
          center: true,
        })
      } else {
        ElMessageBox.alert(Array.from(new Set(msgs)).join('<br>'), '失败', {
          type: 'error',
          center: true,
          dangerouslyUseHTMLString: true,
        })
      }
      deductionData.person = 0
      deductionData.reason = ''
      deductionData.description = ''
      deductionData.deduction = 0
      deductionData.time = dayjs().format('YYYY/MM/DD HH:mm:ss')
      deductionData.place = ''
      typs.value = []
      fetching()
    }
  }
  if (deductionData.deduction <= 0.3) {
    ded()
  } else {
    ElMessageBox.confirm('扣分数大于0.3分，确定吗', '小心', {
      type: 'warning',
      center: true,
      confirmButtonText: '是的',
      cancelButtonText: '算了',
    })
      .then(() => {
        ded()
      })
      .catch(() => {
        deductionData.person = 0
        deductionData.reason = ''
        deductionData.description = ''
        deductionData.deduction = 0
        deductionData.time = dayjs().format('YYYY/MM/DD HH:mm:ss')
        deductionData.place = ''
        typs.value = []
        fetching()
      })
  }
}
watch(typs, () => {
  let dtotal = 0
  for (let i = 0; i in typs.value; i++) {
    dtotal = Math.floor((dtotal + dets.value[typs.value[i]].deduction) * 100) / 100
  }
  deductionData.deduction = dtotal
})
const deleteDeduction = (prop: { row: DeductionList }) => {
  fetcher
    .delete({
      id: prop.row.id,
      unviolatedPersonNumber: prop.row.person,
    })
    .then(response => {
      if (response.status === 'ok') {
        sucfuc()
      } else {
        failfuc(response.reason, response.text)
      }
    })
}
const callbackDeductions = (inf: DeductionList) => {
  ElMessageBox.prompt('确定要申诉吗？请输入原因。', '申诉', {
    center: true,
    type: 'warning',
    cancelButtonText: '取消',
    confirmButtonText: '确定',
    inputType: 'textarea',
  }).then(result => {
    fetcher
      .callback({
        id: inf.id,
        descriptionMessage: result.value,
      })
      .then(response => {
        if (response.status == 'ok') {
          sucfuc()
          fetching()
        } else {
          failfuc(response.reason, response.text)
        }
      })
  })
}
fetching()
</script>
<template>
  <div>
    <el-skeleton :loading="isFetching" :rows="4" animated :throttle="500">
      <template #default>
        <el-card shadow="never">
          <el-table :data="data" max-height="640px" highlight-current-row :row-class-name="tableRowClassName">
            <el-table-column type="expand">
              <template #header>
                <el-button type="text" :icon="Refresh" size="mini" @click="fetching()"></el-button>
              </template>
              <template #default="proping">
                <deduction-description :data="proping.row" />
              </template>
            </el-table-column>
            <el-table-column prop="person" label="违纪者" />
            <el-table-column prop="deduction" label="扣分数" />
            <el-table-column prop="reason" label="原因" />
            <el-table-column prop="time" label="时间" />
            <el-table-column align="right" fixed="right">
              <template #header>
                <el-button v-if="['admin', 'member_admin'].includes(props.type)" type="text" :icon="Box" size="mini" @click="isExporting = true"></el-button>
                <el-button v-if="props.type === 'member'" type="text" :icon="CirclePlus" @click="newDeduction = true"></el-button>
              </template>
              <template #default="proping">
                <el-button v-if="props.type === 'class'" type="text" :icon="q" size="small" :disabled="proping.row.status == 'processing'" @click="callbackDeductions(proping.row)"></el-button>
                <el-button v-if="props.type === 'member'" type="text" :icon="Flag" size="small" :disabled="proping.row.status !== 'processing'" @click="turnDown(proping)"></el-button>
                <el-popconfirm title="确定删除？" @confirm="deleteDeduction(proping)">
                  <template #reference>
                    <el-button v-if="['admin', 'member_admin', 'member'].includes(props.type)" type="text" :icon="DeleteFilled" size="small" :disabled="proping.row.status === 'failed'"></el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </template>
    </el-skeleton>

    <el-dialog v-model="newDeduction" title="新建扣分" center width="60%">
      <el-form :model="deductionData" label-position="right">
        <el-form-item label="时间">
          <el-date-picker v-model="deductionData.time" type="datetime" style="width: 100%" />
        </el-form-item>
        <el-form-item label="违者">
          <el-input v-model="deductionData.person" />
        </el-form-item>
        <el-form-item label="原因">
          <el-select v-model="typs" style="width: 100%" multiple>
            <el-option v-for="i in typicals" :key="i" :label="i" :value="i"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="扣分">
          <el-input v-model="deductionData.deduction" readonly></el-input>
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="deductionData.place"></el-input>
        </el-form-item>
        <el-form-item label="解释">
          <el-input v-model="deductionData.description" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="newDeduction = false"> 取消 </el-button>
          <el-button type="primary" :loading="isFetching" @click="submitDeduction"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="isExporting" title="导出数据">
      <el-form>
        <el-alert v-if="isClient" :closable="false" title="提醒" description="使用应用导出时是保存形式" type="info" icon="info" center></el-alert>
        <el-alert v-if="!isClient" :closable="false" title="提醒" description="使用浏览器导出时是下载形式" type="info" icon="info" center></el-alert>
        <el-form-item label="时间节点">
          <el-date-picker v-model="exportTime" type="datetimerange" style="width: 100%" range-separator="到" start-placeholder="开始日期" end-placeholder="结束日期"> </el-date-picker>
        </el-form-item>
        <el-form-item label="导出类型">
          <el-select v-model="exportType" style="width: 100%">
            <el-option v-for="item in exportTypes" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span className="dialog-footer">
          <el-button @click="isExporting = false"> 取消 </el-button>
          <el-button v-if="props.type === 'admin'" type="primary" :loading="isSubmiting" @click="createDataAdmin"> 确定 </el-button>
          <el-button v-if="props.type === 'member_admin'" type="primary" :loading="isSubmiting" @click="createDataMember"> 确定 </el-button>
        </span>
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
</style>
