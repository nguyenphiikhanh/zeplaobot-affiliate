<template>
  <div class="w-full pb-4 sm:pb-6">
    <a-collapse
      v-model:activeKey="activeKey"
      ghost
      expandIconPosition="end"
      class="mt-2 sm:mt-4"
    >
      <!-- Single Combined Notes & Guide Collapse -->
      <a-collapse-panel key="1" class="mb-3 sm:mb-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <template #header>
          <div class="flex items-center gap-2.5 py-0.5">
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center shrink-0">
              <WarningOutlined class="text-base sm:text-xl" />
            </div>
            <div class="flex flex-col text-left">
              <span class="font-bold text-xs sm:text-[13px] text-slate-800 dark:text-slate-100 uppercase tracking-wider">Lưu ý Quan trọng & Hướng dẫn</span>
              <span class="text-[10px] sm:text-[11px] font-bold text-slate-500 mt-0.5">Bấm để xem lưu ý và cách nhận hoàn tiền</span>
            </div>
          </div>
        </template>
        <template #extra>
          <span class="text-xs font-bold w-8 text-center select-none text-amber-500 mr-1">{{ activeKey.includes('1') ? 'Ẩn' : 'Xem' }}</span>
        </template>
        
        <div class="px-1 sm:px-2 pb-2">
          <!-- Sub Tab Buttons -->
          <div class="flex items-center gap-2 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
            <button
              @click.stop="subTab = 'notes'"
              class="px-3 py-1 text-xs font-bold rounded-lg transition-all"
              :class="subTab === 'notes' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'"
            >
              1. Lưu ý quan trọng
            </button>
            <button
              @click.stop="subTab = 'guide'"
              class="px-3 py-1 text-xs font-bold rounded-lg transition-all"
              :class="subTab === 'guide' ? 'bg-[#ee4d2d] text-white shadow-sm' : 'text-slate-500 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'"
            >
              2. Hướng dẫn mua hàng
            </button>
          </div>

          <!-- Sub Tab 1: Notes -->
          <div v-if="subTab === 'notes'">
            <div class="flex flex-col gap-2 sm:gap-2.5 mb-3 sm:mb-4">
              <div class="flex items-start gap-2 sm:gap-3" v-for="(note, idx) in importantNotes" :key="idx">
                <div class="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 font-black text-[9px] sm:text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-amber-100 dark:border-amber-800">
                  {{ idx + 1 }}
                </div>
                <p class="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed m-0" v-html="note"></p>
              </div>
            </div>

            <a-row :gutter="[10, 10]">
              <a-col :span="12">
                <div class="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div class="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center shrink-0">
                    <ClockCircleOutlined class="text-sm sm:text-lg" />
                  </div>
                  <div>
                    <div class="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Ghi nhận</div>
                    <div class="text-xs sm:text-[13px] font-bold text-slate-700 dark:text-slate-300">Trong <span class="text-[#ee4d2d]">24h</span></div>
                  </div>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div class="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircleOutlined class="text-sm sm:text-lg" />
                  </div>
                  <div>
                    <div class="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Duyệt hoàn</div>
                    <div class="text-xs sm:text-[13px] font-bold text-emerald-500">7 - 14 ngày</div>
                  </div>
                </div>
              </a-col>
            </a-row>
          </div>

          <!-- Sub Tab 2: Guide Carousel -->
          <div v-else>
            <a-carousel arrows class="bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl mb-2">
              <template #prevArrow>
                <div class="custom-slick-arrow" style="left: 6px; z-index: 10;">
                  <a-button shape="circle" size="small"><LeftOutlined /></a-button>
                </div>
              </template>
              <template #nextArrow>
                <div class="custom-slick-arrow" style="right: 6px; z-index: 10;">
                  <a-button shape="circle" size="small"><RightOutlined /></a-button>
                </div>
              </template>
              <div v-for="(step, index) in steps" :key="'step-'+index">
                <div class="pt-3 pb-6 sm:pt-6 sm:pb-10 px-4 sm:px-8 flex flex-col items-center text-center min-h-[190px] sm:min-h-[260px] select-none">
                  <div v-if="step.image" class="mb-2 sm:mb-4 rounded-xl overflow-hidden shadow-sm inline-block max-w-[130px] sm:max-w-[200px] border border-slate-100 dark:border-slate-700">
                    <img :src="step.image" :alt="step.title" class="w-full h-auto object-cover pointer-events-none" />
                  </div>
                  <h5 class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 sm:mb-2">{{ step.title }}</h5>
                  <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-0" v-html="step.desc"></p>
                </div>
              </div>
            </a-carousel>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>

    <!-- Link Converter Component -->
    <div class="mt-2 sm:mt-4">
      <LinkConverter />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { WarningOutlined, ClockCircleOutlined, CheckCircleOutlined, BookOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons-vue";
import LinkConverter from "@/components/LinkConverter.vue";

onMounted(() => {
});

const activeKey = ref([]);
const subTab = ref("notes");

const importantNotes = [
  "Vui lòng <strong>xóa các sản phẩm tương tự</strong> có sẵn trong giỏ trước khi <strong>mua hàng qua Saffi</strong> để tránh lỗi ghi đè nguồn tracking.",
  "<strong>Giao dịch liền mạch:</strong> Hãy hoàn tất việc thanh toán <strong>trong cùng một phiên</strong> làm việc trên trình duyệt ngay sau khi nhấn link để cookie được lưu vết chính xác.",
  "<strong>Ghi nhận tự động:</strong> Trạng thái đơn hàng được <strong>sàn TMĐT đối tác quyết định tự động</strong>. Saffi hỗ trợ đối soát kỹ thuật và không thể trực tiếp can thiệp kết quả này.",
  "Hãy thực hiện mua hàng với <strong>tốc độ thao tác bình thường</strong>. Mua quá nhanh có thể bị hệ thống bảo mật của sàn quét nhầm là <strong>bot/spam</strong> và từ chối hoàn tiền.",
];

const steps = [
  {
    title: "Tìm sản phẩm & Chia sẻ",
    desc: "Mở ứng dụng Shopee hoặc TikTok, Lazada, chọn sản phẩm cần mua và nhấn nút <span class='text-[#ee4d2d] font-bold bg-orange-50 px-1 rounded'>Chia sẻ</span> (hình mũi tên).",
    image: "/step/1.jpg",
  },
  {
    title: "Sao chép đường dẫn",
    desc: "Trong menu chia sẻ hiện ra, chọn nút <span class='text-[#ee4d2d] font-bold bg-orange-50 px-1 rounded'>Sao chép đường dẫn</span>",
    image: "/step/2.jpg",
  },
  {
    title: "Dán link vào Saffi",
    desc: "Trở lại ứng dụng Saffi, <span class='text-[#ee4d2d] font-bold'>Dán link</span> vừa sao chép vào ô nhập bên dưới, nhấn vào nút <span class='text-[#ee4d2d] font-bold'>Hoàn Tiền</span> để xem thông tin.",
    image: "/step/3.jpg",
  },
  {
    title: "Mua sắm & Nhận hoàn tiền",
    desc: "Nhấn nút đây để mở ứng dụng sàn và mua sắm như bình thường. Tiền hoàn lại sẽ <span class='text-[#ee4d2d] font-bold'>tự động được tích lũy</span> vào tài khoản Saffi của bạn!",
    image: "/step/4.jpg",
  },
];
</script>

<style scoped>
:deep(.ant-collapse-item) {
  border-bottom: none !important;
}

:deep(.ant-collapse-header) {
  padding: 16px !important;
  align-items: center !important;
}

:deep(.ant-collapse-content-box) {
  padding: 0 16px 16px 16px !important;
}
</style>
