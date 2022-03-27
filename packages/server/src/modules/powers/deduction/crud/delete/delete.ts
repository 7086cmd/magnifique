import { existsSync } from 'fs'
import { getSingleMemberAsRaw } from '../../../member'
import { createSdbdataParser, createSdbdataSaver, createMemberIndex, createPersonNumberAnalyzor } from '../../../../utils'
import { resolve } from 'path'
import { tmpdir } from 'os'

export default (person: number, id: string) => {
  const deductor = createPersonNumberAnalyzor(person)
  const temppath = resolve(tmpdir(), '..', 'magnifique', `${deductor.gradeid}`, `${deductor.classid}`, 'deduction.sdbdata')
  if (existsSync(temppath)) {
    try {
      const decoded = createSdbdataParser(temppath) as {
        details: Record<string, deduction>
      }
      if (existsSync(createMemberIndex(person))) {
        const persondetail = getSingleMemberAsRaw(person).details as member
        delete persondetail.deduction.details[id]
        createSdbdataSaver(createMemberIndex(persondetail.number), persondetail)
      }
      delete decoded.details[id]
      createSdbdataSaver(temppath, decoded)
      return {
        status: 'ok',
      } as status
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
