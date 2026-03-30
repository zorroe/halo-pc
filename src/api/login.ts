import { saveCookie, clearCookie, request } from './request'

// 发送验证码
export async function sendCaptcha(phone: string) {
  return request('/captcha/sent', { phone, ctcode: 86 })
}

// 手机号 + 验证码登录
export async function loginWithCaptcha(phone: string, captcha: string) {
  await request('/captcha/verify', { phone, captcha, ctcode: 86 })
  const res = await request('/login/cellphone', { phone, captcha, countrycode: 86 })
  // 登录成功时 result.cookie 字段里有 cookie
  if (res.code === 200 && res.cookie) {
    const cookieStr = Array.isArray(res.cookie) ? res.cookie.join(';') : res.cookie
    saveCookie(cookieStr)
  }
  return res
}

// 获取二维码 key
export async function getQrKey() {
  return request('/login/qr/key')
}

// 生成二维码图片
export async function getQrImage(key: string) {
  return request('/login/qr/create', { key, qrimg: 1 })
}

// 检查二维码扫码状态 (GET, query参数)
export async function checkQrStatus(key: string) {
  return request('/login/qr/check', { key }, 'GET')
}

// 获取登录状态
export async function getLoginStatus() {
  return request('/login/status', {})
}

// 退出登录
export async function logout() {
  clearCookie()
  return request('/logout', {})
}
