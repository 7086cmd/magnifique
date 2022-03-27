declare interface VolunteerCombo {
  person: number | number[]
  duration: number
  project: string
  place: string
  status: 'planning' | 'done' | 'miss'
  time: string
  createId: string
  idInUserData: string
  records?: {
    person: number
    status: 'planning' | 'done' | 'miss'
  }[]
}
