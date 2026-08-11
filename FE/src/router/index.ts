import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import AdminLoginView from '../views/AdminLoginView.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import ShopeeConfigView from '../views/ShopeeConfigView.vue'
import ZaloConfigView from '../views/ZaloConfigView.vue'
import { hasValidAdminSession } from '../services/api'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: AdminLoginView,
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
      {
        path: 'settings',
        name: 'settings',
        component: ZaloConfigView,
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

// Navigation Guard for Admin Routes
router.beforeEach(async (to) => {
  const isAdminRoute = to.path.startsWith('/admin') && to.path !== '/admin/login'
  const isAdminLoggedIn = await hasValidAdminSession()

  if (isAdminRoute && !isAdminLoggedIn) {
    return '/admin/login'
  } else if (to.path === '/admin/login' && isAdminLoggedIn) {
    return '/admin/shopee-config'
  }
})

export default router
