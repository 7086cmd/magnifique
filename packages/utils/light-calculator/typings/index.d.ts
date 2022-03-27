declare type point = { x: number; y: number }
declare type mirror = {
  focal: number
  radius: number
  type: 'concave' | 'flat' | 'convex'
  focus: point[]
}

declare interface linear {
  k: number
  b: number
}

declare interface parabola {
  a: number
  b: number
  c: number
}

declare interface picture {
  point: point
  virtual: boolean
}

export { point, mirror, linear, parabola, picture }
