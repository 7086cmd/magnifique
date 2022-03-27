<script lang="ts" setup>
import { ref, watch } from 'vue'
import dayjs from 'dayjs'
import baseurl from '../../modules/baseurl'
import axios from 'axios'
import failfuc from '../../modules/failfuc'

let workArea = ref(window.innerHeight)

let during = ref([])
let type = ref('reason')
let graph = ref('ring')
const { gradeid, classid, password } = JSON.parse(window.atob(String(localStorage.getItem('classLoginInfo'))))
const panels = [
  {
    name: 'reason',
    label: '类型',
  },
  {
    name: 'person',
    label: '个人',
  },
  {
    name: 'date',
    label: '日期',
  },
]
let link = ref(``)

const generateLink = () => {
  axios(`${baseurl}class/graph/${gradeid}/${classid}/${dayjs(during.value[0]).toJSON()}/${dayjs(during.value[1]).toJSON()}/${graph.value}/${type.value}?password=${password}`).then(response => {
    if (response.data.status === 'error') {
      failfuc(response.data.reason, response.data.text)
    } else {
      axios(`${baseurl}class/graph/ring/${response.data.details.token}`).then(html => {
        link.value = html.data
      })
    }
  })
}

watch(during, () => {
  generateLink()
})
watch(type, () => {
  generateLink()
})
watch(graph, () => {
  generateLink()
})
</script>

<template>
  <div>
    <h2>图表绘制</h2>
    <el-alert type="warning" title="该功能使用必须联网" center show-icon description="正常使用需要使用互联网上的绘图库" close-text="知道了呢" />
    <br />
    <el-date-picker v-model="during" type="datetimerange" range-separator="到" start-placeholder="Start date" end-placeholder="End date" style="width: 100%" />
    <el-tabs v-model="type" style="height: 100%" @tab-click="generateLink">
      <!-- eslint-disable-next-line vue/valid-v-for -->
      <el-tab-pane v-for="i in panels" :label="i.label" :name="i.name">
        <iframe :srcDoc="link" style="text-align: center" frameBorder="0" width="100%" :height="String(Math.floor((workArea * 2) / 3))" scrolling="no" seamless />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
