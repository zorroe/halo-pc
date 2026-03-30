<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import { isLoggedIn, checkLoginStatus } from './composables/useLogin'

const ready = ref(false)
const dark = ref(false)
const view = ref<'login' | 'home'>('login')

onMounted(async () => {
  await checkLoginStatus()
  ready.value = true
  if (isLoggedIn.value) view.value = 'home'
  // 跟随系统深色模式
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    dark.value = true
    document.documentElement.classList.add('dark')
  }
})

function handleLoginSuccess() {
  view.value = 'home'
}

function toggleDark() {
  dark.value = !dark.value
  document.documentElement.classList.toggle('dark', dark.value)
}
</script>

<template>
  <!-- 加载中 -->
  <div v-if="!ready" class="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
    <div class="text-center">
      <div class="text-5xl mb-3 animate-pulse">🎵</div>
      <p class="text-gray-500 dark:text-gray-400 text-sm">加载中...</p>
    </div>
  </div>

  <!-- 登录页 -->
  <Login v-else-if="view === 'login'" @login-success="handleLoginSuccess" />

  <!-- 主页面 -->
  <div v-else class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">

    <!-- Header -->
    <header class="bg-indigo-600 dark:bg-gray-800 text-white shadow-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14 sm:h-16">
          <h1 class="text-lg sm:text-xl font-bold">🎵 HaloMusic</h1>
          <div class="flex items-center gap-3">
            <span class="text-sm hidden sm:block">👤 已登录</span>
            <button
              class="text-sm bg-indigo-700 dark:bg-gray-700 hover:bg-indigo-800 dark:hover:bg-gray-600 px-3 py-1.5 rounded-lg transition-colors"
              @click="toggleDark"
            >
              {{ dark ? '☀️ 浅色' : '🌙 深色' }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 内容区 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Home />
    </main>

  </div>
</template>
