<script setup lang="ts">
  import { watchEffect, shallowReactive, inject, provide } from 'vue'
  import { useImage } from '@/hooks/useImage'
  type Props = {
    src?: string
    element?: HTMLImageElement
    position?: string
    x?: number
    y?: number
    width?: number
    height?: number
    zIndex?: number
  }
  const props = withDefaults(defineProps<Props>(), {
    src: ''
  })
  let imgPosFun = shallowReactive({
    value: null,
    x: props.x,
    y: props.y,
    width: props.width,
    height: props.height,
    zIndex: props.zIndex
  })
  
  provide('ImageGroup', imgPosFun)
  useImage(props.src, props.position).then(res => {
    imgPosFun.value = res
    watchEffect(() => {
      imgPosFun.x = props.x
      imgPosFun.y = props.y
      imgPosFun.width = props.width
      imgPosFun.height = props.height
      imgPosFun.zIndex = props.zIndex
    })
  })
</script>

<template>
  <slot>
    
  </slot>
</template>