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

export const useUserStore = defineStore('user', () => {
  const userInfo = useLocalStorage<UserInfo | null>('halo_user', null)
  const isLoggedIn = computed(() => !!userInfo.value?.userId)

  function setLogin(profile: UserInfo, cookie?: string) {
    userInfo.value = profile
    if (cookie) {
      const cookieStr = Array.isArray(cookie) ? cookie.join(';') : cookie
      saveCookie(cookieStr)
    }
  }

  function clearLogin() {
    userInfo.value = null
  }

  async function checkLoginStatus() {
    const cookie = getCookie()
    if (!cookie) return isLoggedIn.value
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
