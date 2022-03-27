import routeIndex from './route-index'

export default (index: string): string => {
  const describer = routeIndex(index)
  if (describer?.type === 'member') {
    return '成员' + describer.number
  } else if (describer?.type === 'class') {
    const classids = ['', '初一', '初二', '初三']
    return `${classids[describer.gradeid]}（${describer.classid}）班`
  } else if (describer?.type === 'admin') {
    return '管理员'
  } else {
    return 'Not Found'
  }
}
