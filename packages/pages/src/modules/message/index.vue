<script lang="ts" setup>
import { ref } from 'vue'

let key = ref('')
interface MonacoEditorElement extends HTMLDivElement {
  getValue: () => string
}
let editorRef = ref<MonacoEditorElement>()

let ctrlKeyUp = ref(false)

document.addEventListener('keydown', e => {
  if (e.key === 'Control') {
    ctrlKeyUp.value = true
    setTimeout(() => {
      ctrlKeyUp.value = false
    }, 800)
  } else if (e.key === 'Enter' && ctrlKeyUp.value) {
    // send
    ctrlKeyUp.value = false
  } else {
    ctrlKeyUp.value = false
  }
})
let previewIng = ref(false)
let contentMd = ref('')
const preview = () => {
  contentMd.value = editorRef.value?.getValue() as string
  previewIng.value = true
}
</script>
<template>
  <div>
    <el-card shadow="never">
      <markdown
        content="> 由于编辑器限制，暂时不支持快捷键发送。

> 支持[Markdown语法](https://markdown.com.cn/basic-syntax/)，但暂不支持Table和DefList。"
      ></markdown>
      <el-row>
        <el-col :span="20">
          <monaco-editor ref="editorRef" v-model="key" language="markdown" height="480px"></monaco-editor>
        </el-col>
        <el-col :span="4"> <el-button @click="preview">确定</el-button> </el-col>
      </el-row>
    </el-card>
    <el-dialog v-model="previewIng" center title="预览">
      <markdown :content="contentMd"></markdown>
    </el-dialog>
  </div>
</template>
