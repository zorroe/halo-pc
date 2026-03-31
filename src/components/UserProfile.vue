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

const levelText = computed(() => userInfo.value?.level ?? '-')

async function handleLogout() {
  try { await logout() } catch (e) { /* ignore */ }
  clearLogin()
  router.push('/login')
}
</script>

<template>
  <div class="max-w-3xl mx-auto">

    <!-- Back -->
    <button
      class="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mb-8 transition-colors"
      @click="router.back()"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      返回
    </button>

    <!-- Profile -->
    <div class="flex gap-8 items-start bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
      <!-- Avatar -->
      <div class="flex-shrink-0">
        <div class="w-28 h-28 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-800">
          <img
            v-if="userInfo?.avatarUrl"
            :src="userInfo.avatarUrl"
            :alt="userInfo.nickname"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-slate-400 text-2xl">?</div>
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 mb-1">
          <h1 class="text-2xl font-semibold text-slate-800 dark:text-white">{{ userInfo?.nickname || '未登录' }}</h1>
          <span class="text-sm text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">Lv.{{ levelText }}</span>
        </div>

        <p v-if="userInfo?.signature" class="text-sm text-slate-400 mt-2 leading-relaxed">{{ userInfo.signature }}</p>

        <!-- Stats -->
        <div class="flex gap-10 mt-6">
          <div>
            <p class="text-2xl font-semibold text-slate-800 dark:text-white">{{ userInfo?.follows || 0 }}</p>
            <p class="text-sm text-slate-400 mt-0.5">关注</p>
          </div>
          <div>
            <p class="text-2xl font-semibold text-slate-800 dark:text-white">{{ userInfo?.followeds || 0 }}</p>
            <p class="text-sm text-slate-400 mt-0.5">粉丝</p>
          </div>
          <div>
            <p class="text-2xl font-semibold text-slate-800 dark:text-white">{{ userInfo?.playlistCount || 0 }}</p>
            <p class="text-sm text-slate-400 mt-0.5">歌单</p>
          </div>
        </div>

        <!-- Details -->
        <div class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-4">
          <div>
            <p class="text-xs text-slate-400 mb-1">性别</p>
            <p class="text-sm text-slate-700 dark:text-slate-200">{{ genderText }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 mb-1">生日</p>
            <p class="text-sm text-slate-700 dark:text-slate-200">{{ birthdayText }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 mb-1">地区</p>
            <p class="text-sm text-slate-700 dark:text-slate-200">{{ userInfo?.province || '-' }} · {{ userInfo?.city || '-' }}</p>
          </div>
        </div>

        <!-- Logout -->
        <button
          class="mt-8 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-400 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all duration-200"
          @click="handleLogout"
        >
          退出登录
        </button>
      </div>
    </div>

  </div>
</template>
