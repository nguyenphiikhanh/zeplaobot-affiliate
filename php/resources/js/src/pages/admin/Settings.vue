<template>
    <div class="pb-12">
        <header class="mb-6">
            <h2 class="m-0 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Cài đặt website
            </h2>
            <p class="mt-1 mb-0 text-sm text-slate-500 dark:text-slate-400">
                Cấu hình tham số vận hành và các nền tảng hoàn tiền.
            </p>
        </header>

        <div class="settings-shell">
            <nav class="settings-menu" aria-label="Danh mục cài đặt">
                <router-link
                    v-for="item in menuItems"
                    :key="item.name"
                    :to="{ name: item.name }"
                    class="settings-menu-item"
                >
                    <component :is="item.icon" class="text-lg shrink-0"/>
                    <span>{{ item.label }}</span>
                </router-link>
            </nav>

            <main class="min-w-0 p-5 lg:p-7">
                <router-view/>
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    GlobalOutlined,
    InboxOutlined,
    MailOutlined,
    ShoppingCartOutlined,
    GiftOutlined,
} from '@ant-design/icons-vue';

const menuItems = [
    {
        name: 'admin-settings-general',
        label: 'Cấu hình chung',
        icon: GlobalOutlined,
    },
    {
        name: 'admin-settings-shopee',
        label: 'Cấu hình hoàn tiền Shopee',
        icon: InboxOutlined,
    },
    {
        name: 'admin-settings-tiktok',
        label: 'Cấu hình hoàn tiền TikTok Shop',
        icon: ShoppingCartOutlined,
    },
    {
        name: 'admin-settings-lazada',
        label: 'Cấu hình hoàn tiền Lazada',
        icon: InboxOutlined,
    },
    {
        name: 'admin-settings-email',
        label: 'Cấu hình Email',
        icon: MailOutlined,
    },
    {
        name: 'admin-settings-checkin-gift',
        label: 'Quà điểm danh',
        icon: GiftOutlined,
    },
];
</script>

<style scoped>
.settings-shell {
    display: grid;
    grid-template-columns: 310px minmax(0, 1fr);
    height: calc(100vh - 184px);
    min-height: 520px;
    max-height: calc(100vh - 184px);
    overflow: hidden;
    border: 1px solid rgb(226 232 240);
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
}

.settings-menu {
    min-width: 0;
    overflow-y: auto;
    border-right: 1px solid rgb(226 232 240);
    background: rgb(248 250 252 / 0.55);
}

.settings-menu-item {
    position: relative;
    display: flex;
    width: 100%;
    height: 72px;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    color: rgb(100 116 139);
    font-size: 13px;
    font-weight: 700;
    transition: color 0.2s ease, background-color 0.2s ease;
}

.settings-menu-item > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.settings-shell > main {
    height: 100%;
    overflow-y: auto;
}

.settings-menu-item:hover {
    color: #ee4d2d;
    background: #fff;
}

.settings-menu-item.router-link-exact-active {
    color: #ee4d2d;
    background: #fff;
}

.settings-menu-item.router-link-exact-active::after {
    position: absolute;
    inset: 0 0 0 auto;
    width: 3px;
    background: #ee4d2d;
    content: '';
}

:global(.dark) .settings-shell {
    border-color: rgb(30 41 59);
    background: rgb(15 23 42);
}

:global(.dark) .settings-menu {
    border-color: rgb(30 41 59);
    background: rgb(2 6 23 / 0.25);
}

:global(.dark) .settings-menu-item:hover,
:global(.dark) .settings-menu-item.router-link-exact-active {
    background: rgb(15 23 42);
}

@media (max-width: 767px) {
    .settings-shell {
        grid-template-columns: 230px minmax(480px, 1fr);
        overflow-x: auto;
    }

    .settings-menu {
        border-right: 1px solid rgb(226 232 240);
        border-bottom: 0;
    }

    .settings-menu-item {
        height: 68px;
        padding: 12px 18px;
        font-size: 12px;
    }

    .settings-menu-item.router-link-exact-active::after {
        inset: 0 0 0 auto;
        width: 3px;
        height: auto;
    }
}

@media (max-width: 520px) {
    .settings-shell {
        grid-template-columns: 210px minmax(440px, 1fr);
    }

    .settings-menu-item {
        padding: 12px 16px;
    }
}
</style>
