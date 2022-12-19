import { shallowRef, onMounted, onUnmounted } from 'vue'

export function useDaysTimeRange(days: number) {
    const nowTime = new Date()
    const interval = nowTime.getTime() - 1000 * 60 * 60 * 24 * days
    const intervalTime = new Date(interval)
    const timeRange = shallowRef<Date[]>([intervalTime, nowTime])
    return timeRange
}

export function useTerminalList(hasAll = true) {
    const list = shallowRef<Option[]>([
        {
            text: '小程序',
            value: '1',
        },
        {
            text: 'h5',
            value: '2',
        },
        {
            text: 'app',
            value: '3',
        },
    ])
    if (hasAll)
        list.value.unshift({
            text: '全部',
            value: '0',
        })
    return list
}

export function useListenWindowOnresize(cb: () => void) {
    onMounted(() => window.addEventListener('resize', cb))
    onUnmounted(() => window.removeEventListener('resize', cb))
}
