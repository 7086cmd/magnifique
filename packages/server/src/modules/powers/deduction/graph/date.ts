/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import getClass from '../crud/read/get-class'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { createYearTransformer } from '../../../utils'

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
    columns: ['日期', '扣分数'],
    rows: [],
  }
  let list = {}
  for (let i = 0; i in arrList; i++) {
    if (dayjs(arrList[i].time).isBetween(dayjs(start), dayjs(end))) {
      if (list[dayjs(arrList[i].time).format('YYYY/MM/DD')] == undefined) {
        list[dayjs(arrList[i].time).format('YYYY/MM/DD')] = 0
      }
      list[dayjs(arrList[i].time).format('YYYY/MM/DD')] += arrList[i].deduction
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
