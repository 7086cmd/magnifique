<script setup lang="ts">
/* global member, member_processed */
import { ref, reactive, watch } from 'vue'
import axios from 'axios'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import baseurl from '../../modules/baseurl'
import personExample from '../../../examples/person'
import sucfuc from '../../modules/sucfuc'
import failfuc from '../../modules/failfuc'
import MemberDescription from '../../components/lists/MemberDescription.vue'
import positions from './positions'
import nProgress from 'nprogress'

nProgress.start()

const { password } = JSON.parse(window.atob(String(localStorage.getItem('adminLoginInfo'))))
let isRegistingMember = ref(false)
let isSubmiting = ref(false)
const information: member = reactive(personExample())
const departments = ref<
  {
    name: string
    value: string
  }[]
>([
  {
    name: '主席团',
    value: '',
  },
])
let types = ref(positions)
let vadmins = ref<
  {
    name: string
    value: string
  }[]
>([])
let search = ref('')
let choice = ref('all')
let table = ref([])
let loading = ref(false)
const panes = ref<
  {
    name: string
    value: string
  }[]
>([
  {
    name: '全部',
    value: 'all',
  },
  {
    name: '核心成员',
    value: 'core',
  },
])
axios(`${baseurl}department/list`).then(response => {
  departments.value.push(...response.data.details)
  panes.value.push(...response.data.details)
})
axios(`${baseurl}power/list`).then(response => {
  vadmins.value.push(...response.data.details)
})
const startToTrue = (number: number) => {
  toTrueDialog.value = true
  toTrueNumber.value = number
}
const refresh = async (type: string) => {
  nProgress.start()
  loading.value = true
  const response = await axios(`${baseurl}admin/get/${type}/member?password=${password}`, {
    method: 'get',
  })
  loading.value = false
  if (response.data.status === 'ok') {
    table.value = response.data.details
  }
  nProgress.done()
}
refresh('all')
watch(choice, () => {
  if (!['core', 'all'].includes(choice.value)) {
    information.union.department = choice.value
  } else {
    information.union.department = ''
  }
  refresh(choice.value)
})
const deletePerson = async (props: { row: member_processed }) => {
  const response = await axios(`${baseurl}admin/del/member`, {
    data: {
      person: props.row.number,
      password,
    },
    method: 'post',
  })
  if (response.data.status === 'ok') {
    sucfuc()
  } else {
    failfuc(response.data.reason, response.data.text)
  }
  refresh(choice.value)
}
const vioPerson = async (props: { row: member_processed }) => {
  const response = await axios(`${baseurl}admin/vio/member`, {
    data: {
      member: props.row.number,
      password,
    },
    method: 'post',
  })
  if (response.data.status === 'ok') {
    sucfuc()
  } else {
    failfuc(response.data.reason, response.data.text)
  }
  refresh(choice.value)
}
let toTrueDo = ref('')
let isRegi = ref(false)
let toTrueNumber = ref(0)
let isFulling = ref(false)
let toTrueDialog = ref(false)
let beTheViceMinisterInTheSameTime = ref(false)
const toTrueIt = () => {
  isRegi.value = false
  isFulling.value = true
  axios(`${baseurl}admin/full/member`, {
    data: {
      password,
      member: toTrueNumber.value,
      position: toTrueDo.value,
    },
    method: 'post',
  }).then(response => {
    if (response.data.status === 'ok') {
      sucfuc()
    } else {
      failfuc(response.data.reason, response.data.text)
    }
    isFulling.value = false
    refresh(choice.value)
    toTrueNumber.value = 0
    toTrueDo.value = 'clerk'
  })
}
const createMember = async () => {
  isSubmiting.value = true
  const createMsg = (msg: string) => {
    ElMessageBox.alert(msg, '失败', {
      center: true,
      type: 'error',
    })
  }
  if (information.number >= 21000000 || information.number <= 20000000) {
    createMsg('不正确的号码')
  } else if (information.name === '') {
    createMsg('不正确的姓名')
  } else if (information.union.department === '' && !information.union.position.includes('chairman')) {
    createMsg('不正确的部门')
  } else if (information.union.position === 'none') {
    createMsg('不正确的职位')
  } else if (information.union.position === 'vice-chairman' && information.union.admin.length === 0) {
    createMsg('不正确的职位')
  } else {
    try {
      information.union.duty = (await axios(`${baseurl}department/${information.union.department}/duty`)).data.details as ('deduction' | 'post' | 'radio' | 'volunteer')[]
    } catch (_e) {
      information.union.duty = []
    }
    if (information.union.duty === undefined) {
      information.union.duty = []
    }
    information.union.leader = information.union.position.includes('chairman') || information.union.position === 'minister'
    if (information.union.position === 'minister') {
      information.union.admin = [...information.union.duty, 'member']
    }
    if (information.union.position === 'chairman') {
      information.union.admin = ['deduction', 'post', 'radio', 'volunteer']
    }
    if (beTheViceMinisterInTheSameTime.value) {
      information.union.admin.push('member-volunteer')
    }
    const response = await axios(`${baseurl}admin/new/member`, {
      data: {
        member: information,
        password,
      },
      method: 'post',
    })
    if (response.data.status === 'ok') {
      sucfuc()
    } else {
      failfuc(response.data.reason, response.data.text)
    }
    information.name = ''
    information.number = 0
    information.union.duty = []
    information.union.admin = []
    information.union.department = ''
    information.union.position = 'clerk'
    isSubmiting.value = false
    refresh(choice.value)
  }
}
</script>

<template>
  <div>
    <h4>成员管理</h4>
    <el-tabs v-model="choice" tab-position="left">
      <el-tab-pane v-for="item in panes" :key="item.value" :label="item.name" :name="item.value">
        <el-skeleton :loading="loading" animated :rows="10" :throttle="500">
          <template #default>
            <el-card shadow="never">
              <template #header>
                <el-button type="text" @click="isRegistingMember = true"> 添加成员 </el-button>
              </template>
              <el-table
                :data="table.filter((data: any) => !search || data.number.toLowerCase().includes(search.toLowerCase()) || String(data.person).toLowerCase().includes(search.toLowerCase()))"
                highlight-current-row
                max-height="480px"
              >
                <el-table-column type="expand">
                  <template #header>
                    <el-button type="text" :icon="Refresh" @click="refresh(choice)" />
                  </template>
                  <template #default="props">
                    <member-description :data="props.row"></member-description>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="姓名" />
                <el-table-column prop="number" label="学号" />
                <el-table-column prop="do" label="职务" />
                <el-table-column align="right" fixed="right">
                  <template #header>
                    <el-input v-model="search" size="mini" placeholder="输入以搜索" />
                  </template>
                  <template #default="props">
                    <div>
                      <el-popconfirm title="确定通报批评吗？该成员的素质分将减少15份。" @confirm="vioPerson(props)">
                        <template #reference>
                          <el-button size="small" type="text"> 通报批评 </el-button>
                        </template>
                      </el-popconfirm>
                      <el-button size="small" type="text" :disabled="props.row.icg" @click="startToTrue(props.row.number)"> 切换身份 </el-button>
                      <el-popconfirm title="确定删除吗？" @confirm="deletePerson(props)">
                        <template #reference>
                          <el-button size="small" type="text"> 删除成员 </el-button>
                        </template>
                      </el-popconfirm>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </template>
        </el-skeleton>
      </el-tab-pane>
    </el-tabs>
    <el-dialog v-model="isRegistingMember" title="注册成员" center>
      <template #header>注册成员</template>
      <el-form v-model="information" title="注册成员">
        <el-form-item label="姓名">
          <el-input v-model="information.name" />
        </el-form-item>
        <el-form-item label="学号">
          <el-input v-model="information.number" />
        </el-form-item>
        <el-form-item label="加入部门">
          <el-select v-model="information.union.department" style="width: 100%">
            <el-option v-for="item in departments" :key="item.value" :label="item.name" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="担任职位">
          <el-select v-model="information.union.position" style="width: 100%">
            <el-option v-for="item in types" :key="item.value" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="information.union.position === 'vice-chairman'" label="管理权力">
          <el-select v-model="information.union.admin" multiple collapse-tags style="width: 100%">
            <el-option v-for="item in vadmins" :key="item.value" :label="item.name" :value="item.value"></el-option>
          </el-select>
          <el-checkbox v-if="information.union.department !== ''" v-model="beTheViceMinisterInTheSameTime" label="在部门内同时担任副部长职务"></el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="isRegistingMember = false"> 取消 </el-button>
          <el-button type="primary" :loading="isSubmiting" @click="createMember"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="toTrueDialog" title="转正信息" center>
      <el-form>
        <el-form-item label="转正学号">
          <el-input v-model="toTrueNumber" disabled></el-input>
        </el-form-item>
        <el-form-item label="担任职位">
          <el-select v-model="toTrueDo" style="width: 100%">
            <el-option v-for="item in types" :key="item.value" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="toTrueDialog = false"> 取消 </el-button>
          <el-button type="primary" :loading="isFulling" @click="toTrueIt()"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
