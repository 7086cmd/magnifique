import { createPersonNumberAnalyzor } from '../../../../utils'
import classGet from './class-get'

export default (numb: number) => {
  const { gradeid, classid } = createPersonNumberAnalyzor(numb)
  return {
    status: 'ok',
    details: classGet(gradeid, classid).details.filter(item => item.person === numb),
  }
}
