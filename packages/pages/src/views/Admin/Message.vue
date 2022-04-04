<script setup lang="ts">
import { ref } from 'vue'
import MessageIndex from '../Messages/Index.vue'

const { password } = JSON.parse(window.atob(String(localStorage.getItem('adminLoginInfo'))))

const id = ref('admin')
</script>

<template>
  <message-index :username="id" :password="password" />
</template>
