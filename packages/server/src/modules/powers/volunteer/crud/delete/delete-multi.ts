import getOwn from '../read/get-own'
import createVolunteerDeletion from './delete'
export default (createId: string, memberList: number[]) => {
  memberList.forEach(item => {
    let volunteerList = getOwn(item).details
    volunteerList.forEach(items => {
      if (items.createId === createId) {
        createVolunteerDeletion(items.person, items.idInUserData)
      }
    })
  })
  return {
    status: 'ok',
  }
}
