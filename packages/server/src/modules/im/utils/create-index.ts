import { createYearTransformer } from '../../utils'

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
    let gradeid = config.gradeid
    if (![1, 2, 3].includes(config.gradeid)) {
      const items = [1, 2, 3]
      items.forEach(item => {
        if (createYearTransformer(item) === config.gradeid) {
          gradeid = item
        }
      })
    }
    return `class/${gradeid}/${config.classid}`
  }
}
