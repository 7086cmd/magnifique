import baseurl from '../../../modules/baseurl'
import { PostFetch } from './env'

const createPostConfig = (fetcherInput: fetcherOptions): PostFetch.postFetcherConfig => {
  if (fetcherInput.type === 'admin') {
    return {
      type: 'admin',
      getter: baseurl + 'admin/get/all/post?password=' + fetcherInput.password,
      deleter: baseurl + 'admin/del/post',
      creater: false,
      downloader: baseurl + 'admin/download/post',
      uploader: false,
      standardConfig: fetcherInput,
    }
  } else if (fetcherInput.type === 'member_admin') {
    return {
      type: 'member_admin',
      getter: baseurl + `member/admin/${fetcherInput.number}/get/all/post?password=` + fetcherInput.password,
      deleter: baseurl + `member/admin/${fetcherInput.number}/del/post`,
      creater: false,
      downloader: baseurl + `member/admin/${fetcherInput.number}/download/post`,
      uploader: false,
      standardConfig: fetcherInput,
    }
  } else if (fetcherInput.type === 'member') {
    return {
      type: 'member',
      getter: baseurl + `member/post/${fetcherInput.number}/work/get/post?password=` + fetcherInput.password,
      deleter: baseurl + `member/post/${fetcherInput.number}/work/del/post`,
      creater: baseurl + `member/post/${fetcherInput.number}/work/new/post`,
      uploader: baseurl + `member/post/${fetcherInput.number}/work/upload/post`,
      downloader: baseurl + `member/post/${fetcherInput.number}/work/download/post`,
      standardConfig: fetcherInput,
      name: fetcherInput.name,
    }
  } else {
    return {
      type: 'class',
      getter: baseurl + `class/${fetcherInput.gradeid}/${fetcherInput.classid}/get/post?password=` + fetcherInput.password,
      deleter: false,
      creater: false,
      uploader: false,
      downloader: false,
      standardConfig: fetcherInput,
    }
  }
}

export { createPostConfig }
