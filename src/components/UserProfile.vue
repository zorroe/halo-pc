<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userInfo, checkLoginStatus } from '../composables/useLogin'
import { logout } from '../api/login'
import { getLikeList, getUserPlaylist } from '../api/home'

const router = useRouter()

const loading = ref(true)
const likeSongs = ref<any[]>([])
const createdPlaylists = ref<any[]>([])
const likedPlaylists = ref<any[]>([])

onMounted(async () => {
  // 先获取登录状态（防止刷新后 userInfo 为空）
  await checkLoginStatus()

  if (!userInfo.value?.id) {
    router.push('/login')
    return
  }

  const uid = userInfo.value.id
  try {
    const [likeRes, playlistRes] = await Promise.all([
      getLikeList(uid),
      getUserPlaylist(uid),
    ])

    if (likeRes.code === 200) {
      likeSongs.value = likeRes.data || []
    }
    if (playlistRes.code === 200) {
      const all = playlistRes.playlist || []
      createdPlaylists.value = all.filter((p: any) => String(p.userId) === String(uid))
      likedPlaylists.value = all.filter((p: any) => String(p.userId) !== String(uid))
    }
  } catch (e) {
    console.error('Load profile data failed:', e)
  }
  loading.value = false
})

const genderText = () => {
  if (userInfo.value?.gender === 1) return '男'
  if (userInfo.value?.gender === 2) return '女'
  return '未知'
}

const birthdayText = () => {
  const ts = userInfo.value?.birthday
  if (!ts) return '未设置'
  const d = new Date(ts)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

async function handleLogout() {
  try { await logout() } catch (e) { /* ignore */ }
  router.push('/login')
}

function formatCount(n: number) {
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿'
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return String(n)
}

function formatDuration(ms: number) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="max-w-5xl mx-auto">

    <!-- Back -->
    <button
      class="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mb-8 transition-colors"
      @click="router.back()"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      返回
    </button>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center gap-4">
        <div class="w-8 h-8 border-2 border-slate-200 border-t-rose-400 rounded-full animate-spin"></div>
        <p class="text-sm text-slate-400">正在加载...</p>
      </div>
    </div>

    <div v-else class="space-y-14 pb-20">

      <!-- Profile Header -->
      <div class="flex gap-8 items-center">
        <!-- Avatar -->
        <div class="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-800 flex-shrink-0">
          <img
            v-if="userInfo?.avatarUrl"
            :src="userInfo.avatarUrl"
            :alt="userInfo.nickname"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-slate-400 text-2xl">?</div>
        </div>

        <!-- Info -->
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-2xl font-semibold text-slate-800 dark:text-white">{{ userInfo?.nickname || '未登录' }}</h1>
            <span class="text-sm text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">Lv.{{ userInfo?.level || '-' }}</span>
          </div>
          <p v-if="userInfo?.signature" class="text-sm text-slate-400 mt-2 leading-relaxed">{{ userInfo.signature }}</p>

          <!-- Stats -->
          <div class="flex gap-10 mt-5">
            <div>
              <p class="text-2xl font-semibold text-slate-800 dark:text-white">{{ userInfo?.follows || 0 }}</p>
              <p class="text-sm text-slate-400">关注</p>
            </div>
            <div>
              <p class="text-2xl font-semibold text-slate-800 dark:text-white">{{ userInfo?.followeds || 0 }}</p>
              <p class="text-sm text-slate-400">粉丝</p>
            </div>
            <div>
              <p class="text-2xl font-semibold text-slate-800 dark:text-white">{{ userInfo?.playlistCount || 0 }}</p>
              <p class="text-sm text-slate-400">歌单</p>
            </div>
          </div>
        </div>

        <!-- Details -->
        <div class="flex-shrink-0 text-sm space-y-2 text-right">
          <div>
            <span class="text-slate-400">性别</span>
            <span class="ml-3 text-slate-700 dark:text-slate-200">{{ genderText() }}</span>
          </div>
          <div>
            <span class="text-slate-400">生日</span>
            <span class="ml-3 text-slate-700 dark:text-slate-200">{{ birthdayText() }}</span>
          </div>
          <div>
            <span class="text-slate-400">地区</span>
            <span class="ml-3 text-slate-700 dark:text-slate-200">{{ userInfo?.province || '-' }} · {{ userInfo?.city || '-' }}</span>
          </div>
          <div class="pt-2">
            <button
              class="text-sm text-slate-400 hover:text-rose-500 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700 px-4 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all duration-200"
              @click="handleLogout"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>

      <!-- 我喜欢的歌曲 -->
      <section>
        <h2 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-5">我喜欢的歌曲 <span class="text-sm font-normal text-slate-400">{{ likeSongs.length }} 首</span></h2>
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
          <table class="w-full">
            <thead>
              <tr class="text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th class="text-left py-3 px-5 font-medium w-12">#</th>
                <th class="text-left py-3 px-2 font-medium">歌曲</th>
                <th class="text-left py-3 px-2 font-medium hidden md:table-cell">歌手</th>
                <th class="text-left py-3 px-2 font-medium hidden lg:table-cell">专辑</th>
                <th class="text-right py-3 px-5 font-medium w-20">时长</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(s, i) in likeSongs.slice(0, 20)"
                :key="s.id"
                class="group border-b border-slate-50 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <td class="py-3.5 px-5 text-sm text-slate-300 dark:text-slate-600 group-hover:text-rose-400 transition-colors">{{ i + 1 }}</td>
                <td class="py-3.5 px-2">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 shadow-sm">
                      <img v-if="s.al?.picUrl" :src="s.al.picUrl" class="w-full h-full object-cover" />
                    </div>
                    <span class="text-sm text-slate-700 dark:text-slate-200 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors truncate max-w-xs">{{ s.name }}</span>
                  </div>
                </td>
                <td class="py-3.5 px-2 text-sm text-slate-400 hidden md:table-cell truncate max-w-xs">{{ s.ar?.[0]?.name || '-' }}</td>
                <td class="py-3.5 px-2 text-sm text-slate-400 hidden lg:table-cell truncate max-w-xs">{{ s.al?.name || '-' }}</td>
                <td class="py-3.5 px-5 text-sm text-slate-300 dark:text-slate-600 text-right group-hover:text-slate-400 transition-colors">{{ formatDuration(s.dt) }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="likeSongs.length > 20" class="text-center py-3 text-sm text-slate-400">
            还有 {{ likeSongs.length - 20 }} 首歌曲...
          </div>
          <div v-if="likeSongs.length === 0" class="text-center py-8 text-sm text-slate-400">
            暂无喜欢的歌曲
          </div>
        </div>
      </section>

      <!-- 我创建的歌单 -->
      <section>
        <h2 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-5">我创建的歌单 <span class="text-sm font-normal text-slate-400">{{ createdPlaylists.length }} 个</span></h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div
            v-for="p in createdPlaylists"
            :key="p.id"
            class="cursor-pointer group"
          >
            <div class="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2.5 relative shadow-sm">
              <img :src="p.coverImgUrl" :alt="p.name" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div v-if="p.playCount" class="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                {{ formatCount(p.playCount) }}
              </div>
            </div>
            <p class="text-sm text-slate-700 dark:text-slate-200 leading-snug line-clamp-2 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">{{ p.name }}</p>
          </div>
        </div>
        <div v-if="createdPlaylists.length === 0" class="text-center py-8 text-sm text-slate-400">
          暂无创建的歌单
        </div>
      </section>

      <!-- 我收藏的歌单 -->
      <section>
        <h2 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-5">我收藏的歌单 <span class="text-sm font-normal text-slate-400">{{ likedPlaylists.length }} 个</span></h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div
            v-for="p in likedPlaylists"
            :key="p.id"
            class="cursor-pointer group"
          >
            <div class="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2.5 relative shadow-sm">
              <img :src="p.coverImgUrl" :alt="p.name" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div v-if="p.playCount" class="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                {{ formatCount(p.playCount) }}
              </div>
            </div>
            <p class="text-sm text-slate-700 dark:text-slate-200 leading-snug line-clamp-2 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">{{ p.name }}</p>
            <p class="text-xs text-slate-400 mt-0.5 truncate">by {{ p.creator?.nickname || '' }}</p>
          </div>
        </div>
        <div v-if="likedPlaylists.length === 0" class="text-center py-8 text-sm text-slate-400">
          暂无收藏的歌单
        </div>
      </section>

    </div>
  </div>
</template>
