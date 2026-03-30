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

function formatDuration(ms: number) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="pb-20">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="text-4xl animate-pulse mb-2">🎵</div>
        <p class="text-gray-500 dark:text-gray-400 text-sm">加载中...</p>
      </div>
    </div>

    <div v-else class="space-y-8">

      <!-- Banner 轮播 -->
      <div v-if="banners.length" class="relative rounded-xl overflow-hidden h-40 sm:h-48">
        <div class="flex transition-transform duration-500" style="width: 200%">
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
        <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
          <span class="text-indigo-500">🎵</span> 推荐歌单
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          <div
            v-for="p in playlists.slice(0, 12)"
            :key="p.id"
            class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div class="aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 mb-2 relative">
              <img :src="p.picUrl || p.coverImgUrl" :alt="p.name" class="w-full h-full object-cover" />
              <div class="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5">
                ▶ {{ (p.playCount / 10000).toFixed(1) }}万
              </div>
            </div>
            <p class="text-sm font-medium line-clamp-2 leading-tight">{{ p.name }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ p.creator?.nickname || '' }}</p>
          </div>
        </div>
      </section>

      <!-- 排行榜 -->
      <section>
        <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
          <span class="text-yellow-500">🏆</span> 排行榜
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="p in topPlaylists.slice(0, 6)"
            :key="p.id"
            class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex gap-3"
          >
            <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              <img :src="p.coverImgUrl" :alt="p.name" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ p.name }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ p.trackCount }} 首</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 每日推荐歌曲 -->
      <section v-if="recommendSongs.length">
        <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
          <span class="text-pink-500">📅</span> 每日推荐
        </h2>
        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="(s, i) in recommendSongs.slice(0, 10)"
            :key="s.id"
            class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <span class="text-sm font-medium text-gray-400 w-5 text-center">{{ i + 1 }}</span>
            <div class="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 overflow-hidden flex-shrink-0">
              <img v-if="s.al?.picUrl" :src="s.al.picUrl" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm truncate">{{ s.name }}</p>
              <p class="text-xs text-gray-400 truncate">{{ s.ar?.map((a: any) => a.name).join(',') || s.artists?.map((a: any) => a.name).join(',') }}</p>
            </div>
            <span class="text-xs text-gray-400 flex-shrink-0">{{ formatDuration(s.dt || s.duration) }}</span>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>
