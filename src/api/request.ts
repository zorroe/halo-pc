// 封装 fetch，带 cookie 持久化
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

export async function request(path: string, data: Record<string, any> = {}) {
  const cookie = getCookie()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (cookie) headers['Cookie'] = cookie

  const res = await fetch(`${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })

  // 如果响应头里有 set-cookie，保存起来
  const sc = res.headers.get('set-cookie')
  if (sc) {
    const cookieStr = sc.split(';')[0]
    saveCookie(cookieStr)
  }

  return res.json()
}
