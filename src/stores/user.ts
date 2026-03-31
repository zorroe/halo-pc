import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
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

// 用 VueUse useLocalStorage 自动持久化到 localStorage
export const useUserStore = defineStore('user', () => {
  const userInfo = useLocalStorage<UserInfo | null>('halo_user', null)
  const isLoggedIn = computed(() => !!userInfo.value?.userId)

  // 登录后保存
  function setLogin(profile: UserInfo, cookie?: string) {
    console.log('Setting user info:', profile)
    userInfo.value = profile
    if (cookie) {
      const cookieStr = Array.isArray(cookie) ? cookie.join(';') : cookie
      saveCookie(cookieStr)
    }
  }

  // 清除登录状态
  function clearLogin() {
    userInfo.value = null
  }

  // 用 cookie 刷新用户信息（如果 API 失败保留本地数据）
  async function checkLoginStatus() {
    try {
      const res = await getLoginStatus()
      if (res.data?.profile) {
        userInfo.value = res.data.profile
        return true
      }
    } catch (e) {
      console.error('Check login status failed:', e)
    }
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
