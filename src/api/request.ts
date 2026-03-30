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

export async function request(
  path: string,
  data: Record<string, any> = {},
  method: 'GET' | 'POST' = 'POST'
) {
  const cookie = getCookie()
  const headers: Record<string, string> = {}
  if (cookie) headers['Cookie'] = cookie

  // GET 请求用 query 参数，POST 请求用 JSON body
  let url = path
  if (method === 'GET' && Object.keys(data).length > 0) {
    const params = new URLSearchParams(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    )
    url += '?' + params.toString()
  } else if (method === 'POST') {
    headers['Content-Type'] = 'application/json'
  }

  console.log(`[API] ${method} ${url}`, data)

  const res = await fetch(url, {
    method,
    headers,
    ...(method === 'POST' ? { body: JSON.stringify(data) } : {}),
  })

  const json = await res.json()
  console.log(`[API] response ${path}:`, json)

  // 如果响应头里有 set-cookie，保存起来
  const sc = res.headers.get('set-cookie')
  if (sc) {
    const cookieStr = sc.split(';')[0]
    saveCookie(cookieStr)
  }

  return json
}
