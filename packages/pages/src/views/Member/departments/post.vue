<script lang="ts" setup>
/* global PostList, status1 */
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
let newpost = ref(false)
let isCreating = ref(false)
let allData: Ref<PostList[]> = ref([])

const onUpload = (res: status1) => {
  if (res.status === 'ok') {
    postData.id = res.details.id
  } else {
    failfuc(res.reason, res.text)
  }
}

const refresh = async () => {
  isFetchingData.value = true
  const response = await axios(`${baseurl}member/post/${number}/work/get/post`, {
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
  const response = await axios(`${baseurl}member/post/${number}/work/del/post`, {
    data: {
      id: props.row.id,
      password,
      person: number,
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
  const response = await axios(`${baseurl}member/post/${number}/work/download/post`, {
    method: 'post',
    data: {
      id: props.row.id,
      person: number,
      password,
    },
  })
  if (response.data.status === 'ok') {
    window.open(toPort(`${baseurl}member/post/download/${response.data.details.token}/${props.row.title}.docx`))
  } else {
    failfuc(response.data.reason, response.data.text)
  }
}
const submitpost = async () => {
  // Write It Again
  const response = await axios(`${baseurl}member/post/${number}/work/new/post`, {
    data: {
      id: postData.id,
      password,
      content: {
        title: postData.title,
        description: postData.description,
        type: postData.type,
      },
      person: number,
    },
    method: 'post',
  })
  if (response.data.status === 'ok') {
    sucfuc()
    refresh()
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
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="type" label="体裁" />
            <el-table-column prop="time" label="时间" />
            <el-table-column align="right" fixed="right">
              <template #header>
                <el-button type="text" @click="newpost = true"> 新建投稿 </el-button>
              </template>
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
    <el-dialog v-model="newpost" title="新建投稿" center width="60%">
      <el-form :model="postData" label-position="right">
        <el-form-item label="标题">
          <el-input v-model="postData.title"></el-input>
        </el-form-item>
        <el-form-item label="介绍">
          <el-input v-model="postData.description" type="textarea" :autosize="{ minRows: 3, maxRows: 5 }"></el-input>
        </el-form-item>
        <el-form-item label="体裁">
          <el-select v-model="postData.type" style="width: 100%">
            <el-option v-for="item in ['小说', '散文', '诗歌', '说明文', '议论文', '其他']" :key="item" :value="item" :label="item" style="width: 100%"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文件" style="text-align: center">
          <el-upload
            :disabled="postData.id !== ''"
            accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            :on-failed="onUpload"
            :on-success="onUpload"
            name="file"
            :data="{ password, person: number }"
            drag
            :action="`${baseurl}member/post/${number}/work/upload/post`"
          >
            <el-icon style="padding-top: 8%; font-size: 64px; color: #dedede"><upload-filled /></el-icon>
            <div>拖拽文件到这里或者<el-tag plain>点击上传</el-tag></div>
          </el-upload>
        </el-form-item>
        <el-form-item label="稿件">
          <el-input v-model="postData.id" readonly></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="newpost = false"> 取消 </el-button>
          <el-button type="primary" :loading="isCreating" @click="submitpost"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
