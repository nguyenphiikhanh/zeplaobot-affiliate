<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import axios from "axios";
import { loginUser } from "../services/api";
import {
  LoginOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  CopyOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();
const trackingCode = ref("");
const loading = ref(false);

const handleLogin = async () => {
  if (!trackingCode.value.trim()) {
    message.warning("Vui lòng nhập mã theo dõi!");
    return;
  }

  loading.value = true;
  try {
    await loginUser(trackingCode.value.trim());
    message.success("Đăng nhập thành công!");
    await router.push("/");
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
  navigator.clipboard.writeText("/matheodoi");
  message.success("Đã sao chép cú pháp /matheodoi!");
};
</script>

<template>
  <div
    class="min-h-screen w-full flex items-center justify-center p-4 bg-[#fff7f5] bg-gradient-to-br from-rose-100/60 via-orange-100/70 to-amber-100/50 font-sans relative overflow-hidden"
  >
    <!-- Ambient Blur Glow Backdrops (Low Opacity) -->
    <div
      class="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-200/35 rounded-full blur-3xl pointer-events-none"
    ></div>
    <div
      class="absolute bottom-10 right-10 w-[450px] h-[450px] bg-amber-200/35 rounded-full blur-3xl pointer-events-none"
    ></div>

    <!-- Login Card -->
    <div
      class="max-w-md w-full bg-white rounded-[36px] shadow-2xl p-7 sm:p-9 relative z-10 text-center space-y-6"
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
          Đăng nhập để bắt đầu kiếm hoa hồng.
        </p>
      </div>

      <!-- Login Form Section (Only Tracking Code as requested) -->
      <div class="space-y-4 pt-2">
        <!-- Input Mã Theo Dõi -->
        <div class="text-left space-y-1.5">
          <label class="block text-xs font-bold text-slate-700">
            Mã theo dõi
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
              #ma-theo-doi
            </code>
            <span
              class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 group-hover:text-amber-900"
            >
              <CopyOutlined class="text-xs" />
              <span>Sao chép</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
