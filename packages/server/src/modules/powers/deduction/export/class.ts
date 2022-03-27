import { getClass } from '../crud/read/index'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { createYearTransformer } from '../../../utils'

dayjs.extend(isBetween)

const items = ['班级', '扣分数']
const doit = (content: object) => {
  return (
    JSON.stringify(content)
      .split('[')
      .filter(word => word != '')
      .join('[')
      .split(']')
      .filter(word => word != '')
      .join(']') + '\r\n'
  )
}
const createClassName = (gradeid: number, classid: number) => {
  const grades = ['', '初一', '初二', '初三']
  return grades[gradeid] + '（' + classid + '）班'
}
export default (config: { start: string; end: string }) => {
  let stri = `"开始时间: ${dayjs(config.start).format('YYYY/MM/DD')}"\r\n"结束时间: ${dayjs(config.end).format('YYYY/MM/DD')}"\r\n${doit(items)}`
  for (let i = 1; i <= 3; i++) {
    for (let j = 1; j <= 15; j++) {
      let deductiont = 0
      const classList = getClass(createYearTransformer(i), j).details
      classList.forEach(item => {
        if (dayjs(item.time).isBetween(dayjs(config.start), dayjs(config.end))) {
          let t = Math.floor(deductiont * 100)
          t += Math.floor(item.deduction * 100)
          deductiont = t / 100
        }
      })
      stri += doit([createClassName(i, j), deductiont])
    }
  }
  return {
    status: 'ok',
    details: stri,
  }
}
