<script lang="ts" setup>
/* eslint-disable vue/require-default-prop */
import { defineProps, ref, toRefs, reactive } from 'vue'
import { Close, Minus, Plus } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import generateName from './generate-name'
import resetPassword from './reset-password'
import { useRouter } from 'vue-router'
import baseurl from '../modules/baseurl'
import axios from 'axios'
import failfuc from '../modules/failfuc'
import sucfuc from '../modules/sucfuc'

const router = useRouter()

const props = defineProps({
  type: String,
  number: Number,
  name: String,
  gradeid: Number,
  classid: Number,
})
let feedbackdialogOpen = ref(false)
let isSubmitingPassword = ref(false)
let isSubmitingFeedBack = ref(false)

let reset_password = ref(false)
let newpwd = reactive({
  oldpwd: '',
  newpwd1: '',
  newpwd2: '',
})

const { t } = useI18n()
let isClient = ref(false)
const { type, number: numb, gradeid, classid } = toRefs(props)
let name = ref('')
;(async () => {
  name.value = String(await generateName(type, numb, classid, gradeid))
})()
let feedbackin = reactive({
  title: '',
  description: '',
  from: String(type?.value),
  more: {
    class: classid?.value,
    grade: gradeid?.value,
    number: numb?.value,
  },
})
const npd = () => {
  isSubmitingPassword.value = true
  resetPassword(
    type,
    {
      gradeid: gradeid?.value,
      classid: classid?.value,
      number: numb?.value,
    },
    newpwd,
    t,
    router
  )
  isSubmitingPassword.value = false
}
const fbsub = async () => {
  isSubmitingFeedBack.value = true
  const response = await axios(`${baseurl}feed/back`, {
    method: 'post',
    data: feedbackin,
  })
  feedbackin.title = ''
  feedbackin.description = ''
  feedbackdialogOpen.value = false
  isSubmitingFeedBack.value = false
  if (response.data.status == 'ok') {
    sucfuc()
  } else {
    failfuc(response.data.reason, response.data.text)
  }
}
const exit = () => {
  if (type?.value !== undefined) {
    try {
      sessionStorage.removeItem(type?.value + 'LoginInfo')
      localStorage.removeItem(type?.value + 'LoginInfo')
      router.push('/')
      // eslint-disable-next-line no-empty
    } catch (_e) {}
  }
}

try {
  if (window.magnifique.isElectron === true) {
    isClient.value = true
  }
  // eslint-disable-next-line no-empty
} catch (_e) {}

const closeServer = () => {
  window.magnifique.closeServer()
}
const minServerWindow = () => {
  window.magnifique.minServerWindow()
}
const maxServerWindow = () => {
  window.magnifique.maxServerWindow()
}
const openPassword = () => {
  reset_password.value = true
}
</script>
<template>
  <div style="text-align: center">
    <div style="text-align: right">
      <el-dropdown split-button plain>
        <el-icon>
          <User />
        </el-icon>
        {{ name }}
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="feedbackdialogOpen = true">
              <el-icon>
                <MessageBox />
              </el-icon>
              {{ t('class-dropdown.feed-back') }}
            </el-dropdown-item>
            <el-dropdown-item @click="openPassword">
              <el-icon>
                <Edit />
              </el-icon>
              {{ t('class-dropdown.edit-password') }}
            </el-dropdown-item>
            <el-dropdown-item @click="exit">
              <el-icon>
                <Close />
              </el-icon>
              {{ t('class-dropdown.log-out') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-divider v-if="isClient" direction="vertical" />
      <el-button v-if="isClient" style="text-align: right" :icon="Minus" type="warning" circle plain size="small" @click="minServerWindow()"> </el-button>
      <el-button v-if="isClient" style="text-align: right" :icon="Plus" type="success" circle plain size="small" @click="maxServerWindow()"> </el-button>
      <el-button v-if="isClient" style="text-align: right" :icon="Close" type="danger" circle plain size="small" @click="closeServer()"> </el-button>
    </div>
    <el-drawer v-model="reset_password" title="修改密码" direction="rtl" size="40%" style="text-align: center">
      <el-form v-model="newpwd">
        <el-form-item label="原密码">
          <el-input v-model="newpwd.oldpwd" type="password" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="newpwd.newpwd1" type="password" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="newpwd.newpwd2" type="password" />
        </el-form-item>
        <el-form-item>
          <el-button plain @click="reset_password = false"> 取消 </el-button>
          <el-button type="primary" plain :loading="isSubmitingPassword" @click="npd"> 确定 </el-button>
        </el-form-item>
      </el-form>
    </el-drawer>

    <el-drawer v-model="feedbackdialogOpen" title="问题反馈" direction="ltr" size="40%" style="text-align: center">
      <el-form v-model="feedbackin">
        <el-form-item label="反馈标题">
          <el-input v-model="feedbackin.title" />
        </el-form-item>
        <el-form-item label="反馈内容">
          <el-input v-model="feedbackin.description" type="textarea" :autosize="{ minRows: 6, maxRows: 10 }" />
        </el-form-item>
        <el-form-item>
          <el-button plain @click="feedbackdialogOpen = false">取消</el-button>
          <el-button type="primary" plain :loading="isSubmitingFeedBack" @click="fbsub">确定</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>
