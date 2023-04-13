<script setup lang="ts">
  import { ref, reactive, onMounted, provide, watchEffect, useAttrs  } from 'vue'
  import {initCtx} from '@/hooks/useDraw'

  interface Props {
    width?: number
    height?: number
    ticker?: () => void
    stopTicker: boolean
  }

  interface Emits {
    (e: 'ticker', c?: number): void
  }

  const props = withDefaults(defineProps<Props>(), {
    width: 0,
    height: 0,
    stopTicker: false
  })

  const emit = defineEmits<Emits>()

  const attrs = useAttrs()
  const canvas: any = ref(null)
  let isReady = false
  let readyResolve: Function
  let ctxObject = reactive({
    ready: async () => {
      if(isReady) return isReady
      return await new Promise(resolve => {
        readyResolve = resolve
      })
    },
    canvas: {} as HTMLCanvasElement,
    ctx: {} as CanvasRenderingContext2D
  })
  provide('world', ctxObject)
  
  onMounted(() => {
    const canvasDom = canvas.value as HTMLCanvasElement
    ctxObject.canvas = canvasDom
    ctxObject.ctx = canvasDom.getContext('2d') as CanvasRenderingContext2D
    isReady = true
    initCtx(ctxObject.ctx)
    readyResolve?.(isReady)
    watchEffect(function ticker() {
      if(props.stopTicker && !attrs.ticker) {
        return
      }
      window.requestAnimationFrame(() => {
        ticker()
        emit('ticker')
      })
    }) 
  })
</script>

<template>
  <canvas class="canvas" :style="{width: width + 'px', height: height + 'px'}" :width="width" :height="height" ref="canvas">
    <slot></slot>
  </canvas>
</template>

<style>
  body {
    padding: 0;
    margin: 0;
  }

  .canvas {
    width: 375px;
    height: 667px;
  }
</style>