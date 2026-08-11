<template>
  <div class="w-full space-y-12">
    <!-- Page Title & Header -->
    <div class="mt-6 text-center max-w-2xl mx-auto space-y-2">
      <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
        Hướng Dẫn <span class="text-[#ee4d2d]">Mua Sắm</span> Hoàn Tiền
      </h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
        Chỉ với 3 bước đơn giản, bạn sẽ tiết kiệm được tối đa chi phí cho mỗi đơn hàng mua sắm trên Shopee.
      </p>
    </div>

    <!-- 3-Step Visual Timeline Layout -->
    <div class="relative max-w-5xl mx-auto">
      <!-- Background Connecting Line for Desktop -->
      <div class="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-[20px] z-0"></div>

      <a-row :gutter="[24, 24]" class="relative z-10">
        <!-- Step Cards -->
        <a-col :xs="24" :md="8" v-for="(step, idx) in steps" :key="idx">
          <a-card :bordered="false" hoverable class="h-full rounded-[2rem] shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all duration-300 group">
            <!-- Step Icon & Number -->
            <div class="flex items-center justify-between gap-3">
              <!-- Big Step Number -->
              <span class="text-[52px] font-black tracking-tight transition-transform duration-300 group-hover:scale-105" :class="step.numberClass">
                {{ step.num }}
              </span>
              <!-- Beautiful Icon Badge -->
              <div class="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:rotate-12" :class="step.badgeClass">
                <component :is="step.icon" class="text-xl" />
              </div>
            </div>

            <h3 class="text-sm font-black text-slate-800 dark:text-slate-200 mt-5 uppercase tracking-wider">
              {{ step.title }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-semibold mb-0">
              {{ step.desc }}
            </p>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- Accordion FAQ section -->
    <div class="max-w-3xl mx-auto space-y-6 pb-8">
      <div class="text-center space-y-1">
        <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Câu Hỏi Thường Gặp <span class="text-[#ee4d2d]">(FAQ)</span>
        </h2>
        <p class="text-slate-500 dark:text-slate-400 text-xs font-bold mb-0">
          Giải đáp mọi thắc mắc của bạn về cơ chế hoàn tiền tự động
        </p>
      </div>

      <!-- FAQ Accordion -->
      <a-card :bordered="false" class="rounded-2xl shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <a-collapse
          v-model:activeKey="activeKey"
          :bordered="false"
          expand-icon-position="end"
          class="bg-transparent"
        >
          <a-collapse-panel v-for="(item, index) in faqItems" :key="index" :header="item.label" class="border-b border-slate-100 dark:border-slate-800/50 faq-panel">
            <p class="text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-0">{{ item.content }}</p>
          </a-collapse-panel>
        </a-collapse>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onActivated } from "vue";
import { CopyOutlined, SyncOutlined, BankOutlined } from "@ant-design/icons-vue";

const scrollToTop = () => {
  window.scrollTo(0, 0);
};

onMounted(() => {
  scrollToTop();
});

onActivated(scrollToTop);

const activeKey = ref([0]); // Mở sẵn tab đầu tiên

const steps = [
  {
    num: "01",
    title: "COPY LINK SHOPEE",
    desc: "Sao chép liên kết sản phẩm bạn yêu thích trực tiếp trên ứng dụng Shopee (hoặc bất kỳ trình duyệt nào).",
    icon: CopyOutlined,
    numberClass: "text-[#ee4d2d]",
    badgeClass: "bg-orange-50 dark:bg-orange-950/30 text-[#ee4d2d]",
  },
  {
    num: "02",
    title: "DÁN & CHUYỂN ĐỔI",
    desc: "Mở Saffi, dán liên kết vừa copy vào ô công cụ. Hệ thống sẽ tự động chuyển đổi thành đường link hoàn tiền thông minh trong 1 giây.",
    icon: SyncOutlined,
    numberClass: "text-amber-500",
    badgeClass: "bg-amber-50 dark:bg-amber-950/20 text-amber-500",
  },
  {
    num: "03",
    title: "MUA SẮM & NHẬN TIỀN",
    desc: "Click vào link chuyển đổi để mua hàng trên Shopee. Hoa hồng trích lại lên tới 90% sẽ được cộng vào số dư Saffi để bạn rút về ngân hàng bất kỳ lúc nào!",
    icon: BankOutlined,
    numberClass: "text-emerald-500",
    badgeClass: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500",
  },
];

const faqs = [
  {
    question: "Hoàn tiền hoạt động thế nào?",
    answer: "Saffi liên kết trực tiếp với Shopee Affiliate (Tiếp thị liên kết). Khi bạn mua hàng thông qua link chuyển đổi của chúng tôi, Shopee sẽ chi trả tiền hoa hồng tiếp thị cho Saffi. Chúng tôi trích xuất phần lớn tiền hoa hồng này (lên tới 90%) để trực tiếp hoàn lại vào tài khoản ví của bạn.",
  },
  {
    question: "Sau bao lâu thì nhận được hoa hồng sau khi mua hàng?",
    answer: "Hệ thống sẽ cập nhật tự động hoa hồng 'Chờ duyệt' trong 7-14 ngày kể từ lúc bạn thanh toán hoặc đặt hàng thành công trên Shopee. Tiền hoàn chính thức khả dụng để rút sau khi đơn hàng được đối soát thành công (khách hàng không bấm trả hàng hoàn tiền).",
  },
  {
    question: "Tại sao đơn hàng của tôi bị hủy hoặc không nhận được hoàn tiền?",
    answer: "Đơn hàng có thể không được ghi nhận hoàn tiền nếu bạn hủy đơn hoặc trả hàng hoàn tiền, hoặc sử dụng các trình duyệt bật chặn quảng cáo AdBlock làm mất cookie đối soát của Shopee. Hãy đảm bảo click link chuyển đổi và đặt hàng ngay lập tức trên app Shopee sạch.Cashback có thể bị hủy từ sàn, Saffi là trung gian nên không được cung cấp lý do cụ thể, nhưng luôn sẵn sàng gửi thông tin đối soát từ sàn cho bạn để đảm bảo hệ thống minh bạch. Vui lòng liên hệ Hỗ trợ để được cung cấp thêm thông tin.",
  },
  {
    question: "Có giới hạn số tiền rút tối thiểu không?",
    answer: "Số tiền tối thiểu cho mỗi lần thực hiện lệnh rút tiền là 10,000đ. Hệ thống của chúng tôi cam kết phê duyệt lệnh rút tự động và chuyển tiền đến tài khoản MB Bank, Vietcombank, Techcombank,... trong vòng chưa đầy 60 phút.",
  },
];

const faqItems = computed(() => {
  return faqs.map(faq => ({
    label: faq.question,
    content: faq.answer
  }));
});
</script>

<style scoped>
:deep(.faq-panel .ant-collapse-header) {
  font-size: 14px;
  font-weight: 800 !important;
  color: #1e293b !important;
  padding: 16px 0 !important;
}
</style>

<style>
html.dark .faq-panel .ant-collapse-header {
  color: #f8fafc !important;
}
html.dark .faq-panel .ant-collapse-expand-icon {
  color: #94a3b8 !important;
}
</style>
