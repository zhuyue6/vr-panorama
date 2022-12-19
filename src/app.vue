<template>
    <div class="root">
        <router-view />
    </div>
</template>

<style scoped lang="less">
@import '@/styles/common';
.root {
    .mixin.container();
}
</style>
