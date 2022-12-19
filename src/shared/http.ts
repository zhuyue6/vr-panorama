import axios, { type AxiosInstance, type AxiosResponse } from 'axios'

const http: AxiosInstance = axios.create({
    timeout: 10000,
})

export function get<T>(
    url: string,
    params?: {
        [index: string]: any
    },
    data?: {
        [index: string]: any
    }
): Promise<AxiosResponse<T>> {
    return http.get<T>(url, {
        params,
        data,
    })
}

export function post<T>(
    url: string,
    data?: {
        [index: string]: any
    },
    params?: {
        [index: string]: any
    }
): Promise<AxiosResponse<T>> {
    return http.post<T>(url, data, {
        params,
    })
}
