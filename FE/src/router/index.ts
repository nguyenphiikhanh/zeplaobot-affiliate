import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import AdminLoginView from '../views/AdminLoginView.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import ShopeeConfigView from '../views/ShopeeConfigView.vue'
import ZaloConfigView from '../views/ZaloConfigView.vue'
import { getSessionUser } from '../services/api'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true },
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

// Navigation Guard for Admin & User Routes with Strict Role Isolation
router.beforeEach(async (to) => {
  const isAdminRoute = to.path.startsWith('/admin') && to.path !== '/admin/login'
  const user = await getSessionUser()

  // 1. Admin Routes Guard
  if (isAdminRoute) {
    if (!user) return '/admin/login'
    if (user.role !== 'admin') return '/'
  } else if (to.path === '/admin/login') {
    if (user?.role === 'admin') return '/admin/shopee-config'
    if (user?.role === 'user') return '/'
  }

  // 2. User Routes Guard
  if (to.meta.requiresAuth) {
    if (!user) {
      return { path: '/login', query: { redirect: to.fullPath !== '/' ? to.fullPath : undefined } }
    }
    if (user.role === 'admin') return '/admin/shopee-config'
  } else if (to.meta.guestOnly) {
    if (user) {
      return user.role === 'admin' ? '/admin/shopee-config' : '/'
    }
  }
})




export default router
