export default (
  config:
    | {
        type: 'admin'
      }
    | {
        type: 'member'
        number: number
      }
    | {
        type: 'class'
        gradeid: number
        classid: number
      }
) => {
  if (config.type === 'admin') {
    return 'admin'
  } else if (config.type === 'member') {
    return `member/${config.number}`
  } else if (config.type === 'class') {
    return `class/${config.gradeid}/${config.classid}`
  }
}
