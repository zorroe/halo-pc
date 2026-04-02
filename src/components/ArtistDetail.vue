<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArtistDetail, getArtistAlbum, getArtistMv, getSimilarArtists } from '../api/home'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const artist = ref<any>(null)
const hotSongs = ref<any[]>([])
const albums = ref<any[]>([])
const mvs = ref<any[]>([])
const similarArtists = ref<any[]>([])
const activeTab = ref<'songs' | 'albums' | 'mvs' | 'simi'>('songs')

const artistId = Number(route.params.id)

onMounted(async () => {
  await loadArtist()
  loading.value = false
})

async function loadArtist() {
  try {
    const [detailRes, albumRes, mvRes, simiRes] = await Promise.all([
      getArtistDetail(artistId),
      getArtistAlbum(artistId),
      getArtistMv(artistId),
      getSimilarArtists(artistId),
    ])
    if (detailRes.code === 200) {
      artist.value = detailRes.artist || {}
      hotSongs.value = detailRes.hotSongs || []
    }
    if (albumRes.code === 200) {
      albums.value = albumRes.hotAlbums || []
    }
    if (mvRes.code === 200) {
      mvs.value = mvRes.mvs || []
    }
    if (simiRes.code === 200) {
      similarArtists.value = simiRes.artists || []
    }
  } catch (e) {
    console.error('Load artist failed:', e)
  }
}

function goArtist(a: any) {
  router.push(`/artist/${a.id}`)
}

function formatDuration(ms: number) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDate(ts: number) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
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
      <div class="w-8 h-8 border-2 border-slate-200 border-t-rose-400 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="artist" class="space-y-8 pb-20">

      <!-- Artist Header -->
      <div class="flex gap-8 items-start">
        <div class="w-40 h-40 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 shadow-lg">
          <img
            v-if="artist.picUrl"
            :src="artist.picUrl"
            :alt="artist.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-slate-400 text-5xl">🎤</div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-2xl font-semibold text-slate-800 dark:text-white">{{ artist.name }}</h1>
            <span class="px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 text-xs rounded-full">歌手</span>
          </div>
          <p v-if="artist.alias?.length" class="text-sm text-slate-400 mb-3">{{ artist.alias.join(' / ') }}</p>
          <p v-if="artist.briefDesc" class="text-sm text-slate-400 leading-relaxed line-clamp-2">{{ artist.briefDesc }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-8 border-b border-slate-100 dark:border-slate-800 pb-0">
        <button
          v-for="tab in [
            { id: 'songs', name: '热门歌曲' },
            { id: 'albums', name: '专辑' },
            { id: 'mvs', name: 'MV' },
            { id: 'simi', name: '相似歌手' },
          ]"
          :key="tab.id"
          class="pb-3 text-sm font-medium transition-colors border-b-2 -mb-px"
          :class="activeTab === tab.id
            ? 'text-rose-500 border-rose-500'
            : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-200'"
          @click="activeTab = tab.id as any"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- Hot Songs -->
      <div v-if="activeTab === 'songs'">
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
          <table class="w-full">
            <thead>
              <tr class="text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th class="text-left py-3 px-5 font-medium w-12">#</th>
                <th class="text-left py-3 px-2 font-medium">歌曲</th>
                <th class="text-left py-3 px-2 font-medium hidden md:table-cell">专辑</th>
                <th class="text-right py-3 px-5 font-medium w-20">时长</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(s, i) in hotSongs"
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
                <td class="py-3.5 px-2 text-sm text-slate-400 hidden md:table-cell truncate max-w-xs">{{ s.al?.name || '-' }}</td>
                <td class="py-3.5 px-5 text-sm text-slate-300 dark:text-slate-600 text-right group-hover:text-slate-400 transition-colors">{{ formatDuration(s.dt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Albums -->
      <div v-if="activeTab === 'albums'">
        <div v-if="albums.length === 0" class="text-center py-10 text-slate-400">暂无专辑</div>
        <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-5">
          <div
            v-for="album in albums"
            :key="album.id"
            class="cursor-pointer group"
          >
            <div class="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2 relative shadow-sm">
              <img v-if="album.picUrl" :src="album.picUrl" :alt="album.name" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-slate-400 text-4xl">💿</div>
            </div>
            <p class="text-sm text-slate-700 dark:text-slate-200 truncate group-hover:text-rose-500 transition-colors">{{ album.name }}</p>
            <p class="text-xs text-slate-400 mt-0.5">{{ formatDate(album.publishTime) }}</p>
          </div>
        </div>
      </div>

      <!-- MVs -->
      <div v-if="activeTab === 'mvs'">
        <div v-if="mvs.length === 0" class="text-center py-10 text-slate-400">暂无 MV</div>
        <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-5">
          <div
            v-for="mv in mvs"
            :key="mv.id"
            class="cursor-pointer group"
          >
            <div class="aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2 relative shadow-sm">
              <img v-if="mv.cover" :src="mv.cover" :alt="mv.name" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-slate-400 text-4xl">🎬</div>
              <div v-if="mv.duration" class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">{{ formatDuration(mv.duration) }}</div>
            </div>
            <p class="text-sm text-slate-700 dark:text-slate-200 truncate group-hover:text-rose-500 transition-colors">{{ mv.name }}</p>
          </div>
        </div>
      </div>

      <!-- Similar Artists -->
      <div v-if="activeTab === 'simi'">
        <div v-if="similarArtists.length === 0" class="text-center py-10 text-slate-400">暂无相似歌手</div>
        <div v-else class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-5">
          <div
            v-for="a in similarArtists"
            :key="a.id"
            class="cursor-pointer group text-center"
            @click="goArtist(a)"
          >
            <div class="aspect-square rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2 shadow-sm group-hover:shadow-md transition-shadow mx-auto">
              <img v-if="a.picUrl" :src="a.picUrl" :alt="a.name" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-slate-400 text-3xl">🎤</div>
            </div>
            <p class="text-sm text-slate-700 dark:text-slate-200 truncate group-hover:text-rose-500 transition-colors">{{ a.name }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
