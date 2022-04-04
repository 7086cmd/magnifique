<script setup lang="ts">
import LoginMember from './Login.vue'
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <div style="text-align: center">
    <h3>请先登录</h3>
    <login-member :number-def="route.params.id" :redr="route.query.redirection" />
  </div>
</template>
