import { set } from 'lodash'

const objectToArray = (insert: string, content: object) => {
  let key, val
  let base = []
  for ([key, val] of Object.entries(content)) {
    set(val, insert, key)
    base.push(val)
  }
  return base
}
export default objectToArray
