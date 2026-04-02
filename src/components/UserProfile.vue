<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { logout } from '../api/login'
import { request } from '../api/request'
import { getSongDetail, getUserPlaylist } from '../api/home'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const likeSongIds = ref<number[]>([])
const likeSongs = ref<any[]>([])
const createdPlaylists = ref<any[]>([])
const likedPlaylists = ref<any[]>([])

// 分页
const PAGE_SIZE = 10
const likeCurrentPage = ref(1)
const likeTotalCount = ref(0)
const likeLoadingMore = ref(false)

onMounted(async () => {
  await userStore.checkLoginStatus()
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  const uid = userStore.userInfo?.userId
  try {
    // 先获取喜欢的歌曲 ID 列表
    const likeRes = await request('/likelist', { uid }) as any
    console.log('[Profile] likelist response:', JSON.stringify(likeRes).slice(0, 200))
    if (likeRes.code === 200) {
      likeSongIds.value = likeRes.ids || []
      if (!likeSongIds.value.length && likeRes.songs) {
        likeSongIds.value = likeRes.songs.map((s: any) => s.id)
      }
      likeTotalCount.value = likeSongIds.value.length
      console.log('[Profile] like song ids count:', likeSongIds.value.length)
    }

    // 再获取用户歌单
    const playlistRes = await getUserPlaylist(uid)
    if (playlistRes.code === 200) {
      const all = playlistRes.playlist || []
      createdPlaylists.value = all.filter((p: any) => String(p.userId) === String(uid))
      likedPlaylists.value = all.filter((p: any) => String(p.userId) !== String(uid))
    }

    await loadLikeSongs(1)
  } catch (e) {
    console.error('Load profile data failed:', e)
  }
  loading.value = false
})

async function loadLikeSongs(page: number) {
  if (page === 1) {
    loading.value = true
  } else {
    likeLoadingMore.value = true
  }
  likeCurrentPage.value = page

  try {
    const ids = likeSongIds.value.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    console.log('[Profile] loadLikeSongs page', page, 'ids:', ids.length, 'slice:', (page - 1) * PAGE_SIZE, '-', page * PAGE_SIZE, '| totalIds:', likeSongIds.value.length)
    if (ids.length > 0) {
      const res = await getSongDetail(ids)
      if (res.code === 200) {
        likeSongs.value = res.songs || []
      }
    } else {
      likeSongs.value = []
    }
  } catch (e) {
    console.error('Load like songs failed:', e)
  }
  loading.value = false
  likeLoadingMore.value = false
}

async function prevLikePage() {
  if (likeCurrentPage.value > 1) {
    await loadLikeSongs(likeCurrentPage.value - 1)
  }
}

async function nextLikePage() {
  console.log('[Profile] nextLikePage called, currentPage:', likeCurrentPage.value, 'ids length:', likeSongIds.value.length)
  const totalPages = Math.ceil(likeTotalCount.value / PAGE_SIZE)
  if (likeCurrentPage.value < totalPages) {
    await loadLikeSongs(likeCurrentPage.value + 1)
  }
}

const genderText = () => {
  if (userStore.userInfo?.gender === 1) return '男'
  if (userStore.userInfo?.gender === 2) return '女'
  return '未知'
}

const birthdayText = () => {
  const ts = userStore.userInfo?.birthday
  if (!ts) return '未设置'
  const d = new Date(ts)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

async function handleLogout() {
  try { await logout() } catch (e) { /* ignore */ }
  userStore.clearLogin()
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
            v-if="userStore.userInfo?.avatarUrl"
            :src="userStore.userInfo.avatarUrl"
            :alt="userStore.userInfo.nickname"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-slate-400 text-2xl">?</div>
        </div>

        <!-- Info -->
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-2xl font-semibold text-slate-800 dark:text-white">{{ userStore.userInfo?.nickname || '未登录' }}</h1>
            <span class="text-sm text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">Lv.{{ userStore.userInfo?.level || '-' }}</span>
          </div>
          <p v-if="userStore.userInfo?.signature" class="text-sm text-slate-400 mt-2 leading-relaxed">{{ userStore.userInfo.signature }}</p>

          <!-- Stats -->
          <div class="flex gap-10 mt-5">
            <div>
              <p class="text-2xl font-semibold text-slate-800 dark:text-white">{{ userStore.userInfo?.follows || 0 }}</p>
              <p class="text-sm text-slate-400">关注</p>
            </div>
            <div>
              <p class="text-2xl font-semibold text-slate-800 dark:text-white">{{ userStore.userInfo?.followeds || 0 }}</p>
              <p class="text-sm text-slate-400">粉丝</p>
            </div>
            <div>
              <p class="text-2xl font-semibold text-slate-800 dark:text-white">{{ userStore.userInfo?.playlistCount || 0 }}</p>
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
            <span class="ml-3 text-slate-700 dark:text-slate-200">{{ userStore.userInfo?.province || '-' }} · {{ userStore.userInfo?.city || '-' }}</span>
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
        <h2 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-5">我喜欢的歌曲 <span class="text-sm font-normal text-slate-400">{{ likeTotalCount }} 首</span></h2>
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
                v-for="(s, i) in likeSongs"
                :key="s.id"
                class="group border-b border-slate-50 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <td class="py-3.5 px-5 text-sm text-slate-300 dark:text-slate-600 group-hover:text-rose-400 transition-colors">{{ (likeCurrentPage - 1) * PAGE_SIZE + i + 1 }}</td>
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
          <!-- 分页导航 -->
          <div v-if="likeSongs.length === 0" class="text-center py-8 text-sm text-slate-400">
            暂无喜欢的歌曲
          </div>
          <div v-if="Math.ceil(likeTotalCount / PAGE_SIZE) > 1" class="flex items-center justify-center gap-3 py-3">
            <button
              :disabled="likeCurrentPage === 1 || likeLoadingMore"
              class="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              @click="prevLikePage"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span class="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 min-w-[3rem] text-center">{{ likeCurrentPage }} / {{ Math.ceil(likeTotalCount / PAGE_SIZE) }}</span>
            <button
              :disabled="likeCurrentPage >= Math.ceil(likeTotalCount / PAGE_SIZE) || likeLoadingMore"
              class="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              @click="nextLikePage"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
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
            @click="router.push(`/playlist/${p.id}`)"
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
            @click="router.push(`/playlist/${p.id}`)"
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
