const objectToArray = (insert: string, content: object) => {
  let key, val
  let base = []
  for ([key, val] of Object.entries(content)) {
    val[insert] = key
    base.push(val)
  }
  return base as unknown
}
export default objectToArray
