import { Transporter } from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'

const createSMTPClientSender = (client: Transporter, options: Mail.Options) => {
  return new Promise(resolve => {
    client.sendMail(options, error => {
      if (error) throw error
      resolve({
        status: 'ok',
      })
    })
  })
}

export { createSMTPClientSender }
