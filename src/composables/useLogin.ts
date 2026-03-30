import { ref } from 'vue'
import { getLoginStatus } from '../api/login'
import { saveCookie } from '../api/request'

export interface UserInfo {
  id: number
  nickname: string
  avatarUrl: string
  [key: string]: any
}

export const isLoggedIn = ref(false)
export const userInfo = ref<UserInfo | null>(null)

export async function checkLoginStatus() {
  try {
    const res = await getLoginStatus()
    if (res.data?.profile) {
      isLoggedIn.value = true
      userInfo.value = res.data.profile
      return true
    }
  } catch (e) {
    console.error('Check login status failed:', e)
  }
  isLoggedIn.value = false
  userInfo.value = null
  return false
}

export function setLogin(profile: any, cookie?: string) {
  userInfo.value = profile
  isLoggedIn.value = true
  if (cookie) {
    const cookieStr = Array.isArray(cookie) ? cookie.join(';') : cookie
    saveCookie(cookieStr)
  }
}

export function clearLogin() {
  userInfo.value = null
  isLoggedIn.value = false
}
