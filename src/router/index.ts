import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import MainLayout from '../components/layouts/MainLayout.vue'
import UserProfile from '../components/UserProfile.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home', component: MainLayout },
    { path: '/profile', component: UserProfile },
  ]
})

export default router
