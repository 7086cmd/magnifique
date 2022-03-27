import { tmpdir } from 'os'
import { readdirSync } from 'fs'
import { resolve } from 'path'
import { createObjectToArrayTransformer, createSdbdataParser, createYearTransformer } from '../../../../utils'

export default (gradeid: number, classid: number) => {
  if ([1, 2, 3].includes(gradeid)) {
    gradeid = createYearTransformer(gradeid)
  }
  const dirpth = resolve(tmpdir(), `../magnifique/${gradeid}/${classid}/members/`)
  const membersMap = readdirSync(dirpth)
  let base: Record<string, member> = {}
  for (let i in membersMap) {
    if (membersMap[i] !== 'pre') {
      const ctdir = resolve(dirpth, membersMap[i])
      const ctn = createSdbdataParser(ctdir) as member
      base[membersMap[i].replace('.sdbdata', '')] = ctn
    }
  }
  return {
    status: 'ok',
    details: createObjectToArrayTransformer('number', base) as member[],
  }
}
