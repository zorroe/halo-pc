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
  <div v-if="loading" class="flex items-center justify-center py-32">
    <div class="flex flex-col items-center gap-4">
      <div class="w-10 h-10 border-2 border-slate-200 border-t-rose-400 rounded-full animate-spin"></div>
      <p class="text-base text-slate-400">正在加载...</p>
    </div>
  </div>

  <div v-else class="space-y-14 pb-20">

    <!-- Banner -->
    <div v-if="banners.length" class="rounded-2xl overflow-hidden shadow-sm h-52 bg-slate-100 dark:bg-slate-800">
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
      <h2 class="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-6">推荐歌单</h2>
      <div class="flex gap-6 overflow-x-auto pb-4">
        <div
          v-for="p in playlists.slice(0, 12)"
          :key="p.id"
          class="flex-shrink-0 cursor-pointer group"
          style="width: 180px"
        >
          <div class="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 relative shadow-sm">
            <img
              :src="p.picUrl || p.coverImgUrl"
              :alt="p.name"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div v-if="p.playCount" class="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
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
      <h2 class="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-6">排行榜</h2>
      <div class="flex gap-5 overflow-x-auto pb-4">
        <div
          v-for="p in topPlaylists.slice(0, 6)"
          :key="p.id"
          class="flex-shrink-0 flex items-center gap-4 bg-white dark:bg-slate-900 rounded-xl px-4 py-3 cursor-pointer border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 group"
          style="width: 320px"
        >
          <div class="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 shadow-sm">
            <img :src="p.coverImgUrl" :alt="p.name" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-base font-medium text-slate-800 dark:text-slate-100 truncate group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">{{ p.name }}</p>
            <p class="text-sm text-slate-400 mt-1">{{ p.trackCount }} 首</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 每日推荐歌曲 -->
    <section v-if="recommendSongs.length">
      <h2 class="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-6">每日推荐</h2>
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <table class="w-full">
          <thead>
            <tr class="text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <th class="text-left py-3 px-6 font-medium w-12">#</th>
              <th class="text-left py-3 px-2 font-medium">歌曲</th>
              <th class="text-left py-3 px-2 font-medium hidden md:table-cell">歌手</th>
              <th class="text-left py-3 px-2 font-medium hidden lg:table-cell">专辑</th>
              <th class="text-right py-3 px-6 font-medium w-20">时长</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(s, i) in recommendSongs.slice(0, 12)"
              :key="s.id"
              class="group border-b border-slate-50 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
            >
              <td class="py-3.5 px-6 text-sm text-slate-300 dark:text-slate-600 group-hover:text-rose-400 transition-colors">{{ i + 1 }}</td>
              <td class="py-3.5 px-2">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 shadow-sm">
                    <img v-if="s.al?.picUrl" :src="s.al.picUrl" class="w-full h-full object-cover" />
                  </div>
                  <span class="text-sm text-slate-700 dark:text-slate-200 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors truncate max-w-xs">{{ s.name }}</span>
                </div>
              </td>
              <td class="py-3.5 px-2 text-sm text-slate-400 hidden md:table-cell truncate max-w-xs">{{ s.ar?.[0]?.name || s.artists?.[0]?.name }}</td>
              <td class="py-3.5 px-2 text-sm text-slate-400 hidden lg:table-cell truncate max-w-xs">{{ s.al?.name || '-' }}</td>
              <td class="py-3.5 px-6 text-sm text-slate-300 dark:text-slate-600 text-right group-hover:text-slate-400 transition-colors">{{ formatDuration(s.dt || s.duration) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

  </div>
</template>
