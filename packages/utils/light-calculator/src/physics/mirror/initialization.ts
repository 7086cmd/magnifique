import { mirror, point } from '../../../typings'

export function createSphericalMirror(focal: number, radius: number): mirror {
  let result = {
    focal,
    radius,
    type: '',
    focus: [] as point[],
  }
  if (focal < radius) {
    result.type = 'convex'
  } else if (focal > radius) {
    result.type = 'concave'
  } else {
    result.type = 'flat'
  }
  result.focus = [
    {
      x: -1 * focal,
      y: 0,
    } as point,
    {
      x: focal,
      y: 0,
    } as point,
  ]
  return result as mirror
}
