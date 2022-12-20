<template>
    <div class="container" ref="componentRef">
        <div class="panorama" ref="panoramaRef"></div>
        <div class="suspension">
            <div class="suspensionTop">
                <div>
                    <div class="controlIcon" @click="fullScreen">
                        <van-icon
                            color="#fff"
                            :name="
                                state.fullScreen ? 'ascending' : 'descending'
                            "
                            size="26"
                            :title="state.fullScreen ? '关闭全屏' : '全屏'"
                        />
                    </div>
                </div>
            </div>
            <div class="suspensionContent">
                <div
                    class="sceneText"
                    v-show="state.scene.visible || state.scene.loading"
                >
                    <span v-show="!state.scene.loading">{{
                        state.scene.select?.text
                    }}</span>
                    <van-loading
                        size="30px"
                        type="spinner"
                        v-show="state.scene.loading"
                    />
                </div>
                <div class="sceneListContainer" v-show="state.scene.visible">
                    <div class="sceneListScrollContainer" ref="sceneListRef">
                        <div class="sceneList">
                            <div
                                :class="{
                                    scene: true,
                                    select:
                                        state.scene.select?.src === scene.src,
                                }"
                                @click="selectScene(scene)"
                                :key="scene.src"
                                v-for="scene of props.images"
                            >
                                <img class="sceneImage" :src="scene.src" />
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
                            <div
                                class="controlIcon"
                                @click="sceneVisibleChange"
                            >
                                <van-icon
                                    color="#fff"
                                    :name="
                                        state.scene.visible
                                            ? 'ascending'
                                            : 'descending'
                                    "
                                    size="26"
                                />
                            </div>
                            <span class="text">场景切换</span>
                        </div>
                    </div>
                    <!-- <div class="rightControls">
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
              </div> -->
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, reactive, onUnmounted, watch, nextTick } from 'vue'
import { createPanorama, type Panorama } from '@/panorama'
import BScroll from 'better-scroll'

const props = defineProps<{
    images: PanoramaImage[]
}>()

interface State {
    scene: {
        loading: boolean
        visible: boolean
        select: PanoramaImage | null
    }
    fullScreen: boolean
    panorama: Panorama | null
    bScroll: BScroll | null
}

const state: State = reactive({
    scene: {
        loading: false,
        visible: false,
        select: null,
    },
    fullScreen: false,
    panorama: null,
    bScroll: null,
})

watch(
    () => state.scene.visible,
    (visible) => {
        // 打开面板时候加载滑动功能
        if (visible && !state.bScroll) {
            nextTick(() => {
                state.bScroll = new BScroll(
                    sceneListRef.value as HTMLDivElement,
                    {
                        scrollX: true,
                        click: true,
                    }
                )
            })
        }
    }
)

function sceneVisibleChange() {
    state.scene.visible = !state.scene.visible
}

const componentRef = ref<HTMLDivElement | null>(null)
const panoramaRef = ref<HTMLDivElement | null>(null)
const sceneListRef = ref<HTMLDivElement | null>(null)

function selectScene(scene: PanoramaImage, isLoading = true) {
    if (state.scene.loading) return
    state.scene.select = scene
    if (isLoading) state.scene.loading = true
    state.panorama
        ?.setMesh(scene, isLoading)
        .then(() => (state.scene.loading = false))
}

async function refresh() {
    if (!(props.images.length > 0)) return
    if (!state.panorama)
        state.panorama = await createPanorama(
            panoramaRef.value as HTMLDivElement
        )
    selectScene(props.images[0], false)
}

function fullScreen() {
    state.fullScreen = !state.fullScreen
    if (state.fullScreen) {
        (<HTMLDivElement>componentRef.value).requestFullscreen()
        return
    }
    document.exitFullscreen()
}

watch(props.images, refresh)

onMounted(refresh)

onUnmounted(() => {
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
        pointer-events: none;
        .mixin.flex(space-between, flex-start, column);
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
        .suspensionTop {
            pointer-events: auto;
            width: 100%;
            padding: 20px;
            .mixin.flex(flex-end);
        }
        .controlIcon {
            .mixin.transparent-circle(40px);
            background-color: @transparent-black;
            margin-bottom: 6px;
            cursor: pointer;
        }
        .suspensionContent {
            pointer-events: auto;
            width: 100%;
            .sceneText {
                .mixin.flex();
                color: @white;
                font-size: @title;
                margin-bottom: 50px;
            }
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
                    .sceneImage {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100px;
                        height: 60px;
                    }
                    position: relative;
                    overflow: hidden;
                    border: 2px solid @white;
                    z-index: 0;
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
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        .mixin.flex();
                        background-color: @transparent-black;
                        color: #fff;
                    }
                }
            }

            .controlItem {
                .mixin.flex(center, center, column);
                margin-right: 12px;
                .text {
                    color: @white;
                }
            }
            .controls {
                margin-top: 6px;
                padding: 0 12px;
                width: 100%;
                margin-bottom: 10px;
                .mixin.flex(space-between);
                .leftControls,
                .rightControls {
                    .mixin.flex();
                }
            }
        }
    }
}
</style>
