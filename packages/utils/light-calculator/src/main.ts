import { createImaging } from './physics/calc/imaging'
import { createSphericalMirror } from './physics/mirror/initialization'

const mirror = createSphericalMirror(10, 12)
console.log(
  createImaging(mirror, {
    x: -2,
    y: 1,
  })
)
