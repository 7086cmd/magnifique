import { v4, validate } from 'uuid'
import create from './create'

interface VolunteerMultiMiddle {
  duration: number
  project: string
  place: string
  status: 'planning' | 'done' | 'miss'
  time: string
  createId: string
}

export default (Data: VolunteerMulti) => {
  // Data.createId = v1()
  if (!validate(Data.createId)) {
    Data.createId = v4()
  }
  Data.person.forEach(item => {
    const volunteerForPerson = {
      ...(Data as VolunteerMultiMiddle),
      person: Number(item),
    } as volunteer
    create(item, volunteerForPerson)
  })
  return {
    status: 'ok',
  }
}
