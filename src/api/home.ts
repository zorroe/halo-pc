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

// 用户喜欢的歌曲列表
export async function getLikeList(uid: number) {
  return request('/likelist', { uid })
}

// 用户的所有歌单（可按 type 区分：0=全部, 1=创建, 2=收藏）
export async function getUserPlaylist(uid: number, type = 0) {
  return request('/user/playlist', { uid, type })
}

