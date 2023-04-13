import { ref } from 'vue'

// type ImageOffset<T extends object> = {
//   [K in keyof T]: T[K] extends HTMLImageElement ? 
//   T[K] : T[K] extends object ? 
//   ImageOffset<T[K]> : never
// }
// function getOffsetJosn<T extends object>(target: T): ImageOffset<T>
let imageCache = new Map()

function getOffsetJosn(imgElement: HTMLImageElement, offset: string) {
  
  function desParam(col: string) {
    const imgWidth = 1024
    const imgHeight = 1024
    const [name, width, height, sx, sy, ex, ey] = col.split(/\s+/)
    return {
      name,
      sx: Math.round(Number(sx) * imgWidth),
      sy: Math.round(Number(sy) * imgHeight),
      sWidth: Math.round(Number(width)),
      sHeight: Math.round(Number(height)),
    } 
  }

  const row = offset.split(/\n/)
  let map: any = {}
  map.image = imgElement
  row.forEach(item => {
    let offset = desParam(item)
    map[offset.name] = { ...offset }
  })
  return map
}

async function initImage(src: string) {
  const img = new Image()
  img.src = src
  return await new Promise(resolve => {
    img.onload = () => {
      resolve(img)
    }
  })
}
export async function useImage(src: string, position?: string) {
  const imgEl: any = await initImage(src)
  if(!position) {
    return imgEl
  }
  let offset: any
  if (!imageCache.has(src)) {
    offset = await getOffsetJosn(imgEl, position)
    imageCache.set(src, offset)
  } else {
    offset = imageCache.get(src)
  }
  
  return (name: string,dx: number, dy: number, dWidth: number, dHeight: number): any => {
    let { sx, sy, sWidth, sHeight } = offset[name]
    return [offset.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight] as const
  }
}