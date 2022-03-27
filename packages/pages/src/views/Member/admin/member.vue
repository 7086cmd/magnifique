<script setup lang="ts">
/* global member, member_processed */
import { ref, reactive } from 'vue'
import axios from 'axios'
import { Refresh } from '@element-plus/icons-vue'
import baseurl from '../../../modules/baseurl'
import personExample from '../../../../examples/person'
import sucfuc from '../../../modules/sucfuc'
import failfuc from '../../../modules/failfuc'
import { ElLoading } from 'element-plus'
import MemberDescription from '../../../components/lists/MemberDescription.vue'

const loader = ElLoading.service({
  text: '获取信息中...',
})

const { password, number } = JSON.parse(window.atob(String(sessionStorage.getItem('memberLoginInfo'))))

let aboutme = ref<member>(personExample())

const information: member = reactive(personExample())
axios(`${baseurl}member/getinfo/${number}/raw`).then(response => {
  aboutme.value = response.data.details as member
  refresh()
  information.union.department = aboutme.value.union.department
})
let isRegistingMember = ref(false)
let isSubmiting = ref(false)
const departments = ref<
  {
    name: string
    value: string
  }[]
>([])
let types = ref([
  {
    name: '干事',
    value: 'clerk',
  },
  {
    name: '副部长',
    value: 'vice-minister',
  },
])
let vadmins = ref<
  {
    name: string
    value: string
  }[]
>([])
let search = ref('')
let table = ref([])
let loading = ref(false)
axios(`${baseurl}department/list`).then(response => {
  departments.value.push(...response.data.details)
})
axios(`${baseurl}power/list`).then(response => {
  vadmins.value.push(...response.data.details)
})
const startToTrue = (number: number) => {
  toTrueDialog.value = true
  toTrueNumber.value = number
}
async function refresh() {
  loading.value = true
  axios(`${baseurl}member/admin/${number}/get/${aboutme.value.union.department}/member`, {
    params: {
      password,
    },
    method: 'get',
  }).then(response => {
    loading.value = false
    if (response.data.status === 'ok') {
      table.value = response.data.details
    }
    loader.close()
  })
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deletePerson = async (props: { row: member_processed }) => {
  const response = await axios(`${baseurl}member/admin/del/member`, {
    data: {
      person: props.row.number,
      number,
      password,
    },
    method: 'post',
  })
  if (response.data.status === 'ok') {
    sucfuc()
  } else {
    failfuc(response.data.reason, response.data.text)
  }
  refresh()
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vioPerson = async (props: { row: member_processed }) => {
  const response = await axios(`${baseurl}member/admin/vio/member`, {
    data: {
      person: props.row.number,
      number,
      password,
    },
    method: 'post',
  })
  if (response.data.status === 'ok') {
    sucfuc()
  } else {
    failfuc(response.data.reason, response.data.text)
  }
  refresh()
}
let toTrueDo = ref('')
let isRegi = ref(false)
let toTrueNumber = ref(0)
let isFulling = ref(false)
let toTrueDialog = ref(false)
const toTrueIt = () => {
  isRegi.value = false
  isFulling.value = true
  axios(`${baseurl}member/admin/trans/member`, {
    data: {
      password,
      member: toTrueNumber.value,
      position: toTrueDo.value,
      number,
    },
    method: 'post',
  }).then(response => {
    if (response.data.status === 'ok') {
      sucfuc()
    } else {
      failfuc(response.data.reason, response.data.text)
    }
    isFulling.value = false
    refresh()
    toTrueNumber.value = 0
    toTrueDo.value = 'clerk'
  })
}
const createMember = async () => {
  isSubmiting.value = true
  if (information.number >= 21000000 || information.number <= 20000000) {
    failfuc('不正确的号码', '')
  } else if (information.name === '') {
    failfuc('不正确的姓名', '')
  } else if (!['clerk', 'vice-minister'].includes(information.union.position)) {
    failfuc('不正确的职位', '')
  } else {
    try {
      information.union.duty = (await axios(`${baseurl}department/${information.union.department}/duty`)).data.details as ('deduction' | 'post' | 'radio' | 'volunteer')[]
    } catch (_e) {
      information.union.duty = []
    }
    information.union.leader = information.union.position.includes('chairman') || information.union.position === 'minister'
    const response = await axios(`${baseurl}member/admin/new/member`, {
      data: {
        member: information,
        password,
        number,
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
    information.union.position = 'clerk'
    isSubmiting.value = false
    refresh()
  }
}
</script>

<template>
  <div>
    <el-skeleton :loading="loading" animated :rows="10" :throttle="500">
      <template #default>
        <el-card shadow="never">
          <template #header>
            <el-button type="text" @click="isRegistingMember = true"> 添加成员 </el-button>
          </template>
          <el-table
            :data="table.filter((data: any) => !search || data.number.toLowerCase().includes(search.toLowerCase()) || String(data.person).toLowerCase().includes(search.toLowerCase()))"
            max-height="480px"
            :item-per-age="10"
            :current="1"
          >
            <el-table-column type="expand">
              <template #header>
                <el-button type="text" :icon="Refresh" @click="refresh()" />
              </template>
              <template #default="props">
                <member-description :data="(props.row as member_processed)" />
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
                  <el-popconfirm title="确定通报吗？该成员的素质分将减少15份。" @confirm="vioPerson(props)">
                    <template #reference>
                      <el-button size="small" type="text"> 通报批评 </el-button>
                    </template>
                  </el-popconfirm>
                  <el-button size="small" type="text" :disabled="props.row.icg" @click="startToTrue(props.row.number)"> 切换身份 </el-button>
                  <el-popconfirm title="确定删除吗？" @confirm="deletePerson(props)">
                    <template #reference>
                      <el-button size="small" type="text" :disabled="props.row.icg"> 删除成员 </el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </template>
    </el-skeleton>
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
          <el-select v-model="information.union.department" disabled style="width: 100%">
            <el-option v-for="item in departments" :key="item.value" :label="item.name" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="担任职位">
          <el-select v-model="information.union.position" style="width: 100%">
            <el-option v-for="item in types" :key="item.value" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="isRegistingMember = false"> 取消 </el-button>
          <el-button type="primary" :loading="isSubmiting" @click="createMember"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="toTrueDialog" title="信息" center>
      <el-form>
        <el-form-item label="学号">
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
