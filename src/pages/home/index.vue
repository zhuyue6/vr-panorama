<template>
    <div class="container">
        <Panorama :images="images" />
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import Panorama from '@/components/panorama/index.vue'

import snow from '@/images/snow.jpg'
import sun from '@/images/sun.jpg'
import test from '@/images/test.jpeg'

import house from '@/images/house.jpg'
import temple from '@/images/sun_temple_stripe.jpg'
import hotel from '@/images/hotel.png'
import ground from '@/images/ground.jpg'
import room from '@/images/room.jpg'

const images = ref<PanoramaImage[]>([
    {
        id: 1,
        text: '雪景',
        src: snow,
    },
    {
        id: 2,
        text: '阳光',
        src: sun,
    },
    {
        id: 3,
        text: '花园',
        src: test,
    },
    {
        id: 4,
        text: '宮殿',
        src: temple,
        type: 'cube',
    },
    {
        id: 5,
        text: '房子',
        src: house,
    },
    {
        id: 6,
        text: '酒店',
        src: hotel,
    },
    {
        id: 7,
        text: '球场',
        src: ground,
    },
    {
        id: 8,
        text: '家',
        src: room,
    },
])
</script>
<style scoped lang="less">
@import '@/styles/common';
.container {
    .mixin.container();
}
</style>
