<script lang="ts" setup>
import { provide, ref } from 'vue'
import { useRouter } from 'vue-router'
import failfuc from '../../modules/failfuc'
import { ElMessageBox } from 'element-plus'
import { createClassLoginer } from '../../modules/auth'
const router = useRouter()
let gradeid = ref('')
let classid = ref(0)
let password = ref('')
const grades = [
  {
    label: '初一',
    value: '1',
  },
  {
    label: '初二',
    value: '2',
  },
  {
    label: '初三',
    value: '3',
  },
]

async function login() {
  if (isNaN(Number(classid.value))) {
    failfuc('输入的不是班级', '')
    return
  }
  createClassLoginer(Number(gradeid.value), Number(classid.value), window.btoa(password.value))
    .then(response => {
      localStorage.setItem('classLoginInfo', response)
      provide('classLoginInfo', response)
      ElMessageBox.alert('成功登录', '成功', {
        center: true,
        type: 'success',
      }).then(() => {
        router.push('/class/')
      })
      setTimeout(() => router.push('/class/'), 3000)
    })
    .catch(() => {
      localStorage.removeItem('classLoginInfo')
    })
}
</script>
<template>
  <transition name="el-zoom-in-top" appear>
    <el-form @submit="login">
      <el-form-item label="年级">
        <el-select id="e2e_tst_class_grade_id" v-model="gradeid" outlined style="width: 100%">
          <el-option v-for="item in grades" :id="'e2e_tst_class_grade_id_' + item.value" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="班级">
        <el-input id="e2e_tst_class_class_id" v-model="classid" outlined style="width: 100%" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input id="e2e_tst_class_password" v-model="password" outlined style="width: 100%" type="password" />
      </el-form-item>
      <el-form-item>
        <el-button id="e2e_tst_class_login_btn" outline plain type="primary" style="width: 100%" @click="login"> 提交 </el-button>
      </el-form-item>
    </el-form>
  </transition>
</template>
