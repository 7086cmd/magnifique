export default (url: string) => {
  let uri: URL
  try {
    uri = new URL(url)
  } catch (e) {
    let tmp = new URL(window.location.href)
    uri = new URL(tmp.origin + url)
  }
  if (uri.protocol === 'http:') {
    uri.port = '8081'
  } else if (uri.protocol === 'https:') {
    uri.port = '8080'
  }
  return uri.toString()
}
