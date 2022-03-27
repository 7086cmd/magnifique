import isBetween from 'dayjs/plugin/isBetween'
import dayjs from 'dayjs'
import getOwn from '../crud/read/get-own'

dayjs.extend(isBetween)

export default (
  memberNumber: number,
  config?: {
    start: string
    end: string
  }
) => {
  const vol = getOwn(memberNumber).details
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
