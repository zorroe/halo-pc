<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPlaylistDetail, getPlaylistTracks, subscribePlaylist } from '../api/home'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const playlist = ref<any>(null)
const tracks = ref<any[]>([])
const subscribed = ref(false)
const subscribLoading = ref(false)

// 分页
const PAGE_SIZE = 30
const currentPage = ref(1)
const totalTracks = ref(0)
const loadingMore = ref(false)

const totalPages = computed(() => Math.ceil(totalTracks.value / PAGE_SIZE))

const playlistId = Number(route.params.id)

onMounted(async () => {
  await loadPlaylist()
  await loadTracks(1)
  loading.value = false
})

async function loadPlaylist() {
  try {
    const detailRes = await getPlaylistDetail(playlistId)
    if (detailRes.code === 200) {
      playlist.value = detailRes.playlist
      subscribed.value = detailRes.playlist.subscribed
      totalTracks.value = detailRes.playlist.trackCount || 0
    }
  } catch (e) {
    console.error('Load playlist failed:', e)
  }
}

async function loadTracks(page: number) {
  if (page === 1) {
    loading.value = true
  } else {
    loadingMore.value = true
  }
  currentPage.value = page
  try {
    const offset = (page - 1) * PAGE_SIZE
    const res = await getPlaylistTracks(playlistId, PAGE_SIZE, offset)
    if (res.code === 200) {
      if (page === 1) {
        tracks.value = res.songs || []
      } else {
        tracks.value = [...tracks.value, ...(res.songs || [])]
      }
    }
  } catch (e) {
    console.error('Load tracks failed:', e)
  }
  loading.value = false
  loadingMore.value = false
}

async function prevPage() {
  if (currentPage.value > 1) {
    await loadTracks(currentPage.value - 1)
  }
}

async function nextPage() {
  if (currentPage.value < totalPages.value) {
    await loadTracks(currentPage.value + 1)
  }
}

async function toggleSubscribe() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  subscribLoading.value = true
  try {
    const t = subscribed.value ? 2 : 1
    await subscribePlaylist(playlistId, t)
    subscribed.value = !subscribed.value
  } catch (e) {
    console.error('Subscribe failed:', e)
  }
  subscribLoading.value = false
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
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="flex flex-col items-center gap-4">
        <div class="w-8 h-8 border-2 border-slate-200 border-t-rose-400 rounded-full animate-spin"></div>
        <p class="text-sm text-slate-400">正在加载...</p>
      </div>
    </div>

    <div v-else-if="playlist" class="space-y-8 pb-20">

      <!-- Playlist Header -->
      <div class="flex gap-8 items-start">
        <!-- Cover -->
        <div class="w-48 h-48 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-lg flex-shrink-0">
          <img :src="playlist.coverImgUrl" :alt="playlist.name" class="w-full h-full object-cover" />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl font-semibold text-slate-800 dark:text-white mb-3">{{ playlist.name }}</h1>

          <!-- Creator -->
          <div class="flex items-center gap-2 mb-4">
            <img :src="playlist.creator?.avatarUrl" class="w-6 h-6 rounded-full" />
            <span class="text-sm text-slate-500">{{ playlist.creator?.nickname }}</span>
          </div>

          <!-- Stats -->
          <div class="flex gap-6 text-sm text-slate-400 mb-4">
            <span>歌曲 {{ formatCount(totalTracks) }}</span>
            <span>播放 {{ formatCount(playlist.playCount) }} 次</span>
            <span>收藏 {{ formatCount(playlist.subscribedCount) }}</span>
          </div>

          <!-- Description -->
          <p v-if="playlist.description" class="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-5">
            {{ playlist.description }}
          </p>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              :disabled="subscribLoading"
              class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              :class="subscribed
                ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/30'
                : 'bg-rose-500 text-white hover:bg-rose-400'"
              @click="toggleSubscribe"
            >
              <svg v-if="subscribed" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {{ subscribed ? '已收藏' : '收藏' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Song List -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-slate-700 dark:text-slate-200">歌曲列表</h2>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center gap-3 text-sm">
            <span class="text-slate-400">
              {{ (currentPage - 1) * PAGE_SIZE + 1 }}-{{ Math.min(currentPage * PAGE_SIZE, totalTracks) }} / {{ totalTracks }}
            </span>
            <div class="flex items-center gap-1">
              <button
                :disabled="currentPage === 1 || loadingMore"
                class="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                @click="prevPage"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <span class="px-2 text-slate-600 dark:text-slate-300 min-w-[3rem] text-center">{{ currentPage }} / {{ totalPages }}</span>
              <button
                :disabled="currentPage === totalPages || loadingMore"
                class="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                @click="nextPage"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Loading more indicator -->
        <div v-if="loadingMore" class="flex items-center justify-center py-4 mb-2">
          <div class="w-6 h-6 border-2 border-slate-200 border-t-rose-400 rounded-full animate-spin"></div>
        </div>

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
                v-for="(s, i) in tracks"
                :key="s.id"
                class="group border-b border-slate-50 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <td class="py-3.5 px-5 text-sm text-slate-300 dark:text-slate-600 group-hover:text-rose-400 transition-colors">
                  {{ (currentPage - 1) * PAGE_SIZE + i + 1 }}
                </td>
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
        </div>
      </div>

    </div>
  </div>
</template>
