import { createPersonNumberAnalyzor, createYearTransformer } from '../../../../utils'

const createClassName = (memberNumber: number) => {
  const memberNumberStruct = createPersonNumberAnalyzor(memberNumber)
  const grades = ['', '初一', '初二', '初三']
  const gradeids = [1, 2, 3]
  let gradeid = 0
  gradeids.forEach(item => {
    if (createYearTransformer(item) === memberNumberStruct.gradeid) {
      gradeid = item
    }
  })
  return `${grades[gradeid]}（${memberNumberStruct.classid}）班`
}

export { createClassName }
