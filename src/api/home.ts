// 首页 API - 使用带 cookie 的 request
import { request } from './request'

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
