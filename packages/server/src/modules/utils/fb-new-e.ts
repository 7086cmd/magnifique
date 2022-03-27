import { v4 } from 'uuid'
import { resolve } from 'path'
import { existsSync } from 'fs'
import { tmpdir } from 'os'
import dataSave from './data-save'
import { createNewAction } from '../powers/member'
export default (config: { title: string; description: string; from: 'class' | 'member' | 'admin'; more?: { grade: number; class: number; num?: undefined } | { num: number } }) => {
  try {
    const temppath = resolve(tmpdir(), '../magnifique/feedbacks/')
    let id = v4()
    config['id'] = id
    config['status'] = 'not_processed'
    while (existsSync(resolve(temppath, `./${id}.sdbdata`))) {
      id = v4()
      config['id'] = id
    }
    dataSave(resolve(temppath, `./${id}.sdbdata`), config)
    if (config.from === 'member') {
      if (config.more?.num !== undefined) {
        createNewAction(config.more?.num, 1)
      }
    }
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
