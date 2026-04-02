<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { logout } from '../api/login'
import { getPlaylistTracks, getUserPlaylist } from '../api/home'
import { getUserDetail } from '../api/login'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const likeSongs = ref<any[]>([])
const createdPlaylists = ref<any[]>([])
const likedPlaylists = ref<any[]>([])
const likePlaylistId = ref<number | null>(null)
const userDetail = ref<any>(null)

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
    // 获取用户详情（等级、关注、粉丝等）
    const detailRes = await getUserDetail(uid)
    if (detailRes.code === 200) {
      userDetail.value = detailRes
      console.log('[Profile] user detail:', JSON.stringify(detailRes))
      console.log('[Profile] follows:', detailRes.profile?.follows, 'followeds:', detailRes.profile?.followeds, 'level:', detailRes.level, 'province:', detailRes.profile?.province, 'city:', detailRes.profile?.city)
    }

    const playlistRes = await getUserPlaylist(uid)
    if (playlistRes.code === 200) {
      const all = playlistRes.playlist || []
      createdPlaylists.value = all.filter((p: any) => String(p.userId) === String(uid))
      likedPlaylists.value = all.filter((p: any) => String(p.userId) !== String(uid))
      // 找到"我喜欢的音乐"歌单
      const likePlaylist = all.find((p: any) =>
        String(p.userId) === String(uid) && (p.specialType === 5 || (p.name && p.name.includes('喜欢的音乐')))
      )
      if (likePlaylist) {
        likePlaylistId.value = likePlaylist.id
        likeTotalCount.value = likePlaylist.trackCount || 0
        await loadLikeSongs(1)
      }
    }
  } catch (e) {
    console.error('Load profile data failed:', e)
  }
  loading.value = false
})

async function loadLikeSongs(page: number) {
  if (!likePlaylistId.value) return
  if (page === 1) {
    loading.value = true
  } else {
    likeLoadingMore.value = true
  }
  likeCurrentPage.value = page

  try {
    const offset = (page - 1) * PAGE_SIZE
    const res = await getPlaylistTracks(likePlaylistId.value, PAGE_SIZE, offset)
    if (res.code === 200) {
      likeSongs.value = res.songs || []
      console.log('[Profile] loadLikeSongs page', page, 'got songs:', likeSongs.value.length)
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

// 省份 ID 到中文名的映射（网易云 6 位码）
const provinceMap: Record<number, string> = {
  110000: '北京', 120000: '天津', 130000: '河北', 140000: '山西', 150000: '内蒙古',
  210000: '辽宁', 220000: '吉林', 230000: '黑龙江',
  310000: '上海', 320000: '江苏', 330000: '浙江', 340000: '安徽', 350000: '福建', 360000: '江西', 370000: '山东',
  410000: '河南', 420000: '湖北', 430000: '湖南', 440000: '广东', 450000: '广西', 460000: '海南',
  500000: '重庆', 510000: '四川', 520000: '贵州', 530000: '云南', 540000: '西藏',
  610000: '陕西', 620000: '甘肃', 630000: '青海', 640000: '宁夏', 650000: '新疆',
  710000: '台湾', 810000: '香港', 820000: '澳门',
}

function getRegionText(provinceCode?: number, cityCode?: number) {
  if (!provinceCode) return '-'
  const provinceName = provinceMap[provinceCode] || String(provinceCode)
  if (!cityCode) return provinceName
  return `${provinceName} · ${cityCode}`
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
        <div class="w-32 h-32 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-800 flex-shrink-0">
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
            <span class="text-sm text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">Lv.{{ userDetail?.level || '-' }}</span>
          </div>
          <p v-if="userStore.userInfo?.signature" class="text-sm text-slate-400 mt-2 leading-relaxed">{{ userStore.userInfo.signature }}</p>

          <!-- Stats -->
          <div class="flex gap-10 mt-5">
            <div>
              <p class="text-2xl font-semibold text-slate-800 dark:text-white">{{ userDetail?.profile?.follows || 0 }}</p>
              <p class="text-sm text-slate-400">关注</p>
            </div>
            <div>
              <p class="text-2xl font-semibold text-slate-800 dark:text-white">{{ userDetail?.profile?.followeds || 0 }}</p>
              <p class="text-sm text-slate-400">粉丝</p>
            </div>
            <div>
              <p class="text-2xl font-semibold text-slate-800 dark:text-white">{{ userDetail?.profile?.playlistCount || 0 }}</p>
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
            <span class="ml-3 text-slate-700 dark:text-slate-200">{{ getRegionText(userDetail?.profile?.province, userDetail?.profile?.city) }}</span>
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
