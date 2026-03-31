<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getQrKey, getQrImage, checkQrStatus } from '../api/login'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

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
        stopQrPolling() // 立即停止轮询，防止重复触发
        // profile 可能不在响应里，cookie 一定在，都存入
        userStore.setLogin(res.profile || {}, res.cookie)
        // 短暂展示成功后跳转
        setTimeout(() => {
          router.push('/home')
        }, 300)
      } else if (code === 800) {
        qrStatusText.value = '二维码已过期，点击重新生成'
        stopQrPolling()
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
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-stone-100 dark:from-slate-900 dark:to-stone-900">
    <div class="flex items-center gap-16">

      <!-- Left: Branding -->
      <div class="hidden lg:block">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200 dark:shadow-rose-900/30">
            <span class="text-3xl text-white font-bold">♪</span>
          </div>
          <span class="text-3xl font-semibold text-slate-800 dark:text-white tracking-tight">HaloMusic</span>
        </div>
        <p class="text-lg text-slate-400 leading-relaxed">海量高品质音乐<br/>畅享沉浸式聆听体验</p>
      </div>

      <!-- Right: Login Card -->
      <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-10 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 text-center">
        <h2 class="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">扫码登录</h2>
        <p class="text-sm text-slate-400 mb-8">使用网易云音乐 App 扫描二维码</p>

        <!-- QR Code -->
        <div
          class="w-52 h-52 mx-auto rounded-xl bg-white border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-5 cursor-pointer hover:shadow-md transition-shadow duration-300 overflow-hidden"
          @click="qrImageUrl ? '' : startQrLogin()"
        >
          <img v-if="qrImageUrl" :src="qrImageUrl" alt="QR Code" class="w-full h-full object-contain p-3" />
          <div v-else-if="qrLoading" class="flex flex-col items-center gap-3">
            <div class="w-8 h-8 border-2 border-slate-300 border-t-rose-400 rounded-full animate-spin"></div>
            <span class="text-xs text-slate-400">生成中</span>
          </div>
          <span v-else class="text-xs text-slate-400">点击刷新</span>
        </div>

        <p class="text-sm text-slate-500 dark:text-slate-400">{{ qrStatusText }}</p>
      </div>

    </div>
  </div>
</template>
