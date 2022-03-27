declare interface deduction {
  person: number
  reason: string
  description?: string
  deduction: number
  deductor: {
    name: string
    number: number
  }
  time: string | Date
  place: string
  status: 'normal' | 'processing' | 'failed'
  msgs: {
    feedback: string
    turndown: string
  }
}
