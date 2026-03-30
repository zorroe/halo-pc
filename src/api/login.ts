// 音乐 API - 通过 Vite 代理转发到后端服务
const API = ''

async function request(path: string, data: Record<string, any> = {}) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

// 发送验证码
export async function sendCaptcha(phone: string) {
  return request('/captcha/sent', { phone, ctcode: 86 })
}

// 手机号 + 密码登录
export async function loginWithPassword(phone: string, password: string) {
  return request('/login/cellphone', { phone, password, countrycode: 86 })
}

// 手机号 + 验证码登录（需先验证 captcha）
export async function loginWithCaptcha(phone: string, captcha: string) {
  // 先验证验证码（服务端会校验）
  await request('/captcha/verify', { phone, captcha, ctcode: 86 })
  // 验证通过后再登录
  return request('/login/cellphone', { phone, captcha, countrycode: 86 })
}

// 获取二维码 key
export async function getQrKey() {
  return request('/login/qr/key')
}

// 生成二维码图片
export async function getQrImage(key: string) {
  return request('/login/qr/create', { key, qrimg: true })
}

// 检查二维码扫码状态
export async function checkQrStatus(key: string) {
  return request('/login/qr/check', { key })
}

// 获取登录状态
export async function getLoginStatus() {
  return request('/login/status', {})
}

// 退出登录
export async function logout() {
  return request('/logout', {})
}
