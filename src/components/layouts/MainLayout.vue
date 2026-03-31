<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userInfo } from '../../composables/useLogin'
import Home from '../Home.vue'

const router = useRouter()
const dark = ref(false)

function toggleDark() {
  dark.value = !dark.value
  document.documentElement.classList.toggle('dark', dark.value)
}

function goToProfile() {
  router.push('/profile')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">

    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60">
      <div class="max-w-6xl mx-auto px-5 sm:px-6">
        <div class="flex items-center justify-between h-14">
          <!-- Logo -->
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-sm shadow-rose-200 dark:shadow-rose-900/40">
              <span class="text-white text-sm font-bold">♪</span>
            </div>
            <span class="text-base font-semibold text-slate-800 dark:text-white tracking-tight">HaloMusic</span>
          </div>

          <!-- Right actions -->
          <div class="flex items-center gap-1">
            <!-- Avatar -->
            <button
              class="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent hover:border-rose-300 dark:hover:border-rose-500 transition-all duration-200 shadow-sm"
              :title="userInfo?.nickname || '个人中心'"
              @click="goToProfile"
            >
              <img
                v-if="userInfo?.avatarUrl"
                :src="userInfo.avatarUrl"
                :alt="userInfo.nickname"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <span class="text-xs text-slate-400">?</span>
              </div>
            </button>

            <!-- Theme toggle -->
            <button
              class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              :title="dark ? '切换到浅色模式' : '切换到深色模式'"
              @click="toggleDark"
            >
              <svg v-if="dark" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="max-w-6xl mx-auto px-5 sm:px-6 py-6">
      <Home />
    </main>

  </div>
</template>
