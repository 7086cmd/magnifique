<script setup lang="ts">
import { ref } from 'vue'
import MessageIndex from '../Messages/Index.vue'

const { number, password } = JSON.parse(window.atob(String(sessionStorage.getItem('memberLoginInfo'))))

const id = ref('member/' + number)
</script>

<template>
  <message-index :username="id" :password="password" />
</template>
