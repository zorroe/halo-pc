<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPersonalized, getRecommendSongs, getTopPlaylist } from '../api/home'

const loading = ref(true)
const banners = ref<any[]>([])
const playlists = ref<any[]>([])
const recommendSongs = ref<any[]>([])
const topPlaylists = ref<any[]>([])

onMounted(async () => {
  try {
    const [personalized, songs, topPL] = await Promise.all([
      getPersonalized(),
      getRecommendSongs(),
      getTopPlaylist(20),
    ])

    if (personalized.code === 200) {
      banners.value = personalized.banners || []
      playlists.value = personalized.result || []
    }
    if (songs.code === 200) {
      recommendSongs.value = songs.data?.dailySongs || []
    }
    if (topPL.code === 200) {
      topPlaylists.value = topPL.playlists || []
    }
  } catch (e) {
    console.error('Load home data failed:', e)
  }
  loading.value = false
})

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
  <!-- Loading -->
  <div v-if="loading" class="flex items-center justify-center py-24">
    <div class="flex flex-col items-center gap-3">
      <div class="w-8 h-8 border-2 border-slate-200 border-t-rose-400 rounded-full animate-spin"></div>
      <p class="text-sm text-slate-400">正在加载...</p>
    </div>
  </div>

  <div v-else class="space-y-10 pb-16">

    <!-- Banner -->
    <div v-if="banners.length" class="rounded-2xl overflow-hidden shadow-sm h-36 sm:h-44 bg-slate-100 dark:bg-slate-800">
      <div class="flex h-full" style="width: 200%">
        <img
          v-for="b in banners"
          :key="b.bannerId"
          :src="b.pic"
          class="w-full h-full object-cover"
          style="width: 50%"
        />
      </div>
    </div>

    <!-- 推荐歌单 -->
    <section>
      <h2 class="text-base font-semibold text-slate-700 dark:text-slate-200 mb-4">推荐歌单</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
        <div
          v-for="p in playlists.slice(0, 10)"
          :key="p.id"
          class="group cursor-pointer"
        >
          <div class="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2.5 relative shadow-sm">
            <img
              :src="p.picUrl || p.coverImgUrl"
              :alt="p.name"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <!-- Play count -->
            <div v-if="p.playCount" class="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded-md flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              {{ formatCount(p.playCount) }}
            </div>
          </div>
          <p class="text-sm text-slate-700 dark:text-slate-200 leading-snug line-clamp-2 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">{{ p.name }}</p>
        </div>
      </div>
    </section>

    <!-- 排行榜 -->
    <section>
      <h2 class="text-base font-semibold text-slate-700 dark:text-slate-200 mb-4">排行榜</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="p in topPlaylists.slice(0, 6)"
          :key="p.id"
          class="flex items-center gap-3.5 bg-white dark:bg-slate-900 rounded-xl p-3 cursor-pointer border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 group"
        >
          <div class="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 shadow-sm">
            <img :src="p.coverImgUrl" :alt="p.name" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-800 dark:text-slate-100 truncate group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">{{ p.name }}</p>
            <p class="text-xs text-slate-400 mt-0.5">{{ p.trackCount }} 首</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 每日推荐歌曲 -->
    <section v-if="recommendSongs.length">
      <h2 class="text-base font-semibold text-slate-700 dark:text-slate-200 mb-4">每日推荐</h2>
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div
          v-for="(s, i) in recommendSongs.slice(0, 8)"
          :key="s.id"
          class="flex items-center gap-3.5 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border-b border-slate-50 dark:border-slate-800 last:border-b-0 transition-colors group"
        >
          <span class="w-5 text-xs text-slate-300 dark:text-slate-600 text-right flex-shrink-0 group-hover:text-rose-400 transition-colors">{{ i + 1 }}</span>
          <div class="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 shadow-sm">
            <img v-if="s.al?.picUrl" :src="s.al.picUrl" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-slate-700 dark:text-slate-200 truncate group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">{{ s.name }}</p>
            <p class="text-xs text-slate-400 truncate">{{ s.ar?.[0]?.name || s.artists?.[0]?.name }}</p>
          </div>
          <span class="text-xs text-slate-300 dark:text-slate-600 flex-shrink-0 group-hover:text-slate-400 transition-colors">{{ formatDuration(s.dt || s.duration) }}</span>
        </div>
      </div>
    </section>

  </div>
</template>
