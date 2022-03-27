import { createObjectToArrayTransformer } from 'packages/client/src/modules/utils'
import Imap from 'imap'
import { MailParser, AddressObject } from 'mailparser'
import { createWriteStream } from 'fs'
import { parse } from 'json5'
import { tmpdir } from 'os'
import { resolve } from 'path'
import { v4 } from 'uuid'
import { has } from 'lodash'

let postsSearched: Record<
  string,
  {
    isPost: boolean
    content: mailPostTransfer
  }
> = {}
const createImapReader = (
  imapConfig: Imap.Config,
  StartDate: string
): Promise<
  Array<{
    isPost: boolean
    content: mailPostTransfer
    id: string
  }>
> => {
  return new Promise(resolver => {
    const imap = new Imap(imapConfig)
    let completely = false
    imap.once('ready', () => {
      imap.openBox('INBOX', () => {
        // Email Opened
        try {
          imap.search(['UNSEEN', ['SINCE', StartDate]], (err, result) => {
            if (err) {
              // nothing.
            }
            try {
              let filter = imap.fetch(result, {
                bodies: '',
                markSeen: true,
              })
              filter.on('message', msg => {
                const mailContent = new MailParser()
                msg.on('body', stream => {
                  let id = v4()
                  while (has(postsSearched, id)) {
                    id = v4()
                  }
                  stream.pipe(mailContent)
                  const pather = resolve(tmpdir(), `${id}.docx`)
                  postsSearched[id] = {
                    isPost: false,
                    content: {
                      学号: 0,
                      标题: '',
                      介绍: '',
                      体裁: '其他',
                      filePath: resolve(tmpdir(), `${id}.docx`),
                      id: id,
                      from: '',
                    },
                  }
                  mailContent.on('headers', headers => {
                    const from = (headers.get('from') as AddressObject).value.map(x => x.address).join(', ')
                    postsSearched[id].content.from = from
                    if (headers.get('subject') === '来稿') {
                      // It is the post.
                      if (postsSearched[id] === undefined) {
                        postsSearched[id] = {
                          isPost: false,
                          content: {
                            学号: 0,
                            标题: '',
                            介绍: '',
                            体裁: '其他',
                            filePath: resolve(tmpdir(), `${id}.docx`),
                            id: id,
                            from: from,
                          },
                        }
                      }
                      postsSearched[id].isPost = true
                    } else {
                      postsSearched[id].isPost = false
                    }
                  })
                  mailContent.on('data', data => {
                    completely = false
                    if (data.type === 'text') {
                      try {
                        const parsed = parse(data.text.replaceAll('&nbsp;', ' ')) as mailContent
                        if (!has(parsed, '学号')) {
                          postsSearched[id].isPost = false
                        }
                        postsSearched[id].content = {
                          学号: parsed.学号,
                          标题: parsed.标题,
                          介绍: parsed.介绍 === undefined ? parsed.介绍 : '',
                          体裁: parsed.体裁 === undefined ? parsed.体裁 : '其他',
                          filePath: '',
                          id: id,
                          from: postsSearched[id].content.from,
                        }
                        completely = true
                      } catch (_e) {
                        // Not the post
                      }
                    }
                    if (data.type === 'attachment') {
                      completely = false
                      data.content.pipe(createWriteStream(pather))
                      data.release()
                      completely = true
                    }
                  })
                })
              })
              filter.once('end', () => {
                if (completely) {
                  resolver(createObjectToArrayTransformer('id', postsSearched))
                  return
                }
                let range = 0
                const emitter = setInterval(() => {
                  // console.log(completely, postsSearched)
                  range++
                  if (completely || range * 500 >= 100000) {
                    resolver(createObjectToArrayTransformer('id', postsSearched))
                    clearInterval(emitter)
                    return
                  }
                }, 500)
                imap.end()
              })
            } catch (_) {
              resolver([])
            }
          })
        } catch (_e) {
          // nothing
        }
      })
    })
    imap.connect()
  })
}

export { createImapReader }
