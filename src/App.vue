<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { isLoggedIn, checkLoginStatus } from './composables/useLogin'

const router = useRouter()
const ready = ref(false)

onMounted(async () => {
  await checkLoginStatus()
  ready.value = true
  if (isLoggedIn.value) {
    router.push('/home')
  }
})

// 监听登录状态变化，自动跳转
watch(isLoggedIn, (val) => {
  if (val) router.push('/home')
})
</script>

<template>
  <!-- 加载中 -->
  <div v-if="!ready" class="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
    <div class="text-center">
      <div class="text-5xl mb-3 animate-pulse">🎵</div>
      <p class="text-gray-500 dark:text-gray-400 text-sm">加载中...</p>
    </div>
  </div>

  <!-- 路由视图 -->
  <router-view v-else />
</template>
