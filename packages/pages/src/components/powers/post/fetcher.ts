import axios from 'axios'
import toPort from '../../../modules/to-port'
import post from '../../../../examples/post'
import { createPostConfig } from './config'
import { PostFetch } from './env'
import baseurl from '../../../modules/baseurl'
import failfuc from '../../../modules/failfuc'

class PostFetcher {
  options: PostFetch.postFetcherConfig

  postExample: PostList

  uploader: string

  constructor(option: fetcherOptions) {
    this.options = createPostConfig(option)
    this.postExample = post()
    this.uploader = ''
    if (option.type === 'member') {
      this.postExample.person = Number(option.number)
      this.uploader = this.options.uploader as string
    }
  }

  get = async () => {
    return (await axios(this.options.getter)).data
  }

  delete = async (postDeleteData: { id: string; uploaderID: number }) => {
    if (this.options.deleter) {
      return (
        await axios(this.options.deleter, {
          method: 'post',
          data: {
            password: this.options.standardConfig.password,
            id: postDeleteData.id,
            person: postDeleteData.uploaderID,
          },
        })
      ).data
    } else
      return {
        status: 'error',
        reason: 'no-auth',
      }
  }

  download = async (postDownloadData: { id: string; uploaderID: number }) => {
    if (this.options.downloader) {
      const response = (
        await axios(this.options.downloader, {
          method: 'post',
          data: {
            password: this.options.standardConfig.password,
            id: postDownloadData.id,
            person: postDownloadData.uploaderID,
          },
        })
      ).data

      if (response.status === 'ok') {
        window.open(toPort(`${baseurl}member/post/download/${response.details.token}/${response.details.token}.docx`))
      } else {
        failfuc(response.reason, response.text)
      }
    } else failfuc('no-auth', '')
  }

  create = async (postCreatement: PostList) => {
    if (this.options.creater && this.options.standardConfig.type === 'member') {
      return (
        await axios(this.options.creater, {
          method: 'post',
          data: {
            person: this.options.standardConfig.number,
            password: this.options.standardConfig.password,
            id: postCreatement.id,
            content: {
              title: postCreatement.title,
              type: postCreatement.type,
              description: postCreatement.description,
            },
          },
        })
      ).data
    } else
      return {
        status: 'error',
        reason: 'no-auth',
      }
  }
}

export { PostFetcher }
