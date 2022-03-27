<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/max-attributes-per-line -->
<script lang="ts" setup>
/* global member_processed */
import { ref, watch } from 'vue'
import axios from 'axios'
import { ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import baseurl from '../../modules/baseurl'
import getData from '../../components/get-data'
import { encode } from '../../components/record-data'
import failfuc from '../../modules/failfuc'

let isClient = ref(false)

try {
  if (window.magnifique.isElectron === true) {
    isClient.value = true
  }
  // eslint-disable-next-line no-empty
} catch (_e) {}
const router = useRouter()

let number = ref('')
let password = ref('')
let name = ref('')
let duty = ref('')
watch(number, () => {
  duty.value = ''
  if (number.value.split('').length === 8) {
    axios({
      url: `${baseurl}member/getinfo/${number.value}/`,
    }).then(response => {
      const data = response.data.details as member_processed
      name.value = data.name
      duty.value = data.do
      if (data.do === '非正式成员') {
        name.value = '非正式成员不可登录'
      }
    })
  } else {
    name.value = '不存在'
  }
})

const login = () => {
  if (['', '不存在', '非正式成员不可登录'].includes(name.value)) {
    ElMessageBox.alert('输入有误', '登陆失败', {
      type: 'error',
      center: true,
    })
  } else {
    getData(`${baseurl}member/${number.value}/login`, 'get', {
      password: window.btoa(password.value),
    })
    axios(`${baseurl}member/${number.value}/login?password=${window.btoa(password.value)}`).then(response => {
      if (response.data.status == 'ok') {
        ElMessageBox.alert(`${name.value}，欢迎使用。`, '登陆成功', {
          type: 'success',
          center: true,
        }).then(() => {
          router.push('/member/')
        })
        sessionStorage.setItem(
          'memberLoginInfo',
          encode({
            number: number.value,
            password: window.btoa(password.value),
          })
        )
        setTimeout(() => {
          router.push('/member/')
        }, 3000)
      } else {
        localStorage.removeItem('memberLoginInfo')
        failfuc(response.data.reason, response.data.text)
      }
    })
  }
}
</script>

<template>
  <el-form>
    <el-form-item label="学号">
      <el-input v-model="number" />
    </el-form-item>
    <el-form-item label="姓名">
      <el-input v-model="name" readonly />
    </el-form-item>
    <el-form-item label="密码">
      <el-input v-model="password" type="password" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" style="width: 100%" plain @click="login"> 确定 </el-button>
    </el-form-item>
  </el-form>
</template>
