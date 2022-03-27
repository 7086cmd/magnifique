export default () => {
  const elements = ['班级', '姓名', '学号', '部门', '义工时长']
  return (
    JSON.stringify(elements)
      .split('[')
      .filter(x => x !== '')
      .join('[')
      .split(']')
      .filter(x => x !== '')
      .join(']') + '\n'
  )
}
