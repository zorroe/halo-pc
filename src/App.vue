<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Login from './components/Login.vue'
import { isLoggedIn, checkLoginStatus } from './composables/useLogin'

const ready = ref(false)
const dark = ref(false)

onMounted(async () => {
  await checkLoginStatus()
  ready.value = true
  // 跟随系统深色模式
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    dark.value = true
    document.documentElement.classList.add('dark')
  }
})

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
  <Login v-else-if="!isLoggedIn" @login-success="() => {}" />

  <!-- 已登录：主页面 -->
  <div v-else class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">

    <!-- Header -->
    <header class="bg-indigo-600 dark:bg-gray-800 text-white shadow-md sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14 sm:h-16">
          <h1 class="text-lg sm:text-xl font-bold">🎵 HaloMusic</h1>
          <div class="flex items-center gap-3">
            <span class="text-sm hidden sm:block">已登录</span>
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

    <!-- Main -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div class="text-center mb-10">
        <div class="text-6xl sm:text-8xl mb-4">🎵</div>
        <h2 class="text-2xl sm:text-3xl font-bold mb-2">HaloMusic</h2>
        <p class="text-gray-500 dark:text-gray-400">登录成功，尽情享受音乐吧！</p>
      </div>

      <!-- 功能入口 -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="item in features" :key="item.name"
          class="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          <div class="text-3xl mb-2">{{ item.icon }}</div>
          <div class="font-medium text-sm">{{ item.name }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ item.desc }}</div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
const features = [
  { name: '发现音乐', icon: '🎵', desc: '个性化推荐' },
  { name: '歌单', icon: '📋', desc: '精选歌单' },
  { name: '排行榜', icon: '🏆', desc: '热门榜单' },
  { name: '搜索', icon: '🔍', desc: '搜索歌曲/歌手' },
  { name: 'MV', icon: '🎬', desc: '高清MV' },
  { name: '每日推荐', icon: '📅', desc: '私人定制' },
  { name: '收藏', icon: '❤️', desc: '我喜欢' },
  { name: '设置', icon: '⚙️', desc: '偏好设置' },
]
</script>
