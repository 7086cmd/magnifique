declare interface VolunteerMulti {
  person: number[]
  duration: number
  project: string
  place: string
  status: 'planning' | 'done' | 'miss'
  time: string
  createId: string
  records: {
    person: number
    status: 'planning' | 'done' | 'miss'
  }[]
}
