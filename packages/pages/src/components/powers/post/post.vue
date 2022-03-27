<script lang="ts" setup>
/* global PostList, status1, fetcherOptions */
import { ref, reactive, Ref, defineProps } from 'vue'
import { Refresh, Download, CirclePlus, DeleteFilled } from '@element-plus/icons-vue'
import { ElLoading } from 'element-plus'
import failfuc from '../../../modules/failfuc'
import sucfuc from '../../../modules/sucfuc'
import postDescription from '../../../components/lists/PostDescription.vue'
import dayjs from 'dayjs'
import { PostFetcher } from './fetcher'

const props = defineProps<{
  password: string
  classid?: number
  gradeid?: number
  number?: number
  type: fetcherOptions['type']
  name?: string
}>()

const fetcher = new PostFetcher(props as unknown as fetcherOptions)

let postData = reactive(fetcher.postExample)
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
  const response = await fetcher.get()
  isFetchingData.value = false
  if (response.status == 'ok') {
    allData.value = response.details as PostList[]
    allData.value.map((item: PostList) => {
      item.time = dayjs(item.time).format('YYYY-MM-DD HH:mm:ss')
      return item
    })
  }
}
const deletepost = async (prop: { row: PostList }) => {
  const delLoad = ElLoading.service({
    text: '正在删除投稿，请稍后',
  })
  const response = await fetcher.delete({
    id: prop.row.id,
    uploaderID: prop.row.person,
  })
  delLoad.close()
  if (response.status == 'ok') {
    sucfuc()
  } else {
    failfuc(response.reason, response.text)
  }
  refresh()
}
refresh()
const download = async (prop: { row: PostList }) => {
  await fetcher.download({
    id: prop.row.id,
    uploaderID: prop.row.person,
  })
}
const submitpost = async () => {
  // Write It Again
  const response = await fetcher.create(postData)
  if (response.status === 'ok') {
    sucfuc()
    refresh()
  } else {
    failfuc(response.reason, response.text)
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
              <template #default="prop">
                <post-description :data="prop.row" />
              </template>
            </el-table-column>
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="type" label="体裁" />
            <el-table-column prop="time" label="时间" />
            <el-table-column align="right" fixed="right">
              <template #header>
                <el-button v-if="props.type === 'member'" type="text" :icon="CirclePlus" @click="newpost = true" />
              </template>
              <template #default="prop">
                <el-button v-if="props.type !== 'class'" type="text" :icon="Download" size="small" @click="download(prop)" />
                <el-popconfirm title="确定删除？" @confirm="deletepost(prop)">
                  <template #reference>
                    <el-button v-if="props.type !== 'class'" type="text" :icon="DeleteFilled" size="small" />
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
            :action="fetcher.uploader"
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
