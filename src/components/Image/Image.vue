<script setup lang="ts">
  import  { CtxObject } from '@/types/index.js'
  import { watchEffect, inject, onBeforeUnmount } from 'vue'
  import { setQueue, deleteQueue, DrawType } from '@/hooks/useDraw'
  import {getSpriteCenter} from '@/utils'

  interface Props {
    src?: string
    element?: HTMLImageElement
    name?: string
    x?: number
    y?: number
    width?: number
    height?: number
    zIndex?: number
    rotate?: number
  }
  const props = withDefaults(defineProps<Props>(), {
    name: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })
  const world = inject('world') as CtxObject
  const ImageGroup = inject('ImageGroup') as any
  let renderData: DrawType = {
        type: 'Image',
        drawData: [],
        zIndex: undefined,
        oldZIndex: undefined,
        render,
      }
  
  function render() {
    const {x: centerX, y: centerY} = getSpriteCenter(props)
    const ctx = world.ctx
    ctx.save();
    let resetData: any = [...renderData.drawData]
    if(props.rotate) {
      if(resetData.length === 5) {
        resetData[3] = -Math.floor(props.width / 2)
        resetData[4] = -Math.floor(props.height / 2)
      } else if(resetData.length === 9) {
        resetData[5] = -Math.floor(props.width / 2)
        resetData[6] = -Math.floor(props.height / 2)
      }
      ctx.translate(centerX, centerY);
      //todo 位置在原点了，x/y以中心点画出图 0-width/height一半
      ctx.rotate(props.rotate);
    }
    ctx.drawImage.apply(world.ctx, resetData)
    ctx.restore();
  }
  
  function initHasGroup() {
    if(!ImageGroup) {
      return
    }

    watchEffect(() => {
      const getPosition = ImageGroup.value
      if(!getPosition) {
        return
      }
      renderData.drawData = ImageGroup.value(
        props.name, 
        props.x || ImageGroup.x || 0, 
        props.y || ImageGroup.y || 0, 
        props.width || ImageGroup.width || 0, 
        props.height || ImageGroup.height || 0
      )
      renderData.rotate = props.rotate ?? ImageGroup.rotate
      renderData.oldZIndex = renderData.zIndex
      renderData.zIndex = props.zIndex ?? ImageGroup.zIndex
      setQueue(renderData)
    }, {
      onTrigger(e) {
        // console.log(e)
      }
    })

    onBeforeUnmount(() => {
      deleteQueue(renderData)
    })
  }
  initHasGroup()
</script>

<template>

    
  
</template>