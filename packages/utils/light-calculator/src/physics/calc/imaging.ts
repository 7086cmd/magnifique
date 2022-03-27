import { mirror, point } from '../../../typings'
import { createLinearFunction, createFocusNode } from '../../functions/linear/create'

const createImaging = (mirror: mirror, point: point): point => {
  if (mirror.type === 'flat') {
    return {
      x: point.x * -1,
      y: point.y,
    }
  } else {
    const useFocus = Number(mirror.type === 'convex') * Number(point.x > 0)
    const LightCenter: point = {
      x: 0,
      y: 0,
    }
    const lightCenterLinear = createLinearFunction(point, LightCenter)
    const focusLinear = createLinearFunction(
      {
        x: 0,
        y: point.y,
      },
      mirror.focus[useFocus]
    )
    return createFocusNode(lightCenterLinear, focusLinear)
  }
}

export { createImaging }
