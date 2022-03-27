<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/max-attributes-per-line -->
<script lang="ts" setup>
import { ref } from 'vue'
import axios from 'axios'
import { ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import baseurl from '../../modules/baseurl'

const { t } = useI18n()
const router = useRouter()

let password = ref('')

const login = () => {
  axios(`${baseurl}admin/login?password=${window.btoa(password.value)}`).then(response => {
    if (response.data.status == 'ok') {
      let timeOut = 3
      ElMessageBox.alert(`欢迎使用。` + t('class.status.jump', { sec: timeOut }), '登陆成功', {
        type: 'success',
        center: true,
      }).then(() => {
        router.push('/admin/')
      })
      localStorage.setItem(
        'adminLoginInfo',
        window.btoa(
          JSON.stringify({
            password: window.btoa(password.value),
          })
        )
      )
      setTimeout(() => {
        router.push('/admin/')
      }, 3000)
    } else {
      localStorage.removeItem('adminLoginInfo')
      ElMessageBox.alert(
        t('dialogs.' + response.data.reason, {
          msg: response.data.text,
        }),
        '登陆失败',
        {
          type: 'error',
          center: true,
        }
      )
    }
  })
}
</script>

<template>
  <el-form>
    <el-form-item label="密码">
      <el-input v-model="password" type="password" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" style="width: 100%" plain @click="login"> 确定 </el-button>
    </el-form-item>
  </el-form>
</template>
