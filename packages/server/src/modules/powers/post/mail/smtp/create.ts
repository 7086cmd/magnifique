import { createTransport, Transporter } from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

const sendMailPromise = (transport: Transporter, options: Mail.Options) => {
  return new Promise((resolve, reject) => {
    transport.sendMail(options, (error, info) => {
      if (error) {
        reject(error)
      }
      resolve(info)
    })
  })
}

const createSMTPEmitter = (loginInfo: SMTPTransport, options: Mail.Options) => {
  createTransport(loginInfo).sendMail(options, error => {
    if (error) throw error
    return {
      status: 'ok',
    }
  })
}

const createMultiSMTPEmitter = async (loginInfo: SMTPTransport, options: Mail.Options[]) => {
  const transporter = createTransport(loginInfo)
  return Promise.all(options.map(item => sendMailPromise(transporter, item)))
}
export { createSMTPEmitter, createMultiSMTPEmitter }
