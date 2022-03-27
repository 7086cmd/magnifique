import loginAdmin from '../../admin/login-admin'
import loginClass from '../../class/login-class'
import loginMember from '../../member/login-member'
import routeIndex from '../utils/route-index'

export const loginModule = (user: string, password: string) => {
  const userStruct = routeIndex(user)
  if (userStruct?.type === 'class') {
    return loginClass(userStruct?.gradeid, userStruct?.classid, password)
  } else if (userStruct?.type === 'member') {
    return loginMember(userStruct?.number, password)
  } else if (userStruct?.type === 'admin') {
    return loginAdmin(password)
  } else {
    return {
      status: 'error',
      reason: 'not-exist',
    }
  }
}
