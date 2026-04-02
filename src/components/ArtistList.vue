<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getArtistList } from '../api/home'

const router = useRouter()
const loading = ref(true)
const artists = ref<any[]>([])
const loadingMore = ref(false)
const offset = ref(0)
const hasMore = ref(true)

const PAGE_SIZE = 30
const categories = [
  { id: 1001, name: '华语' },
  { id: 1002, name: '欧美' },
  { id: 1003, name: '日本' },
  { id: 1004, name: '韩国' },
  { id: 2001, name: '流行' },
  { id: 2002, name: '摇滚' },
  { id: 2003, name: '民谣' },
  { id: 2010, name: '电子' },
  { id: 2012, name: '说唱' },
  { id: 6001, name: '原创' },
  { id: 7001, name: '明星' },
]
const currentCat = ref(1001)

onMounted(() => {
  loadArtists(true)
})

async function loadArtists(reset = false) {
  if (reset) {
    offset.value = 0
    hasMore.value = true
    artists.value = []
  }
  if (!hasMore.value) return

  if (reset) {
    loading.value = true
  } else {
    loadingMore.value = true
  }

  try {
    const res = await getArtistList(currentCat.value, PAGE_SIZE, offset.value)
    if (res.code === 200) {
      if (reset) {
        artists.value = res.artists || []
      } else {
        artists.value.push(...(res.artists || []))
      }
      hasMore.value = res.more !== false && artists.value.length > 0
      offset.value += PAGE_SIZE
    }
  } catch (e) {
    console.error('Load artists failed:', e)
  }
  loading.value = false
  loadingMore.value = false
}

function switchCat(catId: number) {
  if (catId === currentCat.value) return
  currentCat.value = catId
  loadArtists(true)
}

function goArtist(artist: any) {
  router.push(`/artist/${artist.id}`)
}

</script>

<template>
  <div class="max-w-6xl mx-auto">

    <!-- Back -->
    <button
      class="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mb-8 transition-colors"
      @click="router.back()"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      返回
    </button>

    <h1 class="text-2xl font-semibold text-slate-800 dark:text-white mb-6">歌手</h1>

    <!-- Category Tabs -->
    <div class="flex gap-2 mb-8 flex-wrap">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="px-4 py-1.5 rounded-full text-sm transition-colors"
        :class="currentCat === cat.id
          ? 'bg-rose-500 text-white'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'"
        @click="switchCat(cat.id)"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- Artist Grid -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 border-slate-200 border-t-rose-400 rounded-full animate-spin"></div>
    </div>

    <div v-else>
      <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-5">
        <div
          v-for="artist in artists"
          :key="artist.id"
          class="cursor-pointer group"
          @click="goArtist(artist)"
        >
          <div class="aspect-square rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2 shadow-sm group-hover:shadow-md transition-shadow">
            <img
              v-if="artist.picUrl"
              :src="artist.picUrl"
              :alt="artist.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-slate-400 text-3xl">🎤</div>
          </div>
          <p class="text-sm text-slate-700 dark:text-slate-200 text-center truncate group-hover:text-rose-500 transition-colors">{{ artist.name }}</p>
          <p v-if="artist.alias?.length" class="text-xs text-slate-400 text-center truncate">{{ artist.alias[0] }}</p>
        </div>
      </div>

      <!-- Load More -->
      <div v-if="hasMore" class="flex justify-center mt-10">
        <button
          :disabled="loadingMore"
          class="px-8 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-sm disabled:opacity-50 transition-colors"
          @click="loadArtists(false)"
        >
          {{ loadingMore ? '加载中...' : '加载更多' }}
        </button>
      </div>

      <div v-if="artists.length === 0 && !loading" class="text-center py-20 text-slate-400">
        暂无歌手
      </div>
    </div>
  </div>
</template>
