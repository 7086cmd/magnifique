export default (
  index: string
):
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
  | null => {
  if (index === 'admin') {
    return {
      type: 'admin',
    }
  } else {
    const items = index.split('/')
    if (items[0] === 'member') {
      return {
        type: 'member',
        number: Number(items[1]),
      }
    } else if (items[0] === 'class') {
      return {
        type: 'class',
        gradeid: Number(items[1]),
        classid: Number(items[2]),
      }
    }
  }
  return null
}
