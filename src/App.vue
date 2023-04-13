<script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import World from '@/components/World/World.vue'
  import Image from '@/components/Image/Image.vue'
  import ImageGroup from '@/components/ImageGroup/ImageGroup.vue'

  import imgSrc from '@/assets/flappybird/atlas.png'
  import offset from '@/assets/offset.txt?raw'

  type Pipe = {
    name: string
    x: number
    y: number
    width: number
    height: number
    hasCount: boolean
  }
  // type Pipe<T extends Array<[]>> = {
  //   [index in extends keyof T]: T[K]
  // } | Pipe

  const start = ref(true)
  const bigNumber = reactive(['font_048', 'font_049','font_050','font_051','font_052','font_053','font_054','font_055','font_056','font_057',])
  const nowNumber = ref(0)
  let birdFlyStep = 0
  let time = 0
  const birdStatus = reactive({
    status: 0,
    x: 30,
    y: 220,
    width: 42,
    height: 42,
    initY: 220,
    rotate: 0
  })
  
  //世界位置
  const worldSize = reactive({
    width: 288,
    height: 512
  })

  //分数位置
  const countSize = reactive({
    x: 0,
    y: 30,
    width: 24,
    height: 44
  })

  //准备开始位置
  const getReadySize = reactive({
      x: setCenter(196),
      y: 110,
      width: 196,
      height: 62
  })

  //点击开始位置
  const tutorialSize = reactive({
      x: setCenter(144),
      y: 230,
      width: 114,
      height: 98
  })

  //地板位置
  const landSize = reactive({
    x: 0,
    y: worldSize.height - 122,
    width: 366,
    height: 122,
    offset: 0
  })

  function getPipeInitData(): Pipe[] {
    return [
      {
        name: 'pipe_up',
        x: worldSize.width,
        y: 300,
        width: 52,
        height: 320,
        hasCount: false
      },
      {
        name: 'pipe_down',
        x: worldSize.width,
        y: 0,
        width: 52,
        height: 320,
        hasCount: false
      }
    ]
  }

  //水管位置
  const pipeStatus = reactive<(any[] | Pipe[])[]>([])

  //鸟的位置
  const birdSize = computed(() => {
    return {
      name: `bird0_${birdStatus.status}`,
      x: birdStatus.x,
      y: birdStatus.y,
      width: birdStatus.width,
      height: birdStatus.height,
      rotate: birdStatus.rotate
    }
  })

  const landScrollHander = reactive([
    {
      x: 0,
      y: landSize.y,
      width: landSize.width,
      height: landSize.height
    },
    {
      x: landSize.width,
      y: landSize.y,
      width: landSize.width,
      height: landSize.height
    }
  ])

  const getCount = computed(() => {
    const countArr = (nowNumber.value + '').split('')
    const allWidth = countArr.length * countSize.width
    return countArr.map((item, index) => {
      return {
        x: (countSize.x + countSize.width) * index + setCenter(allWidth) - 5,
        y: countSize.y,
        count: +item
      }
    })
  })

  function landScroll() {
    const loopTime = -(landSize.offset / landSize.width)
    const loop = Math.floor(loopTime) % 2
    if(
        loopTime >= 1 &&
        landScrollHander[+!loop].x + landSize.width <= 0
      ) {
        landScrollHander[+!loop].x = landSize.width
      }
    landSize.offset -= 1
    landScrollHander.forEach(item => {
      item.x -= 1
    })
  }

  function pipeRun() {
    let lastChid
    let firstChid
    let paddingRight
    // debugger
    if(pipeStatus.length) {
       lastChid = pipeStatus[pipeStatus.length - 1][0]
       firstChid = pipeStatus[0][0]
       paddingRight = worldSize.width - (lastChid.x + lastChid.width)
    }
    if(paddingRight === undefined || paddingRight >= 100) {
      let newPipe = getPipeInitData()
      let randomY = getRandom(100, 180)
      let randomH = getRandom(90, 150)
      newPipe[1].y = randomY - newPipe[1].height
      newPipe[0].y = newPipe[1].height + newPipe[1].y + randomH
      pipeStatus.push(newPipe)
      firstChid = newPipe
    }

    if(firstChid && (-firstChid.x >= firstChid.width)) {
      pipeStatus.shift()
    }

    pipeStatus.forEach(item => {
      item.forEach(pipe => {
        pipe.x -= 1
      })
      crashTest(item)
    })
  }

  function crashTest(pipes: Pipe[]) {
    const onePipe = pipes[0]
    const twoPipe = pipes[1]
    const offset = 10
    const birdRight = birdStatus.x + birdStatus.width
    const pipeRight = onePipe.x + onePipe.width 

    if(birdStatus.y + birdStatus.height >= landSize.y) {
      gameOver()
      return
    }

    if(
      
      birdRight >= onePipe.x && 
      birdRight < pipeRight - offset + birdStatus.width && 
      (
        birdStatus.y + birdStatus.height >= onePipe.y + offset ||
        birdStatus.y <= twoPipe.height + twoPipe.y - offset
      )
    ) {
      gameOver()
      return
    }
    

    if(
      !onePipe.hasCount &&
      birdStatus.x <= pipeRight &&
      birdStatus.x > pipeRight - offset
    ) {
      onePipe.hasCount = true
      nowNumber.value++
    }
  }

  function birdJump() {
    birdStatus.initY = birdStatus.y
    time = 0
    console.log('top')
    birdStatus.rotate = -0.7
  }

  function birdRun() {
    time += 0.2
    birdStatus.y = birdStatus.initY - sport(time)
    if(birdStatus.rotate < 1) {
      birdStatus.rotate += 0.04
    }
    if(birdFlyStep < 10) {
      birdFlyStep++
      return
    } else {
      birdFlyStep = 0
    }
    if(birdStatus.status === 2) {
      birdStatus.status = 0
    } else {
      birdStatus.status++
    }
  }
  
  function sport(t: number) {
    return 20 * t - (0.5 * 6 * Math.pow(t , 2))
  }

  function gameOver() {
    start.value = true
  }

  function setCenter(width: number) {
    const worldWidth = Math.floor(worldSize.width / 2)
    const offset = width / 2
    return worldWidth - offset
  }

  function getRandom(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min)
  }

  function reset() {
    birdStatus.y = 220
    birdStatus.initY = 220
    birdStatus.rotate = 0
    time = 0
    start.value = true
    pipeStatus.length = 0
    nowNumber.value = 0
  }
  function ticker() {
    birdRun()
    pipeRun()
    landScroll()
  }
</script>

<template>
  <World :stop-ticker="start" @ticker="ticker" :width="worldSize.width" :height="worldSize.height">
    <image-group 
      :src="imgSrc" 
      :position="offset" 
      :x="count.x" 
      :y="count.y" 
      :width="countSize.width" 
      :height="countSize.height"
      :z-index="3"
      v-for="(count, index) in getCount"

    >
      <template v-for="item in bigNumber" :key="item">
        <Image :name="item" v-if="item === bigNumber[count.count]"></Image>
      </template>
    </image-group>
    <image-group :src="imgSrc" :position="offset">
      <Image 
        name="bg_day" 
        :x="0" 
        :y="0" 
        :width="worldSize.width" 
        :height="worldSize.height"
      />
      <Image 
        name="text_ready" 
        :x="getReadySize.x" 
        :y="getReadySize.y" 
        :width="getReadySize.width" 
        :height="getReadySize.height"
        v-if="start"
      />
      <Image 
        name="tutorial" 
        :x="tutorialSize.x" 
        :y="tutorialSize.y" 
        :width="tutorialSize.width" 
        :height="tutorialSize.height"
        v-if="start"
      />
      <Image 
        :name="birdSize.name" 
        :x="birdSize.x" 
        :y="birdSize.y" 
        :width="birdSize.width" 
        :height="birdSize.height"
        :rotate="birdSize.rotate"
      />
    </image-group>
    <image-group :src="imgSrc" :position="offset">
      <template v-for="two in pipeStatus">
        <Image 
          :name="item.name" 
          :x="item.x" 
          :y="item.y" 
          :width="item.width" 
          :height="item.height"
          :z-index="1"
          v-for="item in two"
        />
      </template>

      <template v-for="item in landScrollHander">
        <Image 
          name="land" 
          :x="item.x" 
          :y="item.y" 
          :width="item.width" 
          :height="item.height"
          :z-index="2"
        />
      </template>
    </image-group>
  </World>
  <button @click="birdJump">跳</button>
  <button @click="start=!start">开始</button>
  <button @click="reset">重置</button>

  <div v-for="item in landScrollHander">{{item.x}}</div>
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