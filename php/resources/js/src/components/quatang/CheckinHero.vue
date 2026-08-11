<template>
  <div
    class="rounded-3xl p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-orange-500 via-rose-500 to-amber-500 text-white shadow-xl relative overflow-hidden"
  >
    <div
      class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center"
    >
      <!-- Left Side: User Info & Balance -->
      <div class="lg:col-span-7 space-y-3 sm:space-y-4 text-left">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] sm:text-xs font-black tracking-wider uppercase"
          >
            <GiftOutlined class="text-xs sm:text-sm" /> Điểm Danh Nhận S-Point
          </div>

          <!-- Mobile Only Compact Balance Tag -->
          <div
            class="lg:hidden inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/25 rounded-full px-3 py-1 text-xs font-black"
          >
            <img
              :src="'/saffi_gold.webp'"
              alt="Saffi"
              class="w-4 h-4 object-contain"
            />
            <span
              >{{ spointBalance }}
              <span class="text-[10px] font-bold text-orange-100"
                >S-Point</span
              ></span
            >
          </div>
        </div>

        <h1
          class="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white m-0 leading-tight drop-shadow-md"
        >
          Tích
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 drop-shadow-sm"
            >S-Point</span
          >, Soi Quà Thật 🎉
        </h1>

        <p
          class="text-xs sm:text-sm font-medium text-orange-100/90 leading-relaxed m-0"
        >
          Điểm danh mỗi ngày để tích lũy <strong>S-Point</strong>. Quy đổi điểm
          <strong>S-Point</strong> thành tiền thật.
        </p>

        <!-- Desktop Only Balance Badge -->
        <div class="hidden lg:flex items-center gap-3 pt-1">
          <div
            class="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-inner"
          >
            <div
              class="w-10 h-10 rounded-xl bg-amber-400/90 flex items-center justify-center shrink-0 shadow p-1"
            >
              <img
                :src="'/saffi_gold.webp'"
                alt="Saffi Gold"
                class="w-full h-full object-contain transform hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <div
                class="text-[10px] uppercase tracking-wider text-orange-200 font-extrabold"
              >
                Bạn đang có
              </div>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="text-2xl font-black text-white leading-none">
                  {{ spointBalance }}
                </span>
                <span
                  class="text-sm font-extrabold text-orange-100 leading-none"
                >
                  S-Point
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side: Big Checkin Action (Full Width on Mobile) -->
      <div class="lg:col-span-5 w-full">
        <div
          class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 w-full text-center shadow-lg"
        >
          <div
            class="text-[11px] sm:text-xs font-black uppercase tracking-widest text-orange-100 mb-2 sm:mb-3 flex items-center justify-center gap-1.5"
          >
            <FireOutlined class="text-amber-300 text-sm flex items-center" />
            <span>Chuỗi điểm danh:</span>
            <span class="text-amber-300 text-xs sm:text-sm font-black"
              >{{ spointStreak }}/5 ngày</span
            >
          </div>

          <!-- 5-Day Streak Progress Visual -->
          <div class="grid grid-cols-5 gap-1 sm:gap-1.5 mb-3">
            <div
              v-for="day in 5"
              :key="day"
              class="flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-xl transition-all border min-h-[52px] sm:min-h-[64px]"
              :class="getStreakItemClass(day)"
            >
              <span
                class="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-tighter"
                >Ngày {{ day }}</span
              >
              <div class="my-0.5 flex items-center justify-center">
                <CheckCircleFilled
                  v-if="day <= spointStreak"
                  class="text-emerald-400 text-xs sm:text-base"
                />
                <StarFilled
                  v-else-if="day === 5"
                  class="text-amber-300 text-xs sm:text-base animate-pulse"
                />
                <LockOutlined
                  v-else
                  class="text-white/40 text-[10px] sm:text-xs"
                />
              </div>
              <span
                class="text-[8.5px] sm:text-[10px] font-black leading-none"
                :class="day === 5 ? 'text-amber-300' : ''"
              >
                {{ day === 5 ? "+2P" : "+1P" }}
              </span>
            </div>
          </div>

          <!-- Checkin Action Content -->
          <template v-if="!checkedInToday">
            <div id="turnstile-checkin-container" class="hidden"></div>
            <a-button
              type="primary"
              size="large"
              block
              :loading="checkinLoading || isTurnstileVerifying"
              :disabled="!turnstileToken || checkinLoading || isTurnstileVerifying"
              @click="triggerCheckin"
              class="checkin-cta-btn h-10.5 sm:h-12 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wide border-0 shadow-lg bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-amber-400/30 disabled:bg-amber-400/50 disabled:text-slate-900/50 disabled:cursor-not-allowed active:scale-95 inline-flex items-center justify-center gap-2 transition-all"
            >
              <template #icon>
                <ThunderboltOutlined
                  v-if="!checkinLoading && !isTurnstileVerifying"
                  class="text-sm sm:text-base"
                />
              </template>
              <span>{{ buttonText }}</span>
            </a-button>

            <p
              class="text-[9.5px] sm:text-[10px] text-orange-100/90 mt-2 m-0 leading-tight"
            >
              Điểm danh liên tiếp 5 ngày để nhận thêm thưởng chuỗi +2 S-Point!
            </p>
          </template>

          <template v-else>
            <div class="space-y-2">
              <div>
                <div
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/80 text-white text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-sm"
                >
                  <CheckCircleOutlined /> Đã nhận thưởng ✔
                </div>
                <p
                  class="text-[10px] sm:text-[11px] font-medium text-orange-100/90 mt-1.5 m-0 leading-tight"
                >
                  Bạn đã điểm danh hôm nay, hãy quay lại vào ngày mai nhé
                </p>
              </div>

              <p
                class="text-[11px] sm:text-xs font-bold text-orange-100 bg-white/15 backdrop-blur-md p-2 sm:p-2.5 rounded-xl border border-white/20 m-0 leading-snug"
              >
                🛍️ Đừng quên mua sắm qua Saffi để hoàn thêm tiền nhé!
              </p>

              <a-button
                type="primary"
                size="large"
                block
                @click="router.push('/hoan-tien')"
                class="checkin-cta-btn h-10.5 sm:h-12 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wide border-0 shadow-lg bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 hover:from-amber-300 hover:to-yellow-200 active:scale-95 inline-flex items-center justify-center gap-2"
              >
                <template #icon>
                  <ShoppingOutlined class="text-sm sm:text-base" />
                </template>
                <span>Mua sắm hoàn tiền ngay</span>
              </a-button>
            </div>
          </template>
        </div>
      </div>
    </div>
    <!-- Background Decor Circles -->
    <div
      class="absolute -right-10 -bottom-10 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  GiftOutlined,
  FireOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  StarFilled,
  LockOutlined,
  ThunderboltOutlined,
  ShoppingOutlined,
} from "@ant-design/icons-vue";

const props = defineProps<{
  spointBalance: number;
  spointStreak: number;
  checkedInToday: boolean;
  checkinLoading: boolean;
}>();

const emit = defineEmits<{
  (e: "checkin", token?: string): void;
}>();

const router = useRouter();

const turnstileToken = ref<string>("");
const widgetId = ref<any>(null);
const isTurnstileVerifying = ref<boolean>(true);

const buttonText = computed(() => {
  if (props.checkinLoading) return "Đang điểm danh...";
  if (isTurnstileVerifying.value || !turnstileToken.value)
    return "Chờ xác thực...";
  return "Điểm danh ngay";
});

const initTurnstile = () => {
  const siteKey = (window as any).TURNSTILE_SITE_KEY;
  if (!siteKey || !(window as any).turnstile) {
    isTurnstileVerifying.value = false;
    return;
  }

  try {
    const container = document.getElementById("turnstile-checkin-container");
    if (container && widgetId.value === null) {
      isTurnstileVerifying.value = true;
      widgetId.value = (window as any).turnstile.render(
        "#turnstile-checkin-container",
        {
          sitekey: siteKey,
          size: "invisible",
          callback: (token: string) => {
            turnstileToken.value = token;
            isTurnstileVerifying.value = false;
          },
          "expired-callback": () => {
            turnstileToken.value = "";
            isTurnstileVerifying.value = true;
          },
          "error-callback": () => {
            turnstileToken.value = "";
            isTurnstileVerifying.value = false;
          },
        }
      );
    }
  } catch (e) {
    console.warn("Turnstile render notice:", e);
    isTurnstileVerifying.value = false;
  }
};

const resetTurnstile = () => {
  if (widgetId.value !== null && (window as any).turnstile) {
    try {
      turnstileToken.value = "";
      isTurnstileVerifying.value = true;
      (window as any).turnstile.reset(widgetId.value);
    } catch (err) {
      isTurnstileVerifying.value = false;
    }
  } else {
    initTurnstile();
  }
};

watch(
  () => props.checkinLoading,
  (newVal, oldVal) => {
    if (oldVal === true && newVal === false && !props.checkedInToday) {
      resetTurnstile();
    }
  }
);

onMounted(() => {
  if (props.checkedInToday) return;

  if ((window as any).turnstile) {
    initTurnstile();
  } else {
    const timer = setInterval(() => {
      if ((window as any).turnstile) {
        clearInterval(timer);
        initTurnstile();
      }
    }, 300);
    setTimeout(() => {
      clearInterval(timer);
      if (!turnstileToken.value) {
        isTurnstileVerifying.value = false;
      }
    }, 5000);
  }
});

const triggerCheckin = () => {
  if (
    !turnstileToken.value ||
    props.checkinLoading ||
    isTurnstileVerifying.value
  ) {
    return;
  }
  emit("checkin", turnstileToken.value);
};

const estimatedVnd = computed(() => {

  const pts = props.spointBalance;
  if (pts >= 30) {
    return Math.floor(pts / 6) * 2400;
  }
  return Math.floor(pts / 6) * 2000;
});

const formatVnd = (val: number) => {
  return new Intl.NumberFormat("vi-VN").format(val || 0);
};

const getStreakItemClass = (day: number) => {
  if (day <= props.spointStreak) {
    return "bg-white/25 border-white/40 text-white font-bold";
  }
  if (day === 5) {
    return "bg-amber-400/20 border-amber-300 text-amber-200 font-extrabold shadow-sm";
  }
  return "bg-white/10 border-white/10 text-white/50";
};
</script>

<style scoped>
:deep(.checkin-cta-btn) {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.checkin-cta-btn .anticon) {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  vertical-align: middle !important;
  line-height: 1 !important;
}

:deep(.checkin-cta-btn > span) {
  display: inline-flex !important;
  align-items: center !important;
}

:deep(#turnstile-checkin-container),
:deep(#turnstile-checkin-container iframe) {
  border-radius: 16px !important;
  overflow: hidden !important;
}
</style>

