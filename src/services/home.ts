import { http } from '@/shared'

interface ListParams {
    [index: string]: any
}

interface ListResponse {
    [index: string]: any
}

export function getList(params: ListParams) {
    return http.get<ListResponse>('')
}
