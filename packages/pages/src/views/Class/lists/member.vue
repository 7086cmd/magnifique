<script lang="ts" setup>
import { ref, reactive } from 'vue'
import axios from 'axios'
import { Refresh } from '@element-plus/icons-vue'
import baseurl from '../../../modules/baseurl'
import personExample from '../../../../examples/person'
import failfuc from '../../../modules/failfuc'
import sucfuc from '../../../modules/sucfuc'
import MemberDescription from '../../../components/lists/MemberDescription.vue'
import createYearTransformer from '../../../modules/utils/transform-date'

const { gradeid, classid, password } = JSON.parse(window.atob(String(localStorage.getItem('classLoginInfo'))))
let basicnum = ref(0)
;(async () => {
  basicnum.value = createYearTransformer(gradeid) * 100 + classid
})()
let isSubmiting = ref(false)
let isRegistingMember = ref(false)
let memberifo = reactive(personExample())
memberifo.union.position = 'registry'
let departments = ref<
  {
    name: string
    value: string
  }[]
>([])
let considerations = ref<string[]>([])
axios(`${baseurl}department/list`).then(response => {
  departments.value.push(...response.data.details)
})
let loading = ref(true)
let membersDetail = ref([])
const refresh = () => {
  loading.value = true
  axios(`${baseurl}class/${gradeid}/${classid}/member/get?password=${password}`).then(response => {
    loading.value = false
    if (response.data.status == 'ok') {
      membersDetail.value = response.data.details
    }
  })
}
refresh()
const createRegistry = async () => {
  if (memberifo.name == '') {
    failfuc('没有输入姓名', '')
  } else if (memberifo.number <= 0 || memberifo.number >= 100) {
    failfuc('没有输入学号 或者学号输入错误', '')
  } else if (memberifo.union.department == '') {
    failfuc('没有输入想要进入的部门', '')
  } else if (memberifo.union.regist.position == '') {
    failfuc('没有输入个人介绍', '')
  } else if (memberifo.union.regist.plan == '') {
    failfuc('没有输入工作计划', '')
  } else {
    try {
      memberifo.union.duty = (await axios(`${baseurl}department/${memberifo.union.department}/duty`)).data.details as ('deduction' | 'post' | 'radio' | 'volunteer')[]
    } catch (_e) {
      memberifo.union.duty = []
    }
    memberifo.union.leader = memberifo.union.position.includes('chairman') || memberifo.union.position === 'minister'
    memberifo.number = basicnum.value + memberifo.number
    isSubmiting.value = true
    const response = await axios(`${baseurl}class/member/regist`, {
      data: {
        member: memberifo,
        password,
        gradeid,
        classid,
      },
      method: 'post',
    })
    isSubmiting.value = false
    if (response.data.status == 'ok') {
      sucfuc()
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
            <el-table :data="membersDetail" highlight-current-row max-height="480px">
              <el-table-column type="expand">
                <template #header>
                  <el-button type="text" :icon="Refresh" @click="refresh()" />
                </template>
                <template #default="props">
                  <member-description :data="props.row" />
                </template>
              </el-table-column>
              <el-table-column prop="name" label="姓名" />
              <el-table-column prop="number" label="学号" />
              <el-table-column prop="do" label="职务" />
              <el-table-column align="right" fixed="right">
                <template #header>
                  <el-button type="text" @click="isRegistingMember = true"> 注册成员 </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </template>
      </el-skeleton>
      <el-dialog v-model="isRegistingMember" title="注册成员" center>
        <template #header>注册成员</template>
        <el-form v-model="memberifo" title="注册成员">
          <el-form-item label="姓名">
            <el-input v-model="memberifo.name"></el-input>
          </el-form-item>
          <el-form-item label="学号">
            <el-input v-model="memberifo.number">
              <template #prepend>{{ basicnum }}</template>
            </el-input>
          </el-form-item>
          <el-form-item label="加入部门">
            <el-select v-model="memberifo.union.department" style="width: 100%">
              <el-option v-for="item in departments" :key="item.value" :label="item.name" :value="item.value"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="现任职务">
            <el-input v-model="memberifo.union.regist.position"></el-input>
          </el-form-item>
          <el-form-item label="自我介绍">
            <el-input v-model="memberifo.union.regist.introduce" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }"></el-input>
          </el-form-item>
          <el-form-item label="发展计划">
            <el-input v-model="memberifo.union.regist.plan" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }"></el-input>
          </el-form-item>
          <el-form-item label="荣获奖项">
            <el-input v-model="memberifo.union.regist.prize" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }"></el-input>
          </el-form-item>
          <el-form-item label="声明">
            <el-checkbox-group v-model="considerations">
              <el-checkbox label="我愿意加入学生会/团总支，愿意为此做出努力。" /> <br />
              <el-checkbox label="我愿意遵守学生会/团总支的纪律，积极履行责任，不滥用权力。" /> <br />
              <el-checkbox label="我愿意通过自己的努力为学校做出奉献。" />
            </el-checkbox-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <span>
            <el-button @click="isRegistingMember = false"> 取消 </el-button>
            <el-button type="primary" :disabled="considerations.length !== 3" :loading="isSubmiting" @click="createRegistry"> 确定 </el-button>
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
