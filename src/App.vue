<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { isLoggedIn, checkLoginStatus, userInfo } from './composables/useLogin'

const router = useRouter()
const route = useRoute()
const ready = ref(false)
const dark = ref(false)

const showHeader = computed(() => route.path !== '/login')

onMounted(async () => {
  await checkLoginStatus()
  ready.value = true
  if (isLoggedIn.value) {
    router.push('/home')
  }
})

// 仅在 ready 后且 isLoggedIn 变为 true 时跳转，避免初始 mount 时的无效触发
watch([() => isLoggedIn.value, ready], ([loggedIn, rdy]) => {
  if (rdy && loggedIn && route.path === '/login') {
    router.push('/home')
  }
})

function toggleDark() {
  dark.value = !dark.value
  document.documentElement.classList.toggle('dark', dark.value)
}
</script>

<template>
  <!-- 加载中 -->
  <div v-if="!ready" class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div class="flex flex-col items-center gap-3">
      <div class="w-8 h-8 border-2 border-slate-200 border-t-rose-400 rounded-full animate-spin"></div>
      <p class="text-sm text-slate-400">加载中...</p>
    </div>
  </div>

  <div v-else>
    <!-- 登录页：没有 Header -->
    <router-view v-if="showHeader === false" />

    <!-- 其他页面：有 Header -->
    <div v-else class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <!-- Header -->
      <header class="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60">
        <div class="max-w-7xl mx-auto px-8">
          <div class="flex items-center justify-between h-14">
            <!-- Logo -->
            <router-link to="/home" class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-sm shadow-rose-200 dark:shadow-rose-900/40">
                <span class="text-white text-sm font-bold">♪</span>
              </div>
              <span class="text-lg font-semibold text-slate-800 dark:text-white tracking-tight">HaloMusic</span>
            </router-link>

            <!-- Right actions -->
            <div class="flex items-center gap-2">
              <!-- Avatar -->
              <router-link
                to="/profile"
                class="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group"
              >
                <div class="w-7 h-7 rounded-full overflow-hidden border-2 border-transparent group-hover:border-rose-300 dark:group-hover:border-rose-500 transition-all duration-200 shadow-sm bg-slate-200 dark:bg-slate-700">
                  <img
                    v-if="userInfo?.avatarUrl"
                    :src="userInfo.avatarUrl"
                    :alt="userInfo.nickname"
                    class="w-full h-full object-cover"
                  />
                </div>
                <span class="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">个人中心</span>
              </router-link>

              <!-- Theme toggle -->
              <button
                class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
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
      <main class="max-w-7xl mx-auto px-8 py-8">
        <router-view />
      </main>
    </div>
  </div>
</template>
