import dayjs from 'dayjs'
import { getClassAsRaw } from '../../member'
import createSingleItem from './utils/create-single-item'
import exportOverview from './utils/export-overview'

const createClassName = (gradeid: number, classid: number) => {
  const grades = ['', '初一', '初二', '初三']
  return `${grades[gradeid]}（${classid}）班`
}

export default (
  gradeid: number,
  classid: number,
  config?: {
    start: string
    end: string
  }
) => {
  let csv =
    `导出形式：班级(${createClassName(gradeid, classid)})导出\n` +
    `开始日期： ${config === undefined ? '全部记录' : dayjs(config.start).format('YYYY-MM-DD')}\n` +
    `结束日期： ${config === undefined ? '全部记录' : dayjs(config.end).format('YYYY-MM-DD')}\n` +
    exportOverview()
  let membersInClass = getClassAsRaw(gradeid, classid).details
  membersInClass.forEach(item => {
    csv += createSingleItem(item.number, config)
  })
  return csv
}
