<template>
  <a-layout-footer class="app-footer">
    <div class="footer-container">
      <a-row :gutter="[24, 24]">
        <!-- Brand Section -->
        <a-col :xs="24" :lg="10">
          <div class="footer-brand-box">
            <div class="flex items-center gap-3 mb-4">
              <img
                :src="siteSettings.logo_light"
                class="h-12 w-36 object-contain object-left"
                :alt="siteSettings.site_name"
              />
              <div>
                <div
                  class="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight"
                >
                  {{ siteSettings.site_name }}
                </div>
                <div
                  class="text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase mt-0.5"
                >
                  Smart Shopping
                </div>
              </div>
            </div>
            <p
              class="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6 max-w-sm"
            >
              Trợ lý mua sắm thông minh thế hệ mới. Hoàn tiền tự động, minh bạch
              và siêu tốc từ các sàn TMĐT.
            </p>
            <div class="flex items-center gap-3">
              <a :href="`mailto:${siteSettings.contact_email}`" class="social-btn">
                <MailOutlined />
              </a>
              <a :href="siteSettings.contact_zalo" target="_blank" class="social-btn">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="40"
                  height="40"
                  viewBox="0 0 48 48"
                >
                  <path fill="#2962ff" d="M15,36V6.827l-1.211-0.811C8.64,8.083,5,13.112,5,19v10c0,7.732,6.268,14,14,14h10	c4.722,0,8.883-2.348,11.417-5.931V36H15z"></path>
                  <path fill="#eee" d="M29,5H19c-1.845,0-3.601,0.366-5.214,1.014C10.453,9.25,8,14.528,8,19	c0,6.771,0.936,10.735,3.712,14.607c0.216,0.301,0.357,0.653,0.376,1.022c0.043,0.835-0.129,2.365-1.634,3.742	c-0.162,0.148-0.059,0.419,0.16,0.428c0.942,0.041,2.843-0.014,4.797-0.877c0.557-0.246,1.191-0.203,1.729,0.083	C20.453,39.764,24.333,40,28,40c4.676,0,9.339-1.04,12.417-2.916C42.038,34.799,43,32.014,43,29V19C43,11.268,36.732,5,29,5z"></path>
                  <path fill="#2962ff" d="M36.75,27C34.683,27,33,25.317,33,23.25s1.683-3.75,3.75-3.75s3.75,1.683,3.75,3.75	S38.817,27,36.75,27z M36.75,21c-1.24,0-2.25,1.01-2.25,2.25s1.01,2.25,2.25,2.25S39,24.49,39,23.25S37.99,21,36.75,21z"></path>
                  <path fill="#2962ff" d="M31.5,27h-1c-0.276,0-0.5-0.224-0.5-0.5V18h1.5V27z"></path>
                  <path fill="#2962ff" d="M27,19.75v0.519c-0.629-0.476-1.403-0.769-2.25-0.769c-2.067,0-3.75,1.683-3.75,3.75	S22.683,27,24.75,27c0.847,0,1.621-0.293,2.25-0.769V26.5c0,0.276,0.224,0.5,0.5,0.5h1v-7.25H27z M24.75,25.5	c-1.24,0-2.25-1.01-2.25-2.25S23.51,21,24.75,21S27,22.01,27,23.25S25.99,25.5,24.75,25.5z"></path>
                  <path fill="#2962ff" d="M21.25,18h-8v1.5h5.321L13,26h0.026c-0.163,0.211-0.276,0.463-0.276,0.75V27h7.5	c0.276,0,0.5-0.224,0.5-0.5v-1h-5.321L21,19h-0.026c0.163-0.211,0.276-0.463,0.276-0.75V18z"></path>
                </svg>
              </a>
            </div>
          </div>
        </a-col>

        <!-- Navigation Section -->
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="footer-nav-box h-full">
            <div
              class="text-xs font-black tracking-widest uppercase text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2"
            >
              <div
                class="w-2 h-2 rounded-full bg-slate-800 dark:bg-slate-200"
              ></div>
              Menu
            </div>
            <div class="flex flex-col gap-4">
              <router-link :to="{ name: 'hoan-tien' }" class="nav-link">Hoàn tiền</router-link>
              <a-divider
                style="margin: 0; border-color: rgba(226, 232, 240, 0.5)"
              />
              <router-link :to="{ name: 'don-hang' }" class="nav-link">Đơn hàng</router-link>
              <a-divider
                style="margin: 0; border-color: rgba(226, 232, 240, 0.5)"
              />
              <router-link :to="{ name: 'tai-chinh' }" class="nav-link">Rút tiền</router-link>
              <a-divider
                style="margin: 0; border-color: rgba(226, 232, 240, 0.5)"
              />
              <router-link :to="{ name: 'huong-dan' }" class="nav-link">Hướng dẫn</router-link>
            </div>
          </div>
        </a-col>

        <!-- Contact Section -->
        <a-col :xs="24" :sm="12" :lg="8">
          <div class="flex flex-col gap-4 h-full">
            <div
              class="contact-card cursor-pointer"
              @click="openContactEmail"
            >
              <div
                class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center text-xl shrink-0"
              >
                <CustomerServiceOutlined />
              </div>
              <div>
                <div
                  class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5"
                >
                  Hỗ trợ 24/7
                </div>
                <div
                  class="text-sm font-bold text-slate-800 dark:text-slate-200"
                >
                  {{ siteSettings.contact_email }}
                </div>
              </div>
            </div>

            <a-row :gutter="16" class="flex-1">
              <a-col :span="12">
                <div class="stat-card h-full">
                  <ClockCircleOutlined class="text-emerald-500 text-xl mb-2" />
                  <div
                    class="text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    08:00 - 22:00
                  </div>
                  <div class="text-[10px] font-medium text-slate-500">
                    Hàng ngày
                  </div>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="stat-card h-full">
                  <ThunderboltOutlined class="text-amber-500 text-xl mb-2" />
                  <div
                    class="text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    &lt; 60 Phút
                  </div>
                  <div class="text-[10px] font-medium text-slate-500">
                    Rút tiền
                  </div>
                </div>
              </a-col>
            </a-row>
          </div>
        </a-col>
      </a-row>

      <!-- Bottom Bar -->
      <div
        class="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div
          class="text-[11px] font-bold text-slate-500 uppercase tracking-widest"
        >
          &copy; 2026 {{ siteSettings.site_name }} Platform. All Rights Reserved.
        </div>
        <div
          class="flex items-center gap-6 text-[11px] font-bold text-slate-500"
        >
          <a
            href="#"
            target="_blank"
            class="hover:text-[#ee4d2d] transition-colors"
            >Privacy Policy</a
          >
          <div
            class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"
          ></div>
          <a
            href="#"
            target="_blank"
            class="hover:text-[#ee4d2d] transition-colors"
            >Terms of Service</a
          >
        </div>
      </div>
    </div>
  </a-layout-footer>
</template>

<script setup lang="ts">
import {
  MailOutlined,
  CustomerServiceOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons-vue";
import { onMounted } from "vue";
import { useSiteSettings } from "@/composables/useSiteSettings";

const { siteSettings, loadSiteSettings } = useSiteSettings();

const openContactEmail = () => {
  window.location.href = `mailto:${siteSettings.value.contact_email}`;
};

onMounted(() => loadSiteSettings());
</script>

<style scoped>
.app-footer {
  background: white;
  padding: 24px 0 80px;
}

@media (min-width: 1024px) {
  .app-footer {
    padding: 48px 0 24px;
  }
}

html.dark .app-footer {
  background: #0f172a; /* slate-900 */
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
}

.footer-brand-box {
  background: rgba(255, 237, 231, 0.4);
  border: 1px solid rgba(238, 77, 45, 0.1);
  padding: 20px;
  border-radius: 20px;
  height: 100%;
}

@media (min-width: 640px) {
  .footer-brand-box {
    padding: 32px;
    border-radius: 24px;
  }
}

html.dark .footer-brand-box {
  background: rgba(238, 77, 45, 0.05);
  border-color: rgba(238, 77, 45, 0.1);
}

.social-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

html.dark .social-btn {
  background: #1e293b;
  color: #94a3b8;
}

.social-btn:hover {
  color: #ee4d2d;
  transform: scale(1.1);
}

.footer-nav-box {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  padding: 20px;
  border-radius: 20px;
}

@media (min-width: 640px) {
  .footer-nav-box {
    padding: 32px;
    border-radius: 24px;
  }
}

html.dark .footer-nav-box {
  background: #1e293b;
  border-color: #334155;
}

.nav-link {
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  transition: color 0.3s ease;
}

html.dark .nav-link {
  color: #94a3b8;
}

.nav-link:hover {
  color: #ee4d2d;
}

.contact-card,
.stat-card {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 24px;
  padding: 24px;
  display: flex;
  transition: all 0.3s ease;
}

html.dark .contact-card,
html.dark .stat-card {
  background: #1e293b;
  border-color: #334155;
}

.contact-card {
  align-items: center;
  gap: 16px;
}

.contact-card:hover,
.stat-card:hover {
  border-color: rgba(59, 130, 246, 0.3);
}

.stat-card {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>
