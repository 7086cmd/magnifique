<script lang="ts" setup>
import * as monaco from 'monaco-editor'
import { onMounted, ref, defineProps, toRefs, unref, defineExpose } from 'vue'

const props = defineProps<{
  language: string
  modelValue: string
  width: string
  height: string
}>()

let { language, modelValue: value, width: editorWidth, height: editorHeight } = toRefs(props)

let editor = ref<HTMLDivElement>()
let content = ref(unref(value))

onMounted(() => {
  let editors = monaco.editor.create(editor.value as HTMLElement, {
    language: language.value,
    value: value.value,
    automaticLayout: true,
  })
  editors.onDidChangeModelContent(() => {
    content.value = (document.getElementsByClassName('inputarea monaco-mouse-cursor-text')[0] as HTMLTextAreaElement).value
  })
})

defineExpose({
  getValue: () => (document.getElementsByClassName('inputarea monaco-mouse-cursor-text')[0] as HTMLTextAreaElement).value,
})
</script>
<template>
  <div ref="editor" :style="'width: ' + editorWidth + '; height: ' + editorHeight + '; text-align: left'"></div>
</template>
