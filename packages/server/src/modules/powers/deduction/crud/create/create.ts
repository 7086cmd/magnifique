import { tmpdir } from 'os'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { v4 } from 'uuid'
import { getSingleMemberAsRaw } from '../../../member'
import { createSdbdataSaver, createMemberIndex, createSdbdataParser, createPersonNumberAnalyzor } from '../../../../utils'

// varible: deduction data.

export default (de_data: deduction) => {
  let uuid = v4()
  const ana = createPersonNumberAnalyzor(de_data.person)
  const temppath = resolve(tmpdir(), `../magnifique/${ana.gradeid}/${ana.classid}/deduction.sdbdata`)
  if (existsSync(temppath)) {
    try {
      const decoded = createSdbdataParser(temppath)
      while (decoded[uuid] !== undefined) {
        uuid = v4()
      }
      decoded.details[uuid] = de_data
      if (existsSync(createMemberIndex(de_data.person))) {
        const persondetail = getSingleMemberAsRaw(de_data.person).details as member
        persondetail.deduction.details[uuid] = de_data
        createSdbdataSaver(createMemberIndex(de_data.person), persondetail)
      }
      createSdbdataSaver(temppath, decoded)
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
  } else {
    return {
      status: 'error',
      reason: 'not-exists',
    }
  }
}
