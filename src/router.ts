import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { Component } from 'vue'

interface RouteMenu {
    icon?: Component
    isNavigator?: boolean
    children?: (RouteRecordRaw & RouteMenu)[]
}

const routes: (RouteRecordRaw & RouteMenu)[] = [
    {
        name: '首页',
        path: '/home',
        component: () => import('./pages/home/index.vue'),
    },
    {
        path: '',
        redirect: '/home',
    },
    {
        path: '/:path',
        redirect: '/home',
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export { routes }

export default router
