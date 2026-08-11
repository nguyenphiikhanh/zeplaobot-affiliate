import {
    createRouter,
    createWebHistory,
} from 'vue-router';
import { useSiteSettings } from '@/composables/useSiteSettings';

const { siteSettings, loadSiteSettings } = useSiteSettings();

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/pages/public/Home.vue'),
        meta: {
            title: 'Trang chủ',
            layout: 'PublicLayout',
            requiresAuth: true,
            keepAlive: true
        },
    },
    {
        path: '/dang-nhap',
        name: 'login',
        component: () => import('@/pages/auth/Login.vue'),
        meta: {
            title: 'Đăng nhập',
            layout: 'AuthLayout',
            guestOnly: true
        },
    },
    {
        path: '/qua-tang',
        name: 'qua-tang',
        component: () => import('@/pages/public/QuaTang.vue'),
        meta: {
            title: 'Điểm danh nhận quà',
            layout: 'PublicLayout',
            requiresAuth: true,
            keepAlive: true
        },
    },
    {
        path: '/huong-dan',
        name: 'huong-dan',
        component: () => import('@/pages/public/HuongDan.vue'),
        meta: {
            title: 'Hướng dẫn sử dụng',
            layout: 'PublicLayout',
            keepAlive: true
        },
    },
    {
        path: '/ho-tro',
        name: 'ho-tro',
        component: () => import('@/pages/public/HoTro.vue'),
        meta: {
            title: 'Trung tâm hỗ trợ',
            layout: 'PublicLayout',
            keepAlive: true
        },
    },
    {
        path: '/hoan-tien',
        name: 'hoan-tien',
        component: () => import('@/pages/user/HoanTien.vue'),
        meta: {
            title: 'Quy đổi hoàn tiền',
            layout: 'PublicLayout',
            requiresAuth: true
        },
    },
    {
        path: '/gioi-thieu',
        name: 'gioi-thieu',
        component: () => import('@/pages/user/GioiThieu.vue'),
        meta: {
            title: 'Giới thiệu nhận thưởng',
            layout: 'PublicLayout',
            requiresAuth: true
        },
    },
    {
        path: '/don-hang',
        name: 'don-hang',
        component: () => import('@/pages/user/DonHang.vue'),
        meta: {
            title: 'Lịch sử đơn hàng',
            layout: 'PublicLayout',
            requiresAuth: true
        },
    },
    {
        path: '/ho-so',
        name: 'ho-so',
        component: () => import('@/pages/user/HoSo.vue'),
        meta: {
            title: 'Hồ sơ cá nhân',
            layout: 'PublicLayout',
            requiresAuth: true
        },
    },
    {
        path: '/tai-chinh',
        name: 'tai-chinh',
        component: () => import('@/pages/user/TaiChinh.vue'),
        meta: {
            title: 'Tài chính & Rút tiền',
            layout: 'PublicLayout',
            requiresAuth: true
        },
    },

    {
        path: '/admin',
        component: () => import('@/layouts/AdminLayout.vue'),
        meta: {
            requiresAuth: true,
            requiresAdmin: true,
            layout: 'EmptyLayout'
        },
        children: [
            {
                path: '',
                name: 'admin-dashboard',
                component: () => import('@/pages/admin/Dashboard.vue'),
                meta: { title: 'Tổng quan' }
            },
            {
                path: 'analytics',
                name: 'admin-analytics',
                component: () => import('@/pages/admin/Analytics.vue'),
                meta: { title: 'Thống kê' }
            },
            {
                path: 'orders',
                name: 'admin-orders',
                component: () => import('@/pages/admin/Orders.vue'),
                meta: { title: 'Quản lý đơn hàng' }
            },
            {
                path: 'withdrawals',
                name: 'admin-withdrawals',
                component: () => import('@/pages/admin/Withdrawals.vue'),
                meta: { title: 'Yêu cầu rút tiền' }
            },
            {
                path: 'users',
                name: 'admin-users',
                component: () => import('@/pages/admin/Users.vue'),
                meta: { title: 'Quản lý người dùng' }
            },
            {
                path: 'blacklist',
                name: 'admin-blacklist',
                component: () => import('@/pages/admin/Blacklist.vue'),
                meta: { title: 'Danh sách ghim (Blacklist)' }
            },
            {
                path: 'transaction-history',
                name: 'admin-transactions',
                component: () => import('@/pages/admin/TransactionHistory.vue'),
                meta: { title: 'Lịch sử giao dịch' }
            },
            {
                path: 'link-history',
                name: 'admin-links',
                component: () => import('@/pages/admin/LinkHistory.vue'),
                meta: { title: 'Lịch sử link affiliate' }
            },
            {
                path: 'tools',
                name: 'admin-tools',
                component: () => import('@/pages/admin/Tools.vue'),
                meta: { title: 'Công cụ Affiliate' }
            },
            {
                path: 'settings',
                name: 'admin-settings',
                component: () => import('@/pages/admin/Settings.vue'),
                redirect: { name: 'admin-settings-general' },
                meta: { title: 'Cài đặt hệ thống' },
                children: [
                    {
                        path: '',
                        name: 'admin-settings-general',
                        component: () => import('@/pages/admin/settings/GeneralSettings.vue'),
                        meta: { title: 'Cấu hình chung' }
                    },
                    {
                        path: 'shopee',
                        name: 'admin-settings-shopee',
                        component: () => import('@/pages/admin/settings/ShopeeSettings.vue'),
                        meta: { title: 'Cấu hình hoàn tiền Shopee' }
                    },
                    {
                        path: 'tiktok-shop',
                        name: 'admin-settings-tiktok',
                        component: () => import('@/pages/admin/settings/TikTokSettings.vue'),
                        meta: { title: 'Cấu hình hoàn tiền TikTok Shop' }
                    },
                    {
                        path: 'lazada',
                        name: 'admin-settings-lazada',
                        component: () => import('@/pages/admin/settings/LazadaSettings.vue'),
                        meta: { title: 'Cấu hình hoàn tiền Lazada' }
                    },
                    {
                        path: 'checkin-gift',
                        name: 'admin-settings-checkin-gift',
                        component: () => import('@/pages/admin/settings/CheckinGiftSettings.vue'),
                        meta: { title: 'Cấu hình Quà điểm danh' }
                    },
                    {
                        path: 'email-templates',
                        name: 'admin-settings-email',
                        component: () => import('@/pages/admin/EmailTemplates.vue'),
                        meta: { title: 'Cấu hình Email' }
                    }
                ]
            },
            {
                path: 'email-templates',
                name: 'admin-email-templates',
                redirect: { name: 'admin-settings-email' }
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/pages/NotFoundPage.vue'),
        meta: {
            title: 'Không tìm thấy trang',
            layout: 'PublicLayout'
        },
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        return { top: 0, left: 0 };
    }
});

// Version Update Auto-Reload System
let currentVersion: string | number | null = null;
let isReloading = false;

async function checkVersionUpdate() {
    if (import.meta.env.DEV || isReloading) return;
    try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (currentVersion === null) {
            currentVersion = data.version;
        } else if (data.version && data.version !== currentVersion) {
            isReloading = true;
            console.log('Phát hiện phiên bản mới. Đang làm mới ứng dụng...');
            window.location.reload();
        }
    } catch (e) {
        // Silently ignore fetch errors
    }
}

// Option B: Catch Vite Dynamic Import Failure (Missing JS chunk after deployment)
router.onError((error, to) => {
    if (
        error.message?.includes('Failed to fetch dynamically imported module') ||
        error.message?.includes('Importing a module script failed') ||
        error.message?.includes('dynamically imported module')
    ) {
        const reloadKey = 'route_reload_' + (to?.path || 'current');
        if (!sessionStorage.getItem(reloadKey)) {
            sessionStorage.setItem(reloadKey, 'true');
            console.warn('Phát hiện thay đổi bundle assets. Đang tự động tải lại...');
            window.location.href = to?.fullPath || window.location.href;
        } else {
            console.error('Lỗi nạp component động:', error);
        }
    }
});

import { useAuthStore } from '@/stores/auth';

router.beforeEach(async (to, from, next) => {
    // Check version update on route changes
    checkVersionUpdate();

    const authStore = useAuthStore();
    await loadSiteSettings();

    // Auto fetch user profile if token exists but user is not loaded
    if (authStore.token && !authStore.user) {
        await authStore.fetchUser();
    }

    const isAuthenticated = !!authStore.token;

    // Handle ?ref=CODE query parameter: save ref ONLY if guest, and strip ?ref from URL using replace
    if (to.query.ref && typeof to.query.ref === 'string') {
        const refCode = to.query.ref.trim();
        if (!isAuthenticated) {
            localStorage.setItem('saffi_ref_code', refCode);
        }

        const newQuery = { ...to.query };
        delete newQuery.ref;

        return next({
            path: to.path,
            query: newQuery,
            hash: to.hash,
            replace: true
        });
    }

    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'login' });
    } else if (to.name === 'qua-tang' && authStore.user?.checkin_gift?.enabled === false) {
        next({ name: 'tai-chinh' });
    } else if (to.meta.guestOnly && isAuthenticated) {
        if (authStore.user?.role === 'admin') {
            next({ name: 'admin-dashboard' });
        } else {
            next({ name: 'home' });
        }
    } else if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
        next({ name: 'home' }); // Redirect non-admins to home
    } else if (authStore.user?.role === 'admin' && !to.path.startsWith('/admin') && to.name !== 'login') {
        // Admin user accessing non-admin page
        next({ name: 'admin-dashboard' });
    } else {
        next();
    }
});

router.afterEach((to) => {
    window.scrollTo(0, 0);
    document.title = to.meta.title
        ? `${to.meta.title} | ${siteSettings.value.site_name}`
        : siteSettings.value.site_name;
});

export default router;
