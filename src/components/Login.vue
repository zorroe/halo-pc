<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getQrKey, getQrImage, checkQrStatus } from '../api/login'
import { setLogin } from '../composables/useLogin'

const router = useRouter()

const qrLoading = ref(false)
const qrImageUrl = ref('')
const qrKey = ref('')
const qrStatusText = ref('请在网易云音乐 App 中扫码登录')
let qrPoller: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  startQrLogin()
})

onUnmounted(() => {
  stopQrPolling()
})

// --- 二维码 ---
async function startQrLogin() {
  qrLoading.value = true
  qrStatusText.value = '正在生成二维码...'
  try {
    const keyRes = await getQrKey()
    if (keyRes.code !== 200 || !keyRes.data.unikey) {
      qrStatusText.value = '生成失败，请重试'
      return
    }
    qrKey.value = keyRes.data.unikey
    const imgRes = await getQrImage(qrKey.value)
    if (imgRes.data?.qrimg) {
      qrImageUrl.value = imgRes.data.qrimg
      qrStatusText.value = '请打开网易云音乐 App 扫码'
      startQrPolling()
    } else {
      qrStatusText.value = '生成失败，请重试'
    }
  } catch (e: any) {
    qrStatusText.value = e?.message || '网络错误，请检查 API 服务'
  }
  qrLoading.value = false
}

function startQrPolling() {
  stopQrPolling()
  qrPoller = setInterval(async () => {
    if (!qrKey.value) return
    try {
      const res = await checkQrStatus(qrKey.value)
      const code = res.code
      if (code === 803) {
        qrStatusText.value = '✅ 登录成功！'
        clearInterval(qrPoller!)
        qrPoller = null
        setTimeout(() => {
          if (res.profile) setLogin(res.profile, res.cookie)
          router.push('/home')
        }, 500)
      } else if (code === 800) {
        qrStatusText.value = '⏰ 二维码已过期，请重新生成'
        clearInterval(qrPoller!)
        qrPoller = null
        qrImageUrl.value = ''
      } else if (code === 801) {
        qrStatusText.value = '📱 请打开网易云音乐扫码'
      } else if (code === 802) {
        qrStatusText.value = '👆 请在手机上确认登录'
      }
    } catch (e) {
      // ignore
    }
  }, 2000)
}

function stopQrPolling() {
  if (qrPoller) {
    clearInterval(qrPoller)
    qrPoller = null
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
    <div class="w-full max-w-sm">

      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="text-5xl mb-3">🎵</div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">HaloMusic</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">登录后畅享海量音乐</p>
      </div>

      <!-- Card -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">

        <!-- 扫码登录 -->
        <div class="flex flex-col items-center">
          <div class="w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
            <img v-if="qrImageUrl" :src="qrImageUrl" alt="QR Code" class="w-full h-full object-contain" />
            <div v-else-if="qrLoading" class="text-gray-400 dark:text-gray-500 text-sm">生成中...</div>
            <button
              v-else
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors"
              @click="startQrLogin"
            >
              生成二维码
            </button>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 text-center">{{ qrStatusText }}</p>
        </div>

      </div>

      <p class="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
        登录即表示同意用户协议
      </p>
    </div>
  </div>
</template>
