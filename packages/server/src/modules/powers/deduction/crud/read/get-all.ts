import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import getClass from './get-class'
import { createYearTransformer } from '../../../../utils'

dayjs.extend(isBetween)

export default (config?: { start: string; end: string }) => {
  let base: DeductionList[] = []
  const classes = [15, 15, 15]
  for (let i = 1; i <= 3; i++) {
    for (let j = 1; j <= classes[i - 1]; j++) {
      base.push(...getClass(createYearTransformer(i), j).details)
    }
  }
  return {
    status: 'ok',
    details: config === undefined ? base : base.filter(item => dayjs(item.time).isBetween(dayjs(config.start), dayjs(config.end))),
  }
}
