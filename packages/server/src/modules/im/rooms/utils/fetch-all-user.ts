import getDepartmentData from '../../../database/get-department-data'
import getCore from '../../../powers/member/crud/read/get-core'
import getDepartment from '../../../powers/member/crud/read/get-department'
import { createYearTransformer } from '../../../utils'

const getClassName = (gradeid: number, classid: number) => {
  const gids = ['', '初一', '初二', '初三']
  if (![1, 2, 3].includes(gradeid)) {
    for (let i = 1; i <= 3; i++) {
      if (createYearTransformer(i) === gradeid) gradeid = i
    }
  }
  return `${gids[gradeid]}（${classid}）班`
}
const getOptions = () => {
  interface option {
    label: string
    value: string
    children?: option[]
  }
  const options: option[] = [
    {
      value: 'admin',
      label: '管理员',
    },
  ]
  const memberOptions = [] as option[]
  const classOptions = [] as option[]
  for (let i = 1; i <= 3; i++) {
    classOptions.push({
      label: ['', '初一', '初二', '初三'][i],
      value: 'class/' + i,
      children: [],
    })
    for (let j = 1; j <= 15; j++) {
      classOptions[i - 1].children?.push({
        label: getClassName(i, j),
        value: 'class/' + i + '/' + j,
      })
    }
  }
  const departments = getDepartmentData().details.departments
  memberOptions.push({
    label: '骨干成员',
    value: 'member/core',
    children: [],
  })
  getCore().details.forEach(item => {
    memberOptions
      .filter(x => x.value === 'member/core')[0]
      .children?.push({
        value: 'member/' + item.number,
        label: item.name,
      })
  })
  for (let [key, val] of Object.entries(departments)) {
    memberOptions.push({
      label: val.name,
      value: 'member/' + key,
      children: [],
    })
    const departmentMembers = getDepartment(key).details
    departmentMembers.forEach(item => {
      memberOptions
        .filter(x => x.value === 'member/' + key)[0]
        .children?.push({
          value: 'member/' + item.number,
          label: item.name,
        })
    })
  }
  options.push({
    label: '班级',
    value: 'class',
    children: classOptions,
  })
  options.push({
    label: '成员',
    value: 'member',
    children: memberOptions,
  })
  return options
}

export { getOptions }
