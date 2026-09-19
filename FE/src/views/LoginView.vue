<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { message } from "ant-design-vue";
import axios from "axios";
import { api, loginUser, loginWithGoogle, type ApiResponse } from "../services/api";
import { consumeUserRedirectPath } from "../services/user-redirect";
import {
  LoginOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  CopyOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();
const route = useRoute();
const trackingCode = ref("");
const loading = ref(false);
const googleLoading = ref(false);
const enableGoogleLogin = ref(false);
const zaloGroupEnabled = ref(false);
const zaloGroupTitle = ref("");
const zaloGroupUrl = ref("");
const zaloBotEnabled = ref(false);
const zaloBotTitle = ref("");
const zaloBotUrl = ref("");
const trackingCommand = ref('#tracking-code');

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "549994792189-tjjij6t7qm3ije84l7t0ut37kcgkvgkr.apps.googleusercontent.com";

const getRedirectUri = () => {
  return window.location.origin + window.location.pathname;
};

const redirectAfterLogin = async () => {
  const storedPath = consumeUserRedirectPath();
  const queryPath =
    typeof route.query.redirect === "string" &&
    route.query.redirect.startsWith("/") &&
    !route.query.redirect.startsWith("/admin")
      ? route.query.redirect
      : null;
  const targetPath = storedPath || queryPath || "/";
  await router.push(targetPath);
};

const handleGoogleRedirectResponse = async () => {
  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get("code");
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const idToken = hashParams.get("id_token");

  if (!code && !idToken) return;

  googleLoading.value = true;
  window.history.replaceState(null, "", window.location.pathname);

  try {
    await loginWithGoogle({
      code: code || undefined,
      idToken: idToken || undefined,
      redirectUri: getRedirectUri(),
    });
    message.success("Đăng nhập bằng Google thành công!");
    await redirectAfterLogin();
  } catch (error) {
    const errorMessage = axios.isAxiosError<{ message?: string }>(error)
      ? error.response?.data?.message || "Đăng nhập Google thất bại!"
      : "Đăng nhập Google thất bại. Vui lòng thử lại!";
    message.error(errorMessage);
  } finally {
    googleLoading.value = false;
  }
};

const handleGoogleLoginRedirect = () => {
  const redirectUri = getRedirectUri();
  const scope = encodeURIComponent("openid profile email");

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    GOOGLE_CLIENT_ID
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&prompt=select_account`;

  window.location.href = googleAuthUrl;
};

onMounted(async () => {
  try {
    const siteConfigRes = await api.get<ApiResponse<{
      enable_google_login?: boolean;
      zalo_group_enabled?: boolean;
      zalo_group_title?: string;
      zalo_group_url?: string;
      zalo_bot_enabled?: boolean;
      zalo_bot_title?: string;
      zalo_bot_url?: string;
    }>>("/api/site-config");
    const siteData = siteConfigRes.data.data;
    if (siteData) {
      if (siteData.enable_google_login !== undefined) {
        enableGoogleLogin.value = siteData.enable_google_login;
      }
      zaloGroupEnabled.value = Boolean(siteData.zalo_group_enabled);
      zaloGroupTitle.value = siteData.zalo_group_title || "Nhóm Zalo hỗ trợ";
      zaloGroupUrl.value = siteData.zalo_group_url || "";
      zaloBotEnabled.value = Boolean(siteData.zalo_bot_enabled);
      zaloBotTitle.value = siteData.zalo_bot_title || "Chat riêng với Bot";
      zaloBotUrl.value = siteData.zalo_bot_url || "";
    }
  } catch { /* Default to disabled */ }

  await handleGoogleRedirectResponse();

  try {
    const response = await api.get<ApiResponse<{ command: string }>>(
      "/api/zalo/login-command"
    );
    if (response.data.data?.command)
      trackingCommand.value = response.data.data.command;
  } catch {
    /* Keep default command */
  }
});

const handleLogin = async () => {
  if (!trackingCode.value.trim()) {
    message.warning("Vui lòng nhập mã theo dõi!");
    return;
  }

  loading.value = true;
  try {
    await loginUser(trackingCode.value.trim());
    message.success("Đăng nhập thành công!");
    await redirectAfterLogin();
  } catch (error) {
    const errorMessage = axios.isAxiosError<{ message?: string }>(error)
      ? error.response?.data?.message || "Mã theo dõi không chính xác!"
      : "Đăng nhập thất bại. Vui lòng thử lại!";
    message.error(errorMessage);
  } finally {
    loading.value = false;
  }
};

const copyCommand = () => {
  navigator.clipboard.writeText(trackingCommand.value);
  message.success(`Đã sao chép cú pháp ${trackingCommand.value}!`);
};
</script>

<template>
  <div
    class="min-h-screen w-full flex flex-col items-center justify-between p-4 bg-[#fff7f5] bg-gradient-to-br from-rose-100/60 via-orange-100/70 to-amber-100/50 font-sans relative overflow-hidden"
  >
    <!-- Ambient Blur Glow Backdrops -->
    <div
      class="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-200/35 rounded-full blur-3xl pointer-events-none"
    ></div>
    <div
      class="absolute bottom-10 right-10 w-[450px] h-[450px] bg-amber-200/35 rounded-full blur-3xl pointer-events-none"
    ></div>

    <!-- Top Spacer -->
    <div class="h-2 sm:h-4"></div>

    <!-- Login Card -->
    <div
      class="max-w-md w-full bg-white rounded-[36px] shadow-2xl p-7 sm:p-9 relative z-10 text-center space-y-6 my-auto border border-rose-100/50"
    >
      <!-- Icon & Branding Header -->
      <div class="space-y-1.5">
        <div class="w-16 h-16 mx-auto flex items-center justify-center">
          <span class="text-5xl select-none">🎁</span>
        </div>
        <h1
          class="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-slate-900"
        >
          Chào mừng
          <span
            class="bg-gradient-to-r from-[#d94f3d] via-rose-500 to-orange-500 bg-clip-text text-transparent"
            >trở lại</span
          >
          ✨
        </h1>
        <p
          class="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed pt-1"
        >
          Đăng nhập để bắt đầu kiểm tra và nhận hoa hồng.
        </p>
      </div>

      <!-- Single Custom Google Sign-In Button -->
      <div v-if="enableGoogleLogin" class="pt-2">
        <button
          :disabled="googleLoading"
          @click="handleGoogleLoginRedirect"
          type="button"
          class="w-full bg-white hover:bg-slate-50 active:scale-[0.99] border-2 border-slate-200 text-slate-700 font-bold text-sm py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-xs hover:border-slate-300 cursor-pointer disabled:opacity-60"
        >
          <ReloadOutlined spin v-if="googleLoading" class="text-slate-500" />
          <svg v-else class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span v-if="googleLoading">Đang xử lý đăng nhập Google...</span>
          <span v-else>Tiếp tục với Google</span>
        </button>
      </div>

      <!-- Divider -->
      <div v-if="enableGoogleLogin" class="relative flex items-center justify-center my-2">
        <div class="border-t border-slate-200 w-full"></div>
        <span class="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">Hoặc dùng mã theo dõi</span>
        <div class="border-t border-slate-200 w-full"></div>
      </div>

      <!-- Login Form Section (Tracking Code) -->
      <div class="space-y-4">
        <!-- Input Mã Theo Dõi -->
        <div class="text-left space-y-1.5">
          <label class="block text-xs font-bold text-slate-700">
            Mã theo dõi Zalo
          </label>
          <input
            v-model="trackingCode"
            type="text"
            placeholder="Nhắn cho bot để lấy mã theo dõi"
            @keyup.enter="handleLogin"
            class="w-full border-2 border-[#d94f3d] rounded-2xl px-4 py-3.5 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#d94f3d]/20 transition-all bg-white"
          />
        </div>

        <!-- Submit Button -->
        <button
          @click="handleLogin"
          :disabled="loading"
          type="button"
          class="w-full bg-[#d94f3d] hover:bg-[#c44332] active:scale-[0.99] !text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl shadow-md shadow-orange-900/10 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
        >
          <ReloadOutlined :spin="loading" v-if="loading" class="!text-white" />
          <LoginOutlined v-else class="!text-white" />
          <span class="!text-white">Đăng nhập</span>
        </button>

        <!-- Highlighted Info Box Zalo -->
        <div
          class="bg-[#fffbeb] border border-amber-200/90 rounded-2xl p-4 text-xs text-left space-y-2.5 shadow-2xs"
        >
          <div class="flex items-center gap-2 text-amber-900 font-bold">
            <InfoCircleOutlined class="text-amber-600 text-sm shrink-0" />
            <span>Cách lấy Mã theo dõi:</span>
          </div>

          <p class="m-0 text-slate-600 leading-relaxed font-medium">
            Chat riêng với bot nội dung sau để lấy mã theo dõi của bạn:
          </p>

          <!-- Highlighted Command Box with Quick Copy -->
          <div
            @click="copyCommand"
            class="flex items-center justify-between bg-amber-100/90 hover:bg-amber-200/60 border border-amber-300/80 rounded-xl px-3.5 py-2.5 cursor-pointer transition-all group"
            title="Bấm để sao chép cú pháp"
          >
            <code
              class="text-xs font-mono font-extrabold text-amber-950 tracking-wider"
            >
              {{ trackingCommand }}
            </code>
            <span
              class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 group-hover:text-amber-900"
            >
              <CopyOutlined class="text-xs" />
              <span>Sao chép</span>
            </span>
          </div>
        </div>

        <!-- Support Channels (Zalo Group & Personal Bot) -->
        <div
          v-if="(zaloGroupEnabled && zaloGroupUrl) || (zaloBotEnabled && zaloBotUrl)"
          class="space-y-2 pt-1 text-left"
        >
          <div class="flex items-center justify-between px-0.5">
            <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Kênh hỗ trợ & Liên hệ
            </span>
          </div>

          <div
            class="grid gap-2.5"
            :class="(zaloGroupEnabled && zaloGroupUrl) && (zaloBotEnabled && zaloBotUrl) ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'"
          >
            <!-- Nhóm Zalo -->
            <a
              v-if="zaloGroupEnabled && zaloGroupUrl"
              :href="zaloGroupUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex items-center gap-2.5 p-3 rounded-2xl border border-blue-200/80 bg-blue-50/70 hover:bg-blue-100/70 hover:border-blue-300 transition-all text-slate-800 hover:text-blue-700 no-underline shadow-2xs cursor-pointer"
            >
              <div class="w-8 h-8 rounded-xl bg-[#0068ff] text-white flex items-center justify-center font-black text-[11px] shrink-0 shadow-xs">
                Zalo
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-xs font-bold truncate group-hover:text-blue-700">
                  {{ zaloGroupTitle || 'Nhóm Zalo hỗ trợ' }}
                </div>
                <div class="text-[10px] font-medium text-slate-500 truncate">
                  Tham gia nhóm Zalo
                </div>
              </div>
              <svg class="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <!-- Bot cá nhân -->
            <a
              v-if="zaloBotEnabled && zaloBotUrl"
              :href="zaloBotUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex items-center gap-2.5 p-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 hover:bg-emerald-100/70 hover:border-emerald-300 transition-all text-slate-800 hover:text-emerald-700 no-underline shadow-2xs cursor-pointer"
            >
              <div class="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                💬
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-xs font-bold truncate group-hover:text-emerald-700">
                  {{ zaloBotTitle || 'Chat riêng với Bot' }}
                </div>
                <div class="text-[10px] font-medium text-slate-500 truncate">
                  Nhắn tin cho Bot
                </div>
              </div>
              <svg class="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
