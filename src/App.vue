<script setup lang="ts">
import { ref, onMounted } from 'vue'

const dark = ref(false)

onMounted(() => {
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
  <div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
    <!-- Header -->
    <header class="bg-indigo-600 dark:bg-gray-800 text-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14 sm:h-16">
          <h1 class="text-lg sm:text-xl font-bold">🎵 HaloMusic</h1>
          <button
            class="text-sm bg-indigo-700 dark:bg-gray-700 hover:bg-indigo-800 dark:hover:bg-gray-600 px-3 py-1.5 rounded-lg transition-colors"
            @click="toggleDark"
          >
            {{ dark ? '☀️ 浅色' : '🌙 深色' }}
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div class="text-center">
        <div class="text-6xl sm:text-8xl mb-4">🎵</div>
        <h2 class="text-2xl sm:text-3xl font-bold mb-2">HaloMusic</h2>
        <p class="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
          Vite + Vue 3 + Tailwind CSS
        </p>
        <p class="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mt-1">
          深色模式 · 响应式布局
        </p>
      </div>

      <!-- Feature Grid -->
      <div class="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 sm:p-6">
          <div class="text-3xl mb-3">⚡</div>
          <h3 class="font-semibold mb-1">Vite</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">下一代前端构建工具，快速热更新</p>
        </div>
        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 sm:p-6">
          <div class="text-3xl mb-3">🖼️</div>
          <h3 class="font-semibold mb-1">Tailwind CSS</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">原子化 CSS，快速构建美观界面</p>
        </div>
        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 sm:p-6">
          <div class="text-3xl mb-3">🌙</div>
          <h3 class="font-semibold mb-1">深色模式</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">自动跟随系统，支持手动切换</p>
        </div>
      </div>
    </main>
  </div>
</template>
