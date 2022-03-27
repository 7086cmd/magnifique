import { linear, point } from '../../../typings'

const createLinearFunction = (point1: point, point2: point, fixed?: number): linear => {
  const k = (point1.y - point2.y) / (point1.x - point2.x)
  const b = point1.y - k * point1.x
  return {
    k: Number(k.toFixed(fixed ? fixed : 2)),
    b: Number(b.toFixed(fixed ? fixed : 2)),
  } as linear
}

const createFocusNode = (linear1: linear, linear2: linear, fixed?: number): point => {
  const x = (linear2.b - linear1.b) / (linear1.k - linear2.k)
  const y = linear1.k * x + linear1.b
  return {
    x: Number(x.toFixed(fixed ? fixed : 2)),
    y: Number(y.toFixed(fixed ? fixed : 2)),
  } as point
}

export { createLinearFunction, createFocusNode }
