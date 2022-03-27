<script lang="ts" setup>
/* global PostList */
import { ref, reactive, Ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElLoading } from 'element-plus'
import baseurl from '../../../modules/baseurl'
import example from '../../../../examples/post'
import failfuc from '../../../modules/failfuc'
import sucfuc from '../../../modules/sucfuc'
import postDescription from '../../../components/lists/PostDescription.vue'
import dayjs from 'dayjs'
import toPort from '../../../modules/to-port'

const { number, password } = JSON.parse(window.atob(String(sessionStorage.getItem('memberLoginInfo'))))

let postData = reactive(example())
postData.person = number

let isFetchingData = ref(false)
let allData: Ref<PostList[]> = ref([])
const refresh = async () => {
  isFetchingData.value = true
  const response = await axios(`${baseurl}member/admin/${number}/get/all/post`, {
    params: {
      password,
    },
  })
  isFetchingData.value = false
  if (response.data.status == 'ok') {
    allData.value = response.data.details as PostList[]
    allData.value.map((item: PostList) => {
      item.time = dayjs(item.time).format('YYYY-MM-DD HH:mm:ss')
      return item
    })
  }
}
const deletepost = async (props: { row: PostList }) => {
  const delLoad = ElLoading.service({
    text: '正在删除投稿，请稍后',
  })
  const response = await axios(`${baseurl}member/admin/${number}/del/post`, {
    data: {
      id: props.row.id,
      password,
      person: props.row.person,
    },
    method: 'post',
  })
  delLoad.close()
  if (response.data.status == 'ok') {
    sucfuc()
  } else {
    failfuc(response.data.reason, response.data.text)
  }
  refresh()
}
refresh()
const download = async (props: { row: PostList }) => {
  const response = await axios(`${baseurl}member/admin/${number}/download/post`, {
    method: 'post',
    data: {
      id: props.row.id,
      person: props.row.person,
      password,
    },
  })
  if (response.data.status === 'ok') {
    window.open(toPort(`${baseurl}member/post/download/${response.data.details.token}/${props.row.title}.docx`))
  } else {
    failfuc(response.data.reason, response.data.text)
  }
}
</script>

<template>
  <div>
    <el-skeleton :loading="isFetchingData" :rows="4" animated :throttle="500">
      <template #default>
        <el-card shadow="never">
          <el-table :data="allData" max-height="640px">
            <el-table-column type="expand">
              <template #header>
                <el-button type="text" :icon="Refresh" @click="refresh()"></el-button>
              </template>
              <template #default="props">
                <post-description :data="props.row" />
              </template>
            </el-table-column>
            <el-table-column prop="person" label="上传者" />
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="type" label="体裁" />
            <el-table-column prop="time" label="时间" />
            <el-table-column align="right" fixed="right">
              <template #default="props">
                <el-button type="text" size="small" @click="download(props)"> 下载 </el-button>
                <el-popconfirm title="确定删除？" @confirm="deletepost(props)">
                  <template #reference>
                    <el-button type="text" size="small"> 删除 </el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </template>
    </el-skeleton>
  </div>
</template>
