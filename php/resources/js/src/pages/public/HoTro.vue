<template>
  <div class="w-full space-y-6">
    <!-- Page Title & Header -->
    <div class="mt-6 text-center max-w-xl mx-auto space-y-2">
      <h1
        class="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight"
      >
        Trung Tâm <span class="text-[#ee4d2d]">Hỗ Trợ</span>
      </h1>
      <p
        class="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
      >
        Chúng tôi ở đây để hỗ trợ bạn giải quyết mọi vấn đề phát sinh trong quá
        trình đối soát hoàn tiền và rút ví.
      </p>
    </div>

    <!-- MAIN SECTION -->
    <a-row justify="center" class="mt-8">
      <a-col :xs="24" :md="16" :lg="12" class="flex flex-col gap-5">
        <h3
          class="text-xs text-center font-black tracking-widest text-slate-800 dark:text-slate-200 uppercase select-none pb-2"
        >
          Kênh Liên Hệ Chính Thức
        </h3>

        <!-- Zalo Box -->
        <a :href="zaloGroupUrl" target="_blank" class="block no-underline">
          <a-card
            :bordered="false"
            hoverable
            class="rounded-2xl bg-blue-50/50 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 transition-all shadow-sm"
          >
            <div class="flex items-center gap-4">
            <div
              class="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center shrink-0 font-extrabold text-sm select-none"
            >
              Zalo
            </div>
            <div>
              <h4
                class="text-sm font-black text-slate-800 dark:text-slate-100 transition-colors mb-0"
              >
                Zalo
              </h4>
              <p
                class="text-xs text-slate-500 mt-0.5 font-semibold leading-relaxed mb-0"
              >
                Tham gia nhóm Zalo để nhận thông tin và được hỗ trợ nhanh nhất.
              </p>
            </div>
          </div>
          </a-card>
        </a>

        <!-- Email Box -->
        <a :href="`mailto:${siteSettings.contact_email}`" class="block no-underline">
          <a-card
            :bordered="false"
            hoverable
            class="rounded-2xl bg-orange-50/50 dark:bg-slate-900 border border-orange-100 dark:border-slate-800 transition-all shadow-sm"
          >
            <div class="flex items-center gap-4">
              <div
                class="h-14 w-14 rounded-2xl bg-orange-100 dark:bg-orange-900/20 text-[#ee4d2d] flex items-center justify-center shrink-0 font-extrabold text-xs select-none"
              >
                <MailOutlined class="text-xl" />
              </div>
              <div>
                <h4
                  class="text-sm font-black text-slate-800 dark:text-slate-100 transition-colors mb-0"
                >
                  Email (Thư điện tử)
                </h4>
                <p
                  class="text-xs text-slate-500 mt-0.5 font-semibold leading-relaxed mb-0"
                >
                  <span
                    class="select-all font-bold text-slate-600 dark:text-slate-300"
                    >{{ siteSettings.contact_email }}</span
                  ><br />Email contact.
                </p>
              </div>
            </div>
          </a-card>
        </a>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { MailOutlined } from "@ant-design/icons-vue";
import { useSiteSettings } from "@/composables/useSiteSettings";

const { siteSettings, loadSiteSettings } = useSiteSettings();
const zaloGroupUrl = computed(() => siteSettings.value.contact_zalo || "#");

onMounted(() => {
  loadSiteSettings();
});
</script>
