import classGet from './class-get'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { createYearTransformer } from '../../../../utils'

dayjs.extend(isBetween)

export default (config?: { start: string; end: string }) => {
  let base: post[] = []
  const classes = [15, 15, 15]
  for (let i = 1; i <= 3; i++) {
    for (let j = 1; j <= classes[i - 1]; j++) {
      base.push(...classGet(createYearTransformer(i), j).details)
    }
  }
  if (config == undefined) {
    return {
      status: 'ok',
      details: base,
    }
  } else {
    const startline = dayjs(config.start)
    const endline = dayjs(config.end)
    base.filter(item => dayjs(item.time).isBetween(startline, endline))
    return {
      status: 'ok',
      details: base,
    }
  }
}
