import { linear } from '../../../typings'

const correspondYFromXInLinearFunction = (x: number, func: linear): number => {
  return x * func.k + func.b
}

const correspondXFromYInLinearFunction = (y: number, func: linear): number => {
  return (y - func.b) / func.k
}
export { correspondYFromXInLinearFunction, correspondXFromYInLinearFunction }
