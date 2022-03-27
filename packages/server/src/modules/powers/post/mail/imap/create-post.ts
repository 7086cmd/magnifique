import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { has } from 'lodash'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { tmpdir } from 'os'
import { createPersonNumberAnalyzor } from 'packages/server/src/modules/utils'
import { resolve } from 'path'
import { v4 } from 'uuid'
import { createPost, getClass } from '../..'
import { createSMTPFailedContent } from '../smtp/template/failed'
import { createSMTPSuccessContent } from '../smtp/template/success'
import { createMultiSMTPEmitter } from '../smtp/create'

type postsData = Array<{
  isPost: boolean
  content: mailPostTransfer
}>

const createMailToPostData = (sender: string, post: { isPost: boolean; content: mailPostTransfer }) => {
  if (post.isPost === false) {
    return createSMTPFailedContent(sender, {
      from: post.content.from,
      number: post.content.学号,
      msg: '不是投稿信件，可能是标题错误，格式错误或没有附件',
    })
  } else {
    try {
      let id = v4()
      const memberStrucure = createPersonNumberAnalyzor(post.content.学号)
      const posts = getClass(memberStrucure.gradeid, memberStrucure.classid).details
      while (has(posts, id)) {
        id = v4()
      }
      if (!existsSync(resolve(tmpdir(), '..', 'magnifique', String(memberStrucure.gradeid), String(memberStrucure.classid), 'posts'))) {
        mkdirSync(resolve(tmpdir(), '..', 'magnifique', String(memberStrucure.gradeid), String(memberStrucure.classid), 'posts'))
      }
      copyFileSync(resolve(tmpdir(), `${post.content.id}.docx`), resolve(tmpdir(), '..', 'magnifique', String(memberStrucure.gradeid), String(memberStrucure.classid), 'posts', `${id}.docx`))
      createPost(post.content.学号, id, {
        title: post.content.标题,
        description: post.content.介绍,
        type: post.content.体裁 as '小说' | '散文' | '诗歌' | '说明文' | '议论文' | '其他',
      })
      return createSMTPSuccessContent(sender, {
        from: post.content.from,
        number: post.content.学号,
      })
    } catch (e) {
      return createSMTPFailedContent(sender, {
        from: post.content.from,
        number: post.content.学号,
        msg:
          '服务端处理时报错：' +
          new Error(<string>e).message +
          '，如果不知道是为什么请<a href="https://github.com/7086cmd">联系开发者</a>或<a href="https://github.com/7086cmd/magnifique/issues/new?assignees=&labels=bug&template=bug_report.yml&title=%5BBug%5D%3A+">提出Issue</a>',
      })
    }
  }
}

const createMailToPostDataMulti = async (emailconf: SMTPTransport, sender: string, postData: postsData) => {
  let datas = postData.map(item => createMailToPostData(sender, item))
  await createMultiSMTPEmitter(emailconf, datas)
  return {
    status: 'ok',
  }
}

const createMailToPostDataSingle = async (emailconf: SMTPTransport, sender: string, postData: { isPost: boolean; content: mailPostTransfer }) => {
  return createMailToPostData(sender, postData)
}

export { createMailToPostDataSingle, createMailToPostDataMulti }
