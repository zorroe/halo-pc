// 首页 API
const API = ''

async function request(path: string, data: Record<string, any> = {}) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

// 个性推荐（ banners + 推荐歌单）
export async function getPersonalized() {
  return request('/personalized')
}

// 推荐歌曲
export async function getRecommendSongs() {
  return request('/recommend/songs')
}

// 热门歌单
export async function getTopPlaylist(limit = 20) {
  return request('/top/playlist', { limit })
}

// 新碟上架
export async function getAlbumNewest() {
  return request('/album/newest')
}

// 排行榜
export async function getTopSong() {
  return request('/top/song', { type: '0' })
}
