import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import { getSessionUser } from '../services/api'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: true },
  },
  { path: '/orders', name: 'user-orders', component: () => import('../views/UserOrdersView.vue'), meta: { requiresAuth: true } },
  { path: '/wallet', name: 'user-wallet', component: () => import('../views/UserWalletView.vue'), meta: { requiresAuth: true } },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('../views/AdminLoginView.vue'),
  },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirect: '/admin/orders',
      },
      {
        path: 'orders',
        name: 'admin-orders',
        component: () => import('../views/OrdersView.vue'),
      },
      {
        path: 'link-history',
        name: 'admin-link-history',
        component: () => import('../views/LinkHistoryView.vue'),
      },
      {
        path: 'transaction-history',
        name: 'admin-transaction-history',
        component: () => import('../views/TransactionHistoryView.vue'),
      },
      {
        path: 'withdrawals',
        name: 'admin-withdrawals',
        component: () => import('../views/WithdrawalsView.vue'),
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('../views/UsersView.vue'),
      },
      {
        path: 'shopee-config',
        name: 'shopee-config',
        component: () => import('../views/ShopeeConfigView.vue'),
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('../views/ZaloConfigView.vue'),
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
    if (user?.role === 'admin') return '/admin/orders'
    if (user?.role === 'user') return '/'
  }

  // 2. User Routes Guard
  if (to.meta.requiresAuth) {
    if (!user) {
      return { path: '/login', query: { redirect: to.fullPath !== '/' ? to.fullPath : undefined } }
    }
    if (user.role === 'admin') return '/admin/orders'
  } else if (to.meta.guestOnly) {
    if (user) {
      return user.role === 'admin' ? '/admin/orders' : '/'
    }
  }
})

export default router
