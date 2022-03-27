import { tmpdir } from 'os'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { sha512 } from 'js-sha512'
import { createSdbdataSaver } from '../utils'

export default (newPwd: string) => {
  const temppath = resolve(tmpdir(), `../magnifique/admin/password.sdbdata`)
  if (existsSync(temppath)) {
    try {
      createSdbdataSaver(temppath, {
        secret: {
          password: sha512(newPwd),
        },
      })
      return {
        status: 'ok',
      }
    } catch (e) {
      return {
        status: 'error',
        reason: 'type-error',
        text: new Error(<string>e).message,
      } as status
    }
  } else {
    return {
      status: 'error',
      reason: 'not-exists',
    } as status
  }
}
