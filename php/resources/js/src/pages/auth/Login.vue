<template>
  <div class="w-full max-w-md">
    <!-- Brand Header -->
    <div class="text-center mb-8">
      <img
        :src="siteSettings.logo_light"
        class="mx-auto mb-4 h-20 w-52 object-contain"
        :alt="siteSettings.site_name"
      />
      <h2
        class="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2"
      >
        Mua sắm, <span class="text-[#ee4d2d]">Hoàn Tiền Thật</span>
      </h2>
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
        Tiết kiệm thông minh với mỗi đơn hàng mua sắm online
      </p>
    </div>

    <!-- Login Card -->
    <div
      class="bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800"
    >
      <a-alert
        v-if="errorMessage"
        type="error"
        message="Đăng nhập thất bại"
        :description="errorMessage"
        show-icon
        closable
        class="mb-6"
        @close="errorMessage = ''"
      />

      <!-- Mode 1: Google Login -->
      <div v-if="activeMode === 'google'" class="space-y-4">
        <button
          :disabled="isLoggingIn"
          class="w-full h-12 flex items-center justify-center gap-2 font-bold text-[15px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm disabled:opacity-50"
          @click="handleGoogleLogin"
        >
          <svg
            v-if="!isLoggingIn"
            class="w-5 h-5 shrink-0"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          <span
            v-else
            class="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-700 dark:border-slate-200"
          ></span>
          <span>Tiếp tục với Google</span>
        </button>

        <div class="text-center pt-2">
          <button
            type="button"
            class="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#ee4d2d] dark:hover:text-[#ee4d2d] transition-colors py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/50 hover:border-[#ee4d2d]/30"
            @click="activeMode = 'password'"
          >
            <KeyOutlined class="text-amber-500 text-sm" />
            <span>Sử dụng mật khẩu</span>
          </button>
        </div>

        <div
          class="flex items-start gap-2 text-xs font-medium text-slate-500 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800"
        >
          <InfoCircleOutlined class="text-blue-500 mt-0.5 shrink-0" />
          <span
            >Google là phương thức đăng nhập chính và được hệ thống khuyến nghị
            để đảm bảo an toàn.</span
          >
        </div>
      </div>

      <!-- Mode 2: Password Login Tab UI -->
      <div v-else-if="activeMode === 'password'" class="space-y-4">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-2"
          @click="activeMode = 'google'"
        >
          <ArrowLeftOutlined />
          <span>Quay lại</span>
        </button>

        <h3
          class="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight"
        >
          Đăng nhập bằng mật khẩu
        </h3>

        <form class="space-y-4" @submit.prevent="handlePasswordLogin">
          <div>
            <label
              class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5"
              >Email tài khoản</label
            >
            <a-input
              v-model:value="loginEmail"
              placeholder="Nhập email của bạn..."
              size="large"
              class="rounded-xl font-medium"
            >
              <template #prefix>
                <UserOutlined class="text-slate-400" />
              </template>
            </a-input>
          </div>

          <div>
            <label
              class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5"
              >Mật khẩu</label
            >
            <a-input-password
              v-model:value="loginPassword"
              placeholder="Nhập mật khẩu..."
              size="large"
              class="rounded-xl font-medium"
            >
              <template #prefix>
                <LockOutlined class="text-slate-400" />
              </template>
            </a-input-password>
          </div>

          <button
            type="submit"
            :disabled="isPasswordLoggingIn || !loginEmail || !loginPassword"
            class="w-full h-12 flex items-center justify-center gap-2 font-bold text-sm rounded-xl bg-[#ee4d2d] hover:bg-[#d63b1d] text-white transition-all shadow-md shadow-rose-500/20 disabled:opacity-50"
          >
            <span
              v-if="isPasswordLoggingIn"
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
            ></span>
            <span>Đăng Nhập Với Mật Khẩu</span>
          </button>
        </form>
      </div>

      <div class="h-px w-full bg-slate-100 dark:bg-slate-800 my-6"></div>

      <div class="text-center text-xs font-medium text-slate-500">
        Bằng việc tiếp tục, bạn đồng ý với
        <a href="#" class="text-blue-500 hover:underline"
          >Điều khoản & Chính sách</a
        >
        của chúng tôi.
      </div>
    </div>

    <!-- Social Links -->
    <div class="mt-8 flex flex-col items-center">
      <span
        class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4"
        >Hỗ trợ & Kết nối</span
      >
      <div class="flex gap-4">
        <a
          :href="zaloGroupUrl"
          target="_blank"
          title="Nhóm Zalo hỗ trợ"
          class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-blue-500 hover:scale-110 hover:border-blue-500 transition-all shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="40"
            height="40"
            viewBox="0 0 48 48"
          >
            <path
              fill="#2962ff"
              d="M15,36V6.827l-1.211-0.811C8.64,8.083,5,13.112,5,19v10c0,7.732,6.268,14,14,14h10	c4.722,0,8.883-2.348,11.417-5.931V36H15z"
            ></path>
            <path
              fill="#eee"
              d="M29,5H19c-1.845,0-3.601,0.366-5.214,1.014C10.453,9.25,8,14.528,8,19	c0,6.771,0.936,10.735,3.712,14.607c0.216,0.301,0.357,0.653,0.376,1.022c0.043,0.835-0.129,2.365-1.634,3.742	c-0.162,0.148-0.059,0.419,0.16,0.428c0.942,0.041,2.843-0.014,4.797-0.877c0.557-0.246,1.191-0.203,1.729,0.083	C20.453,39.764,24.333,40,28,40c4.676,0,9.339-1.04,12.417-2.916C42.038,34.799,43,32.014,43,29V19C43,11.268,36.732,5,29,5z"
            ></path>
            <path
              fill="#2962ff"
              d="M36.75,27C34.683,27,33,25.317,33,23.25s1.683-3.75,3.75-3.75s3.75,1.683,3.75,3.75	S38.817,27,36.75,27z M36.75,21c-1.24,0-2.25,1.01-2.25,2.25s1.01,2.25,2.25,2.25S39,24.49,39,23.25S37.99,21,36.75,21z"
            ></path>
            <path
              fill="#2962ff"
              d="M31.5,27h-1c-0.276,0-0.5-0.224-0.5-0.5V18h1.5V27z"
            ></path>
            <path
              fill="#2962ff"
              d="M27,19.75v0.519c-0.629-0.476-1.403-0.769-2.25-0.769c-2.067,0-3.75,1.683-3.75,3.75	S22.683,27,24.75,27c0.847,0,1.621-0.293,2.25-0.769V26.5c0,0.276,0.224,0.5,0.5,0.5h1v-7.25H27z M24.75,25.5	c-1.24,0-2.25-1.01-2.25-2.25S23.51,21,24.75,21S27,22.01,27,23.25S25.99,25.5,24.75,25.5z"
            ></path>
            <path
              fill="#2962ff"
              d="M21.25,18h-8v1.5h5.321L13,26h0.026c-0.163,0.211-0.276,0.463-0.276,0.75V27h7.5	c0.276,0,0.5-0.224,0.5-0.5v-1h-5.321L21,19h-0.026c0.163-0.211,0.276-0.463,0.276-0.75V18z"
            ></path>
          </svg>
        </a>
        <a
          :href="`mailto:${siteSettings.contact_email}`"
          class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-rose-500 hover:scale-110 hover:border-rose-500 transition-all shadow-sm"
        >
          <MailOutlined class="text-lg" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useSiteSettings } from "@/composables/useSiteSettings";
import {
  InfoCircleOutlined,
  MailOutlined,
  KeyOutlined,
  LockOutlined,
  UserOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons-vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const errorMessage = ref("");
const isLoggingIn = ref(false);
const { siteSettings, loadSiteSettings } = useSiteSettings();
const zaloGroupUrl = computed(() => siteSettings.value.contact_zalo || "#");

const activeMode = ref<"google" | "password">("google");
const loginEmail = ref("");
const loginPassword = ref("");
const isPasswordLoggingIn = ref(false);

const handlePasswordLogin = async () => {
  if (isPasswordLoggingIn.value || !loginEmail.value || !loginPassword.value)
    return;
  errorMessage.value = "";
  isPasswordLoggingIn.value = true;
  try {
    await authStore.loginWithPassword({
      email: loginEmail.value,
      password: loginPassword.value,
    });
    router.push({ name: "home" });
  } catch (err: any) {
    errorMessage.value =
      err.response?.data?.message ||
      err.message ||
      "Đăng nhập bằng mật khẩu thất bại. Vui lòng kiểm tra lại thông tin.";
  } finally {
    isPasswordLoggingIn.value = false;
  }
};

const handleGoogleLogin = () => {
  if (isLoggingIn.value) return;
  errorMessage.value = "";
  if (typeof window !== "undefined") {
    // Determine the host for redirect matching what you configured in Google Cloud Console
    // Since we're in SPA, window.location.origin + '/dang-nhap'
    const redirectUri = `${window.location.origin}/dang-nhap`;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_CLIENT_ID";
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=openid%20email%20profile`;
    window.location.href = googleAuthUrl;
  }
};

onMounted(async () => {
  await loadSiteSettings();
  const code = route.query.code as string;
  const error = route.query.error;

  if (code) {
    isLoggingIn.value = true;
    errorMessage.value = "";
    try {
      await authStore.loginWithGoogle({ code });
      router.replace({ query: {} });
      router.push({ name: "home" });
    } catch (err: any) {
      errorMessage.value =
        err.response?.data?.message ||
        err.message ||
        "Xác thực thất bại, vui lòng thử lại.";
    } finally {
      isLoggingIn.value = false;
    }
  } else if (error) {
    errorMessage.value = "Xác thực bị từ chối hoặc có lỗi xảy ra từ Google.";
    router.replace({ query: {} });
  }
});
</script>
