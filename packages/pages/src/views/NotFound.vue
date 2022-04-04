<script lang="ts" setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>
<template>
  <el-container>
    <el-aside width="5%" />
    <el-main>
      <el-card shadow="never">
        <el-result icon="warning" title="404 Not Found" sub-title="找不到你要访问的地方">
          <template #extra>
            <el-button type="primary" style="color: #ffffff" round @click="router.push('/')">返回主页</el-button>
          </template>
        </el-result>
      </el-card>
    </el-main>
    <el-aside width="5%" />
  </el-container>
</template>
