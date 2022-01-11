// import { defineProps } from 'vue'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    redirect: '/multiplayer',
    // component: () => import('../App.vue'),
  },
  {
    path: '/multiplayer',
    name: 'Multiplayer',
    component: () => import('../views/Multiplayer.vue'),
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/Profile.vue'),
    props: true
  },
  {
    path: '/rules',
    name: 'rules',
    component: () => import('../views/Rules.vue'),
  },
  {
    path: '/profile/:userid',
    name: 'profile_others',
    component: () => import('../views/Profile_others.vue'),
    props: true
  },
  {
    path: '/admin/',
    name: 'admin',
    component: () => import('../views/Admin.vue'),
    props: true
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('../views/Chat.vue'),
    props: true
  },
  {
    path: '/game/:gameid',
    name: 'game',
    component: () => import('../views/Game.vue'),
    props: true
  },
  {
    path: '/setgame',
    name: 'SetGame',
    component: () => import('../views/SetGame.vue'),
    props: true
  },
  {
    path: '/2FA',
    name: 'TWOFA',
    component: () => import('../views/Validate2FA.vue'),
    props: true
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    props: true
  },
  {
    path: '/:catchAll(.*)',
    name: 'PageNotFound',
    component: () => import('../views/PageNotFound.vue')
  },
  {
    path: '/leaderboard',
    name: 'Leaderboard',
    component: () => import('../views/Leaderboard.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
