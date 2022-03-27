export default (file: File) => {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.addEventListener('loadend', e => {
      resolve(e.target?.result)
    })
  })
}
