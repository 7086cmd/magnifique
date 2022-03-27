import { getClassAsRaw } from '../../../member'
import getOwn from './get-own'
import { createObjectToArrayTransformer } from '../../../../utils'
interface VolunteerWorking {
  person: number | number[]
  duration: number
  project: string
  place: string
  status: 'planning' | 'done' | 'miss'
  time: string
  createId: string
  idInUserData: string
  records: {
    person: number
    status: 'planning' | 'done' | 'miss'
  }[]
}

type middle = Record<string, VolunteerQueryResult>

export default (gradeid: number, classid: number) => {
  const memberList = getClassAsRaw(gradeid, classid).details as member[]
  let volList: middle = {}
  memberList.forEach(item => {
    getOwn(item.number).details.forEach(volData => {
      if (volList[volData.createId] === undefined) {
        let data: VolunteerWorking = {
          ...volData,
          records: [],
        }
        data.records = [
          {
            person: data.person as number,
            status: data.status,
          },
        ]
        data.person = [data.person as number]
        volList[volData.createId] = data as VolunteerQueryResult
      } else {
        volList[volData.createId].records.push({
          person: volData.person as number,
          status: volData.status,
        })
        volList[volData.createId].person.push(volData.person)
      }
    })
  })
  return {
    status: 'ok',
    details: createObjectToArrayTransformer('createId', volList) as VolunteerQueryResult[],
  }
}
