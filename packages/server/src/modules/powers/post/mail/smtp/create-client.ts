import { createTransport, Transporter } from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

const createSMTPClient = (loginInfo: SMTPTransport): Promise<Transporter> => {
  return new Promise(resolve => {
    resolve(createTransport(loginInfo))
  })
}

export { createSMTPClient }
