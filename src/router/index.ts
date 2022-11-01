import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/map'
  },
  {
    path: '/map/:id',
    component: () => import ('../views/MapPage.vue')
  },
  {
    path: '/map',
    component: () => import ('../views/MapPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
