declare interface mailContent {
  学号: number
  标题: string
  介绍: string
  体裁: string
}

declare interface mailPostTransfer extends mailContent {
  filePath: string
  id: string
  from: string
}

declare interface emailConfig {
  username: string
  password: string
  hosts: {
    imap: string
    smtp: string
  }
}
