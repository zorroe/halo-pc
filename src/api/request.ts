import axios from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

// 音乐 API 统一前缀
const MUSIC_API_PREFIX = '/api/music'

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
  withCredentials: true, // 跨域携带 cookie
})

// 请求拦截器：POST body 追加时间戳，同时把 cookie 通过 header 传给后端
instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const cookie = getCookie()
  if (cookie) {
    // 用自定义 header 传 cookie（避免浏览器安全限制）
    config.headers['X-Cookie'] = cookie
  }

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

  const sc = headers['set-cookie']
  if (sc) {
    const cookieStr = Array.isArray(sc) ? sc[0].split(';')[0] : String(sc).split(';')[0]
    saveCookie(cookieStr)
  }

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

export async function request<T = any>(path: string, data: Record<string, any> = {}): Promise<T> {
  return instance.post(path, data) as any
}
