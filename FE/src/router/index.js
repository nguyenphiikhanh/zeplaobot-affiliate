import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import ShopeeConfigView from '../views/ShopeeConfigView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirect: '/admin/shopee-config',
      },
      {
        path: 'shopee-config',
        name: 'shopee-config',
        component: ShopeeConfigView,
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
