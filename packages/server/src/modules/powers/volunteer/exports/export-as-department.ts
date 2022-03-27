import dayjs from 'dayjs'
import { getDepartmentAsRaw } from '../../member'
import createSingleItem from './utils/create-single-item'
import exportOverview from './utils/export-overview'
import getDepartmentData from '../../../database/get-department-data'

export default (
  department: string,
  config?: {
    start: string
    end: string
  }
) => {
  let csv =
    `导出形式：部门(${getDepartmentData().details.departments[department].name}导出\n` +
    `开始日期： ${config === undefined ? '全部记录' : dayjs(config.start).format('YYYY-MM-DD')}\n` +
    `结束日期： ${config === undefined ? '全部记录' : dayjs(config.end).format('YYYY-MM-DD')}\n` +
    exportOverview()
  const membersInClass = getDepartmentAsRaw(department).details
  membersInClass.forEach(item => {
    csv += createSingleItem(item.number, config)
  })
  return csv
}
