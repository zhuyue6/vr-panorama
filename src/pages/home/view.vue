<template>
    <div class="container">
        <div class="panorama" ref="panoramaRef"></div>
        <div class="suspension">
          <div class="sceneListContainer">
            <div class="sceneListScrollContainer" ref="sceneListRef">
              <div class="sceneList" v-show="state.scene.visible" >
                <div 
                    :class="{ 
                        scene: true,
                        select: state.scene.select?.src === scene.src
                    }" 
                    @click="selectScene(scene)"
                    :style="{
                        backgroundImage: `url(${scene.src})`,
                        backgroundSize: 'cover'
                    }"
                    :key="scene.src"
                    v-for="scene of state.scene.list"
                >
                    <div class="sceneContent">
                        {{ scene.text }}
                    </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="controls">
            <div class="leftControls">
              <div class="controlItem">
                <div class="controlIcon" @click="sceneVisibleChange">
                  <van-icon v-if="!state.scene.visible" name="ascending" size="26" />
                  <van-icon v-if="state.scene.visible" name="descending" size="26" />
                </div>
                <span class="text">场景切换</span>
              </div>
            </div>
            <div class="rightControls">
              <div class="controlItem">
                <div class="controlIcon" @click="sceneVisibleChange">
                  <van-icon v-if="!state.scene.visible" name="ascending" size="26" />
                  <van-icon v-if="state.scene.visible" name="descending" size="26" />
                </div>
                <span class="text">足迹</span>
              </div>
              <div class="controlItem">
                <div class="controlIcon" @click="sceneVisibleChange">
                  <van-icon v-if="!state.scene.visible" name="ascending" size="26" />
                  <van-icon v-if="state.scene.visible" name="descending" size="26" />
                </div>
                <span class="text">分享</span>
              </div>
              <div class="controlItem">
                <div class="controlIcon" @click="sceneVisibleChange">
                  <van-icon v-if="!state.scene.visible" name="ascending" size="26" />
                  <van-icon v-if="state.scene.visible" name="descending" size="26" />
                </div>
                <span class="text">简介</span>
              </div>
              <div class="controlItem">
                <div class="controlIcon" @click="sceneVisibleChange">
                  <van-icon v-if="!state.scene.visible" name="ascending" size="26" />
                  <van-icon v-if="state.scene.visible" name="descending" size="26" />
                </div>
                <span class="text">0</span>
              </div>
              <div class="controlItem">
                <div class="controlIcon" @click="sceneVisibleChange">
                  <van-icon v-if="!state.scene.visible" name="ascending" size="26" />
                  <van-icon v-if="state.scene.visible" name="descending" size="26" />
                </div>
                <span class="text">说一说</span>
              </div>
            </div>
          </div>
       </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, reactive, onUnmounted } from 'vue'
import { createPanorama, type Panorama } from '@/panorama'
import BScroll from 'better-scroll'

import snow from './snow.jpg'
import sun from './sun.jpg'

const props = defineProps<{
    urls: string[],
}>()

interface PanoramaImage {
    text: string,
    src: string
  }

interface State {
  scene: {
    visible: boolean
    select: PanoramaImage | null
    list: PanoramaImage[]
  }
  panorama: Panorama | null,
  bScroll: BScroll | null
}

const state: State = reactive({
  scene: {
    visible: true,
    select: null,
    list: [{ 
      text: '雪景',
      src: snow 
    }, { 
      text: '阳光',
      src: sun 
    }]
  },
  panorama: null,
  bScroll: null
})

function sceneVisibleChange() {
  state.scene.visible = !state.scene.visible
}

const panoramaRef = ref<HTMLDivElement | null>(null)
  const sceneListRef = ref<HTMLDivElement | null>(null)

function selectScene(scene: PanoramaImage) {
  state.scene.select = scene
  state.panorama?.setMesh(scene.src)
}

onMounted(async () => {
    state.panorama = await createPanorama(panoramaRef.value as HTMLDivElement)
    selectScene(state.scene.list[0]);
    state.panorama.setMesh(state.scene.select?.src as string)
    state.bScroll = new BScroll(sceneListRef.value as HTMLDivElement, {
      scrollX: true,
    })
})

onUnmounted(()=>{
  state.panorama?.destroy()
  state.bScroll?.destroy()
})
</script>
<style scoped lang="less">
@import '@/styles/common';
.container {
    .mixin.container();
    position: relative;
    .panorama {
        height: 0;
        flex-grow: 1;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
    .suspension {
      .mixin.flex(center, center, column);
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      .sceneListContainer {
        .mixin.flex();
        padding: 0 10px;
        background-color: @transparent-black;
        width: 100%;
        .sceneListScrollContainer {
          display: flex;
          overflow: hidden;
        }
      }
      .sceneList {
          height: 80px;
          .mixin.flex();
          .scene {
              border: 2px solid @white;
              flex-shrink: 0;
              cursor: pointer;
              display: flex;
              align-items: flex-end;
              border-radius: 6px;
              width: 100px;
              height: 60px;
              margin-left: 10px;
              &.select {
                border-color: @primary;
              }
              .sceneContent {
                  width: 100%;
                  height: 20px;
                  .mixin.flex();
                  background-color: @transparent-black;
                  color: #fff;
              }
          }
      }
      .controlItem {
          cursor: pointer;
          .mixin.flex(center, center, column);
          margin-right: 12px;
          .controlIcon {
            .mixin.transparent-circle(40px);
            background-color: @transparent-black;
            margin-bottom: 6px;
          }
          .text {
            color: @white;
          }
        }
      .controls{
        margin-top: 6px;
        padding: 0 12px;
        width: 100%;
        margin-bottom: 10px;
        .mixin.flex(space-between);
        .leftControls, .rightControls {
          .mixin.flex();
        }
      }
    }
}
</style>
