import { tmpdir } from 'os'
import { existsSync } from 'fs'
import { resolve } from 'path'
import dayjs from 'dayjs'
import { getSingleMemberAsRaw } from '../../../member'
import { createMemberIndex, createSdbdataSaver, createSdbdataParser, createPersonNumberAnalyzor } from '../../../../utils'

export default (
  numb: number,
  id: string,
  config: {
    title: string
    type: '小说' | '散文' | '诗歌' | '说明文' | '议论文' | '其他'
    description: string
  }
) => {
  try {
    const ana = createPersonNumberAnalyzor(numb)
    const temppath = resolve(tmpdir(), `..`, `magnifique`, `${ana.gradeid}`, `${ana.classid}`, `post.sdbdata`)
    if (!existsSync(temppath)) {
      return {
        status: 'error',
        reason: 'not-exists',
      }
    }
    const list = createSdbdataParser(temppath)
    list.details[id] = {
      ...config,
      person: numb,
      time: dayjs().toJSON(),
      path: resolve(tmpdir(), `..`, `magnifique`, `${ana.gradeid}`, `${ana.classid}`, `posts`, id + '.docx'),
    } as post
    if (existsSync(createMemberIndex(numb))) {
      const memberdetail = getSingleMemberAsRaw(numb).details as member

      ;(
        memberdetail.post as {
          details: Record<string, post>
        }
      ).details[id] = {
        ...config,
        person: numb,
        time: dayjs().toJSON(),
        path: resolve(tmpdir(), `..`, `magnifique`, `${ana.gradeid}`, `${ana.classid}`, `posts`, id + '.docx'),
      } as post
      createSdbdataSaver(createMemberIndex(memberdetail.number), memberdetail)
    }
    createSdbdataSaver(temppath, list)
    return {
      status: 'ok',
    }
  } catch (e) {
    return {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
}
