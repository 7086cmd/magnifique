import { getSingleMemberAsRaw } from '../../../../member'

const createSMTPSuccessContent = (mailer: string, conf: { from: string; number: number }) => {
  const person = getSingleMemberAsRaw(conf.number)
  let grate = 'Hello, '
  if (person.status === 'ok') {
    grate += person.details?.name
  } else {
    grate += String(conf.number) + '同学'
  }
  grate += '，您的来稿已收到'

  const options = {
    from: `"Study Department" <${mailer}>`,
    to: conf.from,
    subject: grate,
    text: grate,
    html: grate,
  }
  return options
  // SMTPTransport
}

export { createSMTPSuccessContent }
