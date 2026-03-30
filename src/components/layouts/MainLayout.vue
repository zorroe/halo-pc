<script setup lang="ts">
import { ref } from 'vue'
import Home from '../Home.vue'

const dark = ref(false)

function toggleDark() {
  dark.value = !dark.value
  document.documentElement.classList.toggle('dark', dark.value)
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">

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
