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
        qrStatusText.value = '登录成功'
        clearInterval(qrPoller!)
        qrPoller = null
        setTimeout(() => {
          if (res.profile) setLogin(res.profile, res.cookie)
          router.push('/home')
        }, 600)
      } else if (code === 800) {
        qrStatusText.value = '二维码已过期，点击重新生成'
        clearInterval(qrPoller!)
        qrPoller = null
        qrImageUrl.value = ''
      } else if (code === 801) {
        qrStatusText.value = '请打开网易云音乐扫码'
      } else if (code === 802) {
        qrStatusText.value = '请在手机上确认登录'
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
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-stone-100 dark:from-slate-900 dark:to-stone-900 px-4">
    <div class="w-full max-w-xs text-center">

      <!-- Logo -->
      <div class="mb-10">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mb-4 shadow-lg shadow-rose-200 dark:shadow-rose-900/30">
          <span class="text-2xl text-white">♪</span>
        </div>
        <h1 class="text-2xl font-semibold text-slate-800 dark:text-white tracking-tight">HaloMusic</h1>
        <p class="text-sm text-slate-400 mt-1">扫码登录，畅享音乐</p>
      </div>

      <!-- Card -->
      <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-700/50">

        <!-- 二维码区 -->
        <div class="flex flex-col items-center">
          <div
            class="w-44 h-44 rounded-xl bg-white flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-700 cursor-pointer overflow-hidden hover:shadow-md transition-shadow duration-300"
            @click="qrImageUrl ? '' : startQrLogin()"
          >
            <img v-if="qrImageUrl" :src="qrImageUrl" alt="QR Code" class="w-full h-full object-contain p-2" />
            <div v-else-if="qrLoading" class="flex flex-col items-center gap-2">
              <div class="w-6 h-6 border-2 border-slate-300 border-t-rose-400 rounded-full animate-spin"></div>
              <span class="text-xs text-slate-400">生成中</span>
            </div>
            <div v-else class="text-xs text-slate-400">点击刷新</div>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ qrStatusText }}</p>
        </div>

      </div>

      <p class="text-xs text-slate-300 dark:text-slate-600 mt-8">
        登录即表示同意用户协议
      </p>
    </div>
  </div>
</template>
