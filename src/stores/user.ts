import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getLoginStatus } from '../api/login'
import { saveCookie, getCookie } from '../api/request'

export interface UserInfo {
  id: number
  nickname: string
  avatarUrl: string
  level?: number
  follows?: number
  followeds?: number
  playlistCount?: number
  gender?: number
  birthday?: number
  province?: number
  city?: number
  signature?: string
  [key: string]: any
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const isLoggedIn = computed(() => !!userInfo.value?.id)

  // 从 localStorage 恢复
  const stored = localStorage.getItem('halo_user')
  if (stored) {
    try {
      userInfo.value = JSON.parse(stored)
    } catch (e) {
      localStorage.removeItem('halo_user')
    }
  }

  // 登录后保存
  function setLogin(profile: UserInfo, cookie?: string) {
    userInfo.value = profile
    localStorage.setItem('halo_user', JSON.stringify(profile))
    if (cookie) {
      const cookieStr = Array.isArray(cookie) ? cookie.join(';') : cookie
      saveCookie(cookieStr)
    }
  }

  // 清除登录状态
  function clearLogin() {
    userInfo.value = null
    localStorage.removeItem('halo_user')
  }

  // 检查登录状态（带 cookie 刷新用户信息）
  async function checkLoginStatus() {
    const cookie = getCookie()
    if (!cookie) {
      userInfo.value = null
      return false
    }
    try {
      const res = await getLoginStatus()
      if (res.data?.profile) {
        userInfo.value = res.data.profile
        localStorage.setItem('halo_user', JSON.stringify(res.data.profile))
        return true
      }
    } catch (e) {
      console.error('Check login status failed:', e)
    }
    userInfo.value = null
    return false
  }

  return {
    userInfo,
    isLoggedIn,
    setLogin,
    clearLogin,
    checkLoginStatus,
  }
})
