<template>
    <div class="container">
        <View :urls="images" />
    </div>
</template>
<script setup lang="ts">
import View from './view.vue'
import snow from './snow.jpg'
import sun from './sun.jpg'

const images = [snow, sun]
</script>
<style scoped lang="less">
@import '@/styles/common';
.container {
    .mixin.container();
}
</style>
