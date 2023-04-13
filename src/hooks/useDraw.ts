import type { UnwrapNestedRefs } from 'vue'
export interface DrawType {
  drawData: any
  type: string
  zIndex?: number
  oldZIndex?: number
  rotate?: Number,
  render?: () => any
}
export type RefDrawType = DrawType
let ctx: CanvasRenderingContext2D
let drawNoZIndexQueue: Set<RefDrawType> = new Set()
let drawProZIndexQueue: Set<RefDrawType> = new Set()
let drawMinZIndexQueue: Set<RefDrawType> = new Set()
let canRender = true
let canSortMix = false
let canSortMax = false
const queueMap = [drawMinZIndexQueue, drawNoZIndexQueue, drawProZIndexQueue]
const nextTick = async (min: boolean, max: boolean) => {
  canSortMix = canSortMix || min
  canSortMax = canSortMax || max
  if (!canRender) {
    return Promise.reject()
  }
  canRender = false
  await Promise.resolve()

  const cacheMin = canSortMix
  const cacheMan = canSortMax
  canRender = true
  canSortMix = false
  canSortMax = false
  return [cacheMin, cacheMan]
}


export function initCtx(c: CanvasRenderingContext2D) {
  ctx = c
}

export function deleteQueue(drawRender: RefDrawType) {
  const hasAdd = queueMap.findIndex(item => item.has(drawRender))
  if(hasAdd > -1) {
    queueMap[hasAdd].delete(drawRender)
    needSortRennder(drawRender.zIndex === 0, drawRender.zIndex === 2)
  }
}

export async function setQueue(drawRender: RefDrawType) {
  const hasAdd = queueMap.findIndex(item => item.has(drawRender))
  const newZIndex = drawRender.zIndex
  const oldZIndex = drawRender.oldZIndex
 
  if (newZIndex && (newZIndex === oldZIndex)) {
    needSortRennder(false, false)
    return
  }

  if (hasAdd > -1) {
    if (newZIndex) {
      //drawNoZIndexQueue现在有ZIndex之前没有
      if(hasAdd === 1) {
        let isMin = newZIndex > 0 ? 2 : 0
        queueMap[1].delete(drawRender)
        queueMap[isMin].add(drawRender)
        needSortRennder(isMin === 0, isMin === 2)
      } else if(hasAdd === 0) {
        if (newZIndex > 0) {
          queueMap[0].delete(drawRender)
          queueMap[2].add(drawRender)
          needSortRennder(true, true)
        } else {
          //顺序没变
          needSortRennder(true, false)
        }
      } else {
        if (newZIndex < 0) {
          queueMap[2].delete(drawRender)
          queueMap[0].add(drawRender)
          needSortRennder(true, true)
        } else {
          //顺序没变
          needSortRennder(false, true)
        }
      }
    } else {
      //drawNoZIndexQueue之前有ZIndex现在没有
      if(hasAdd === 0 || hasAdd ===2) {
        queueMap[hasAdd].delete(drawRender)
        queueMap[1].add(drawRender)
        needSortRennder(hasAdd === 0, hasAdd === 2)
      } else {
        //顺序没变
        needSortRennder(false, false)
      }
    }
  } else {
    if (drawRender.zIndex === 3) {
      // debugger
    }
    if (!newZIndex) {
      queueMap[1].add(drawRender)
      needSortRennder(false, false)
    } else if (newZIndex > 0) {
      queueMap[2].add(drawRender)
      needSortRennder(false, true)
    } else {
      queueMap[0].add(drawRender)
      needSortRennder(true, false)
    }
  }
}

function renderCanvas(renderData: RefDrawType) {
  renderData.render?.()
}

async function needSortRennder(min: boolean, max: boolean) {
  // console.log(queueMap)
  try {
    const [ needMix, needMax ] = await nextTick(min, max)
    
    console.log('render')
    ctx.clearRect(0, 0, 375, 667)
    needMix ? sortRenderQueue(0) : renderQueue(0)
    renderQueue(1)
    needMax ? sortRenderQueue(2) : renderQueue(2)
  } catch(e) {
    
  }
}

function renderQueue(index: number) {
  let drawZIndexQueue = queueMap[index]
  if (drawZIndexQueue.size === 0) {
    return
  }

  drawZIndexQueue.forEach(item => {
    renderCanvas(item)
  })
}

function sortRenderQueue(index: number) {
  let drawZIndexQueue = queueMap[index]
  if (drawZIndexQueue.size === 0) {
    return
  }
  let renderZIndexFunc: UnwrapNestedRefs<DrawType>[] = [...drawZIndexQueue]
  let min: any = 0
  let temp: any

  if(renderZIndexFunc.length === 1) {
    renderCanvas(renderZIndexFunc[0])
    return
  }
  
  drawZIndexQueue.clear()

  for (let i = 0; i < renderZIndexFunc.length - 1; i++) {
    min = i
    for (let j = i + 1; j < renderZIndexFunc.length; j++) {
      let minRender = renderZIndexFunc[min]
      let nextRender = renderZIndexFunc[j]
      let minZIdex = minRender.zIndex as number
      let nextZIdex = nextRender.zIndex as number
      if (nextZIdex < minZIdex) {
        min = j
      }
    }

    temp = renderZIndexFunc[i]
    renderZIndexFunc[i] = renderZIndexFunc[min]
    renderZIndexFunc[min] = temp
    drawZIndexQueue.add(renderZIndexFunc[i])
    renderCanvas(renderZIndexFunc[i])
  }
  drawZIndexQueue.add(renderZIndexFunc[renderZIndexFunc.length - 1])
  renderCanvas(renderZIndexFunc[renderZIndexFunc.length - 1])
}