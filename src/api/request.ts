import axios from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

// 音乐 API 统一前缀
const MUSIC_API_PREFIX = '/api/music'

// 封装 axios，带 cookie 持久化
// 所有请求统一使用 POST，body 中自动附加时间戳字段
const COOKIE_KEY = 'ncm_cookie'

export function getCookie() {
  return localStorage.getItem(COOKIE_KEY) || ''
}

export function saveCookie(cookie: string) {
  localStorage.setItem(COOKIE_KEY, cookie)
}

export function clearCookie() {
  localStorage.removeItem(COOKIE_KEY)
}

const instance = axios.create({
  baseURL: MUSIC_API_PREFIX,
  timeout: 10000,
})

// 请求拦截器：自动在 body 中注入时间戳字段
instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const cookie = getCookie()
  if (cookie) {
    config.headers['Cookie'] = cookie
  }

  // 所有 POST 请求自动在 data 中追加时间戳
  if (config.method?.toLowerCase() === 'post') {
    const data = config.data || {}
    config.data = {
      ...data,
      timestamp: Date.now(),
    }
  }

  console.log(`[API] POST ${config.baseURL}${config.url}`, config.data)
  return config
})

// 响应拦截器：自动保存 cookie，直接返回 data 部分
instance.interceptors.response.use((res: AxiosResponse) => {
  const headers = res.headers

  // 从响应 header 的 set-cookie 取
  const sc = headers['set-cookie']
  if (sc) {
    const cookieStr = Array.isArray(sc) ? sc[0].split(';')[0] : String(sc).split(';')[0]
    saveCookie(cookieStr)
  }

  // 同时兼容 body 中返回的 cookie（如 NMTID 等）
  const body = res.data as any
  if (body?.cookie) {
    const cookieStr = Array.isArray(body.cookie) ? body.cookie.join(';') : body.cookie
    saveCookie(cookieStr)
  }

  console.log(`[API] response ${res.config.url}:`, body)
  return body
}, (err) => {
  console.error(`[API] error ${err.config?.url}:`, err.message)
  return Promise.reject(err)
})

// 统一 POST 入口（路径不带前缀，拦截器自动加上）
export async function request<T = any>(path: string, data: Record<string, any> = {}): Promise<T> {
  return instance.post(path, data) as any
}
