export type SpriteSize = {
  x: number
  y: number
  width: number
  height: number
} 

export type Sprite<T extends object = SpriteSize> = {
  [K in keyof T]: T[K]
} | SpriteSize

export type SpriteCenter = Pick<SpriteSize, 'x' | 'y'>

export function getSpriteCenter(sprite: Sprite): SpriteCenter {
  return {
    x: Math.floor(sprite.width / 2) + sprite.x,
    y: Math.floor(sprite.height / 2) + sprite.y
  }
} 