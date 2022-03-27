declare interface member_processed {
  name: string
  number: number
  in: string // department
  do: string // position
  icg: boolean
  record: {
    actions: number
    score: number
    violation: number
  }
  duty: string[]
  admin: string[]
  volunteer: number
}
