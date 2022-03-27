declare interface post {
  title: string
  description: string
  person: number
  time: Date | string
  path: string
  type: '小说' | '散文' | '诗歌' | '说明文' | '议论文' | '其他'
}
