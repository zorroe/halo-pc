<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { loginWithCaptcha, sendCaptcha, getQrKey, getQrImage, checkQrStatus } from '../api/login'
import { setLogin } from '../composables/useLogin'

const emit = defineEmits<{ (e: 'login-success'): void }>()

type Tab = 'captcha' | 'qr'
const activeTab = ref<Tab>('captcha')
const loading = ref(false)
const errorMsg = ref('')

const phone = ref('')
const captcha = ref('')
const captchaCountdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

// QR
const qrLoading = ref(false)
const qrImageUrl = ref('')
const qrKey = ref('')
const qrStatusText = ref('请在网易云音乐 App 中扫码登录')
let qrPoller: ReturnType<typeof setInterval> | null = null

onUnmounted(() => {
  stopQrPolling()
  if (countdownTimer) clearInterval(countdownTimer)
})

// --- 发送验证码 ---
async function handleSendCaptcha() {
  if (!phone.value || phone.value.length < 11) {
    errorMsg.value = '请输入正确的手机号'
    return
  }
  errorMsg.value = ''
  const res = await sendCaptcha(phone.value)
  if (res.code === 200) {
    captchaCountdown.value = 60
    countdownTimer = setInterval(() => {
      captchaCountdown.value--
      if (captchaCountdown.value <= 0 && countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
    }, 1000)
  } else {
    errorMsg.value = res.msg || '发送验证码失败'
  }
}

// --- 手机号 + 验证码登录 ---
async function handleCaptchaLogin() {
  if (!phone.value || !captcha.value) {
    errorMsg.value = '请输入手机号和验证码'
    return
  }
  errorMsg.value = ''
  loading.value = true
  try {
    const res = await loginWithCaptcha(phone.value, captcha.value)
    if (res.code === 200) {
      setLogin(res.profile)
      emit('login-success')
    } else {
      errorMsg.value = res.msg || `登录失败 (${res.code})`
    }
  } catch (e: any) {
    errorMsg.value = e.message || '网络错误'
  }
  loading.value = false
}

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
  } catch (e) {
    qrStatusText.value = '网络错误，请检查 API 服务'
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
          emit('login-success')
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

function switchTab(tab: Tab) {
  activeTab.value = tab
  errorMsg.value = ''
  if (tab !== 'qr') stopQrPolling()
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

        <!-- Tabs -->
        <div class="flex border-b border-gray-200 dark:border-gray-700 mb-5">
          <button
            v-for="t in (['captcha', 'qr'] as const)"
            :key="t"
            class="flex-1 text-sm py-2 text-center transition-colors cursor-pointer"
            :class="activeTab === t
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 font-medium'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
            @click="switchTab(t)"
          >
            {{ t === 'captcha' ? '验证码登录' : '扫码登录' }}
          </button>
        </div>

        <!-- Error -->
        <div v-if="errorMsg" class="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-3 py-2">
          {{ errorMsg }}
        </div>

        <!-- 验证码登录 -->
        <form v-if="activeTab === 'captcha'" class="space-y-4" @submit.prevent="handleCaptchaLogin">
          <div>
            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">手机号</label>
            <div class="flex">
              <span class="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 text-sm">+86</span>
              <input
                v-model="phone"
                type="tel"
                maxlength="11"
                placeholder="请输入手机号"
                class="flex-1 px-3 py-2 rounded-r-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">验证码</label>
            <div class="flex gap-2">
              <input
                v-model="captcha"
                type="text"
                maxlength="6"
                placeholder="请输入验证码"
                class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                :disabled="captchaCountdown > 0"
                class="px-3 py-2 rounded-lg border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                @click="handleSendCaptcha"
              >
                {{ captchaCountdown > 0 ? `${captchaCountdown}s` : '获取验证码' }}
              </button>
            </div>
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white rounded-lg font-medium text-sm transition-colors"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <!-- 扫码登录 -->
        <div v-if="activeTab === 'qr'" class="flex flex-col items-center">
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
