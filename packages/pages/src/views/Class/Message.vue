<script setup lang="ts">
import { ref } from 'vue'
import MessageIndex from '../Messages/Index.vue'

const { gradeid, classid, password } = JSON.parse(window.atob(String(localStorage.getItem('classLoginInfo'))))

const id = ref('class/' + gradeid + '/' + classid)
</script>

<template>
  <message-index :username="id" :password="password" />
</template>
