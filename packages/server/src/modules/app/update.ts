import { version } from '../../../package.json'
import fetch from 'node-fetch'
import { parse } from 'yaml'
import { shell } from 'electron'

const main = async () => {
  const response = await fetch('https://api.github.com/repos/7086cmd/magnifique/releases')
  const text = (await response.json()) as githubLatest[]
  if (version !== text[0].name) {
    const item = text[0].assets[0]
    fetch(item.browser_download_url)
      .then(resp => resp.text())
      .then(txt => {
        const latest = parse(txt) as latestFile
        text[0].assets.forEach(item => {
          if (item.name === latest.path) {
            shell.openExternal(item.browser_download_url.toString())
          }
        })
      })
  }
}

export default main
