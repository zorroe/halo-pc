import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import UserProfile from '../components/UserProfile.vue'
import PlaylistDetail from '../components/PlaylistDetail.vue'
import ArtistList from '../components/ArtistList.vue'
import ArtistDetail from '../components/ArtistDetail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home', component: Home },
    { path: '/profile', component: UserProfile },
    { path: '/playlist/:id', component: PlaylistDetail },
    { path: '/artist', component: ArtistList },
    { path: '/artist/:id', component: ArtistDetail },
    { path: '/:pathMatch(.*)*', redirect: '/home' },
  ]
})

export default router
