import SMTPTransport from 'nodemailer/lib/smtp-transport'
import dayjs from 'dayjs'
import { createImapReader } from 'packages/server/src/modules/powers/post/mail/imap/creator'
import { createMailToPostDataMulti } from './imap/create-post'
// createImapReader()

const createMailTransfer = async (
  username: string,
  password: string,
  hosts: {
    imap: string
    smtp: string
  }
) => {
  try {
    const list = await createImapReader(
      {
        host: hosts.imap,
        user: username,
        password,
      },
      dayjs().subtract(3, 'month').format('YYYY-MM-DD')
    )
    // console.log(list)
    await createMailToPostDataMulti(
      {
        host: hosts.smtp,
        secure: true,
        auth: {
          user: username,
          pass: password,
        },
      } as unknown as SMTPTransport,
      username,
      list
    ).then(() => {
      return {
        status: 'ok',
      }
    })
  } catch (e) {
    return {
      status: 'error',
      reason: 'type-error',
      text: new Error(<string>e).message,
    }
  }
}

export { createMailTransfer, createMailTransfer as default }
