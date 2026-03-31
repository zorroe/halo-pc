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
  // 从 localStorage 恢复（初始化时即恢复，不依赖 checkLoginStatus）
  const stored = localStorage.getItem('halo_user')
  let initialUser: UserInfo | null = null
  if (stored) {
    try {
      initialUser = JSON.parse(stored)
    } catch (e) {
      localStorage.removeItem('halo_user')
    }
  }

  const userInfo = ref<UserInfo | null>(initialUser)
  const isLoggedIn = computed(() => !!userInfo.value?.id)

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

  // 检查登录状态（用 cookie 刷新用户信息，如果 API 失败不清空本地数据）
  async function checkLoginStatus() {
    const cookie = getCookie()
    if (!cookie) {
      // 没有 cookie 才认为未登录
      return isLoggedIn.value
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
    // API 失败或无 profile 时，不清空本地已有的登录数据
    return isLoggedIn.value
  }

  return {
    userInfo,
    isLoggedIn,
    setLogin,
    clearLogin,
    checkLoginStatus,
  }
})
