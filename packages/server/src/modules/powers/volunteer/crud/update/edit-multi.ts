import editStatus from './edit-status'
import getOwn from '../read/get-own'
import { flattenDeep, uniq } from 'lodash'
import getAll from '../read/get-all'

export default (Data: number[], createId: string) => {
  const allRecorded = uniq(
    flattenDeep(
      getAll()
        .details.filter(x => x.createId === createId)
        .map(x => x.person)
    )
  )
  allRecorded.forEach(item => {
    const volunteerInAMember = getOwn(item).details
    volunteerInAMember.filter(volunteerItem => volunteerItem.createId === createId)
    volunteerInAMember.forEach(volunteerItem => {
      if (volunteerItem.createId === createId) {
        editStatus(item, volunteerItem.idInUserData, Data.includes(volunteerItem.person) ? 'done' : 'miss')
      }
    })
  })
  return {
    status: 'ok',
  }
}
