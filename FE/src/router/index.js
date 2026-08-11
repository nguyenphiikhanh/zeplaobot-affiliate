import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import AdminLoginView from '../views/AdminLoginView.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import ShopeeConfigView from '../views/ShopeeConfigView.vue'
import ZaloConfigView from '../views/ZaloConfigView.vue'

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
router.beforeEach((to, from, next) => {
  const isAdminRoute = to.path.startsWith('/admin') && to.path !== '/admin/login'
  const isAdminLoggedIn = localStorage.getItem('admin_token') === 'true'

  if (isAdminRoute && !isAdminLoggedIn) {
    // If accessing any admin route without being logged in, redirect to /admin/login
    next('/admin/login')
  } else if (to.path === '/admin/login' && isAdminLoggedIn) {
    // If already logged in, skip login page
    next('/admin/shopee-config')
  } else {
    next()
  }
})

export default router
