<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import axios from "axios";
import { loginAdmin } from "../services/api";
import {
  LockOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  HomeOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();
const passcode = ref("");
const loading = ref(false);

const handleAdminLogin = async () => {
  if (!passcode.value.trim()) {
    message.warning("Vui lòng nhập Passcode Quản trị!");
    return;
  }

  loading.value = true;
  try {
    await loginAdmin(passcode.value);
    message.success("Đăng nhập Quản trị thành công!");
    await router.push("/admin/orders");
  } catch (error) {
    const errorMessage = axios.isAxiosError<{ message?: string }>(error)
      ? error.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng thử lại!"
      : "Đăng nhập thất bại. Vui lòng thử lại!";
    message.error(errorMessage);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen w-full flex flex-col items-center justify-between p-4 bg-[#fff7f5] bg-gradient-to-br from-rose-100/60 via-orange-100/70 to-amber-100/50 font-sans relative overflow-hidden text-left"
  >
    <!-- Ambient Blur Glow Backdrops -->
    <div
      class="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-200/35 rounded-full blur-3xl pointer-events-none"
    ></div>
    <div
      class="absolute bottom-10 right-10 w-[450px] h-[450px] bg-amber-200/35 rounded-full blur-3xl pointer-events-none"
    ></div>

    <!-- Top Spacer for Vertical Centering -->
    <div class="h-2 sm:h-4"></div>

    <!-- Admin Login Card -->
    <div
      class="max-w-md w-full bg-white rounded-[36px] shadow-2xl p-7 sm:p-9 relative z-10 space-y-6 my-auto"
    >
      <!-- Top Actions Header -->
      <div class="flex items-center justify-between">
        <router-link
          to="/"
          class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <HomeOutlined />
          <span>Trang chủ</span>
        </router-link>
        <span
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-50 text-[#ee4d2d] border border-orange-200/60 uppercase tracking-wider"
        >
          Admin Zeplao-Bot
        </span>
      </div>

      <!-- Icon & Branding Header -->
      <div class="text-center space-y-2">
        <div
          class="w-16 h-16 mx-auto flex items-center justify-center rounded-2xl bg-orange-50 border border-orange-100 shadow-2xs"
        >
          <SafetyCertificateOutlined class="text-3xl text-[#ee4d2d]" />
        </div>
        <h1
          class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1"
        >
          Quản trị Hệ thống
        </h1>
        <p
          class="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed"
        >
          Vui lòng nhập Passcode Quản trị để tiếp tục vào bảng điều khiển.
        </p>
      </div>

      <!-- Passcode Input Form (Single Input as requested) -->
      <div class="space-y-4 pt-2">
        <div class="space-y-1.5">
          <label
            class="block text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            Passcode Quản trị
          </label>
          <div class="relative">
            <input
              v-model="passcode"
              type="password"
              placeholder="Nhập Passcode..."
              @keyup.enter="handleAdminLogin"
              class="w-full border-2 border-slate-200 focus:border-[#ee4d2d] rounded-2xl px-4 py-3.5 pl-10 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all bg-slate-50 focus:bg-white"
            />
            <LockOutlined
              class="absolute left-3.5 top-4 text-slate-400 text-base pointer-events-none"
            />
          </div>
        </div>

        <!-- Submit Button -->
        <button
          @click="handleAdminLogin"
          :disabled="loading"
          type="button"
          class="w-full bg-[#ee4d2d] hover:bg-[#d63d1e] active:scale-[0.99] !text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl shadow-md shadow-orange-900/10 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
        >
          <ReloadOutlined :spin="loading" v-if="loading" class="!text-white" />
          <LockOutlined v-else class="!text-white" />
          <span class="!text-white">Đăng nhập Admin</span>
        </button>
      </div>
    </div>

    <!-- Footer Author Note -->
    <div class="relative z-10 py-3 text-center">
      <p class="text-xs text-slate-500 font-medium">
        Made & Support by
        <a
          href="https://www.facebook.com/nguyenphiikhanh"
          target="_blank"
          rel="noopener noreferrer"
          class="text-slate-700 hover:text-[#ee4d2d] font-bold transition-colors"
        >KhanhNT</a> ❤️
      </p>
    </div>
  </div>
</template>
