// 首页 API
import { request } from './request'

export async function getPersonalized() {
  return request('/personalized')
}

export async function getRecommendSongs() {
  return request('/recommend/songs')
}

export async function getTopPlaylist(limit = 20) {
  return request('/top/playlist', { limit })
}

export async function getAlbumNewest() {
  return request('/album/newest')
}

export async function getTopSong() {
  return request('/top/song', { type: '0' })
}

// 用户喜欢的歌曲列表（先查 ID，再批量查详情）
export async function getLikeList(uid: number) {
  const res = await request('/likelist', { uid }) as any
  if (res.code !== 200 || !res.ids?.length) {
    return { code: 200, songs: [] }
  }
  // 批量查询歌曲详情（最多 100 首）
  const ids = res.ids.slice(0, 100).join(',')
  const detailRes = await request('/song/detail', { ids }) as any
  return { code: 200, songs: detailRes.songs || [] }
}

// 批量查询歌曲详情
export async function getSongDetail(ids: number[]) {
  if (!ids.length) return { code: 200, songs: [] }
  const idsStr = ids.slice(0, 100).join(',')
  return request('/song/detail', { ids: idsStr })
}

// 用户的所有歌单（可按 type 区分：0=全部, 1=创建, 2=收藏）
export async function getUserPlaylist(uid: number, type = 0) {
  return request('/user/playlist', { uid, type })
}
