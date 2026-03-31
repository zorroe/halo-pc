<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { userInfo, clearLogin } from '../composables/useLogin'
import { logout } from '../api/login'

const router = useRouter()

const genderText = computed(() => {
  if (userInfo.value?.gender === 1) return '男'
  if (userInfo.value?.gender === 2) return '女'
  return '未知'
})

const birthdayText = computed(() => {
  const ts = userInfo.value?.birthday
  if (!ts) return '未设置'
  const d = new Date(ts)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
})

const levelText = computed(() => {
  return userInfo.value?.level ?? '-'
})

async function handleLogout() {
  try {
    await logout()
  } catch (e) {
    // ignore
  }
  clearLogin()
  router.push('/login')
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="max-w-lg mx-auto">

    <!-- Back button -->
    <button
      class="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mb-6 transition-colors"
      @click="goBack"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      返回
    </button>

    <!-- Profile Card -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
      <!-- Banner -->
      <div class="h-24 bg-gradient-to-br from-rose-300 via-pink-300 to-rose-400"></div>

      <!-- Avatar + Basic -->
      <div class="px-6 pb-6">
        <div class="flex items-end gap-4 -mt-10 mb-5">
          <div class="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-md bg-slate-100">
            <img
              v-if="userInfo?.avatarUrl"
              :src="userInfo.avatarUrl"
              :alt="userInfo.nickname"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-slate-400">?</div>
          </div>
          <div class="pb-1">
            <h1 class="text-xl font-semibold text-slate-800 dark:text-white">{{ userInfo?.nickname || '未登录' }}</h1>
            <p class="text-sm text-slate-400 mt-0.5">Lv.{{ levelText }}</p>
          </div>
        </div>

        <!-- Stats -->
        <div class="flex gap-6 py-4 border-t border-b border-slate-100 dark:border-slate-800 mb-5">
          <div class="text-center flex-1">
            <p class="text-base font-semibold text-slate-800 dark:text-white">{{ userInfo?.follows || 0 }}</p>
            <p class="text-xs text-slate-400 mt-0.5">关注</p>
          </div>
          <div class="text-center flex-1 border-l border-slate-100 dark:border-slate-800">
            <p class="text-base font-semibold text-slate-800 dark:text-white">{{ userInfo?.followeds || 0 }}</p>
            <p class="text-xs text-slate-400 mt-0.5">粉丝</p>
          </div>
          <div class="text-center flex-1 border-l border-slate-100 dark:border-slate-800">
            <p class="text-base font-semibold text-slate-800 dark:text-white">{{ userInfo?.playlistCount || 0 }}</p>
            <p class="text-xs text-slate-400 mt-0.5">歌单</p>
          </div>
        </div>

        <!-- Info list -->
        <div class="space-y-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-400">性别</span>
            <span class="text-slate-700 dark:text-slate-200">{{ genderText }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-400">生日</span>
            <span class="text-slate-700 dark:text-slate-200">{{ birthdayText }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-400">地区</span>
            <span class="text-slate-700 dark:text-slate-200">{{ userInfo?.province || '-' }} / {{ userInfo?.city || '-' }}</span>
          </div>
          <div v-if="userInfo?.signature" class="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p class="text-xs text-slate-400 mb-1">个性签名</p>
            <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{{ userInfo.signature }}</p>
          </div>
        </div>

        <!-- Logout -->
        <button
          class="w-full mt-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-500 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all duration-200"
          @click="handleLogout"
        >
          退出登录
        </button>
      </div>
    </div>

  </div>
</template>
