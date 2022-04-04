/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { createYearTransformer } from '../../../utils'
import getClass from '../crud/read/get-class'

dayjs.extend(isBetween)

export default (gradeid: number, classid: number, start: string, end: string) => {
  const arrList = getClass([1, 2, 3].includes(gradeid) ? createYearTransformer(gradeid) : gradeid, classid).details as DeductionList[]
  const base: {
    columns: string[]
    rows: {
      name: string
      data: number
    }[]
  } = {
    columns: ['原因', '扣分数'],
    rows: [],
  }
  let list = {}
  for (let i = 0; i in arrList; i++) {
    if (dayjs(arrList[i].time).isBetween(dayjs(start), dayjs(end))) {
      if (list[<string>arrList[i].reason] == undefined) {
        list[<string>arrList[i].reason] = 0
      }
      list[<string>arrList[i].reason] += arrList[i].deduction
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let key: string, val: any
  for ([key, val] of Object.entries(list)) {
    base.rows.push({
      name: <string>key,
      data: Math.floor(val / 0.05) * 0.05,
    })
  }
  return base.rows
}
