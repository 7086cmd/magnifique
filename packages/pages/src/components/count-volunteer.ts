import isBetween from 'dayjs/plugin/isBetween'
import dayjs from 'dayjs'
import { createObjectToArrayTransformer } from '../../modules/utils'

dayjs.extend(isBetween)

export default (
  volunteers: Record<string, volunteer>,
  config?: {
    start: string
    end: string
  }
) => {
  const vol = createObjectToArrayTransformer('idInUserData', volunteers) as Array<VolunteerList>
  let t = 0
  vol.forEach(item => {
    if (config === undefined) {
      if (item.status === 'done') {
        t = (t * 10 + item.duration * 10) / 10
      }
    } else {
      if (item.status === 'done' && dayjs(item.time).isBetween(dayjs(config.start), dayjs(config.end))) {
        t = (t * 10 + item.duration * 10) / 10
      }
    }
  })
  return t
}
