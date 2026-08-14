import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import UserPageLayout from '../components/UserPageLayout.vue'
import HomeView from '../views/HomeView.vue'
import UserGenerateLinkView from '../views/UserGenerateLinkView.vue'
import UserWalletView from '../views/UserWalletView.vue'
import UserOrdersView from '../views/UserOrdersView.vue'
import UserProfileView from '../views/UserProfileView.vue'
import { getSessionUser } from '../services/api'
import { saveUserRedirectPath } from '../services/user-redirect'

const routes = [
  {
    path: '/',
    component: UserPageLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'home', component: HomeView },
      { path: 'generate-link', name: 'user-generate-link', component: UserGenerateLinkView },
      { path: 'wallet', name: 'user-wallet', component: UserWalletView },
      { path: 'orders', name: 'user-orders', component: UserOrdersView },
      { path: 'profile', name: 'user-profile', component: UserProfileView },
    ],
  },
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
      {
        path: 'general-config',
        name: 'general-config',
        component: () => import('../views/GeneralConfigView.vue'),
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
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0, left: 0 }
  },
})

router.afterEach(() => {
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
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
      saveUserRedirectPath(to.fullPath)
      return '/login'
    }
    if (user.role === 'admin') return '/admin/orders'
  } else if (to.meta.guestOnly) {
    if (user) {
      return user.role === 'admin' ? '/admin/orders' : '/'
    }
  }
})

export default router
