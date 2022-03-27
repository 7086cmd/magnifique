declare interface VolunteerList {
  person: number
  duration: number
  project: string
  place: string
  status: 'planning' | 'done' | 'miss'
  time: string
  createId: string
  idInUserData: string
}
