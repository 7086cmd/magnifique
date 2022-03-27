import dayjs from 'dayjs'
import { createPersonNumberAnalyzor, createYearTransformer } from '../../../utils'
import { getAll } from '..'
const items = ['班级', '违纪者', '扣分数', '扣分原因', '解释说明', '扣分日期', '扣分者', '申斥状况']
const statuses = {
  normal: '正常扣分',
  processing: '正在处理',
  failed: '被驳回',
}
const createClassName = (gradeid: number, classid: number) => {
  let grade = 0
  for (let i = 1; i <= 3; i++) {
    if (createYearTransformer(i) == gradeid) {
      grade = i
      break
    }
  }
  const grades = ['', '初一', '初二', '初三']
  return grades[grade] + '（' + classid + '）班'
}
const imports = (deduc: deduction) => {
  const deductor = createPersonNumberAnalyzor(deduc.deductor.number)
  const ana = createPersonNumberAnalyzor(deduc.person)
  return [
    createClassName(ana.gradeid, ana.classid),
    deduc.person,
    deduc.deduction,
    deduc.reason,
    deduc.description,
    dayjs(deduc.time).format('YYYY[年]MM[月]DD[日] HH[时]mm[分]ss[秒]'),
    `${deduc.deductor.name}(${createClassName(deductor.gradeid, deductor.classid)})`,
    statuses[deduc.status],
  ]
}

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
export default (config?: { start: string; end: string }) => {
  try {
    const list = getAll(config).details
    let stri = doit(items)
    for (let i = 0; i in list; i++) {
      stri += doit(imports(list[i]))
    }
    return {
      status: 'ok',
      details: stri,
    }
  } catch (e) {
    return {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
}
