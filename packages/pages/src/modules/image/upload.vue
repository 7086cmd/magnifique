<script setup lang="ts">
import { ref } from 'vue'
import type { ElUpload } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import readImage from './read'

const uploadRef = ref<InstanceType<typeof ElUpload>>()
let src = ref('')
let isConfirming = ref(false)
const change = (file: { raw: File }) => {
  readImage(file.raw).then(result => {
    src.value = result as string
  })
  isConfirming.value = true
}
let isSubmiting = ref(false)
const createData = () => null
</script>
<template>
  <div>
    <el-upload ref="uploadRef" class="upload-demo" drag action="src" :auto-upload="false" :show-file-list="false" :on-change="change">
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div className="el-upload__text">把图片放到这里或者<em>点我上传</em></div>
    </el-upload>
    <el-dialog v-model="isConfirming" title="请确认为该图片" center>
      <el-image :src="src"></el-image>
      <template #footer>
        <span className="dialog-footer">
          <el-button @click="isConfirming = false"> 取消 </el-button>
          <el-button type="primary" :loading="isSubmiting" @click="createData"> 确定发送 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
