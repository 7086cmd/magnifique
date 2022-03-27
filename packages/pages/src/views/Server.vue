<script lang="ts" setup>
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { ref, Ref } from 'vue'
import controls from '../components/controls.vue'
import { useWebNotification } from '@vueuse/core'
const router = useRouter()
const networks: Ref<any[]> = ref([])
try {
  networks.value = window.magnifique.networks
  if (window.magnifique.isElectron !== true) {
    ElMessageBox.alert('不是服务器', '错误', {
      center: true,
      type: 'warning',
    })
    router.push('/')
  }
} catch (_e) {
  ElMessageBox.alert('不是服务器', '错误', {
    center: true,
    type: 'warning',
  })
  router.push('/')
}
useWebNotification({
  title: '服务器运行成功',
  dir: 'auto',
  lang: 'zh-cn',
}).show()
</script>

<template>
  <div>
    <el-container>
      <el-header style="text-align: right">
        <controls />
      </el-header>
      <el-container>
        <el-container>
          <el-main class="maint">
            服务器运行成功<br />Server running at:
            <el-table :data="networks" max-height="320px" stripe border>
              <el-table-column prop="address" label="地址"></el-table-column>
              <el-table-column label="端口">80</el-table-column>
              <el-table-column prop="family" label="协议"></el-table-column>
              <el-table-column label="访问">
                <template #default="props">{{ props.row.internal ? '本地访问' : '范围内访问' }}</template>
              </el-table-column>
              <el-table-column prop="netmask" label="子网掩码"></el-table-column>
              <el-table-column prop="cidr" label="CIDR"></el-table-column>
              <el-table-column prop="mac" label="MAC地址"></el-table-column>
            </el-table>

            <br />
          </el-main>
          <el-footer>平台制作者：7086cmd</el-footer>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="less">
body {
  padding-top: 1em;
  font-size: 16px;
}
.maint {
  font-size: 28px;
}
</style>
