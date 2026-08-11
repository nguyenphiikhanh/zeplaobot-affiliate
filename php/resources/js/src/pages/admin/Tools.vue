<template>
  <div class="flex flex-col gap-6 pb-12">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h2
          class="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight"
        >
          Công cụ Affiliate
        </h2>
        <p class="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
          Tổng hợp các tiện ích giúp bạn tối ưu công việc tiếp thị.
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <a-card
      :bordered="false"
      class="admin-card overflow-hidden"
      :body-style="{ padding: '24px' }"
    >
      <div class="flex flex-col gap-4">
        <div
          class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4"
        >
          <h3
            class="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"
          >
            <ToolOutlined class="text-orange-500" />
            Convert Text / Link
          </h3>
          <span class="text-xs text-slate-400"
            >Tự động nhận diện và thay thế tất cả link sàn sang link hoàn tiền
            Affiliate</span
          >
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <!-- Input Text -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <label
                class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                >Văn bản gốc chứa Link</label
              >
              <div class="flex items-center gap-3">
                <a-button
                  v-if="converter.inputText"
                  type="link"
                  danger
                  size="small"
                  class="text-xs px-0 font-semibold flex items-center gap-1"
                  @click="clearText"
                >
                  <template #icon><DeleteOutlined /></template>
                  Xoá (Clear)
                </a-button>
                <a-button
                  type="link"
                  size="small"
                  class="text-xs px-0 font-semibold"
                  @click="pasteText"
                >
                  Dán (Paste)
                </a-button>
              </div>
            </div>
            <a-textarea
              v-model:value="converter.inputText"
              :rows="12"
              placeholder="Dán đoạn văn bản hoặc nhiều link vào đây..."
              class="w-full text-sm leading-relaxed"
            />
            <a-button
              type="primary"
              size="large"
              class="font-semibold w-full mt-2"
              @click="handleConvertText"
              :loading="converter.loading"
              :disabled="!converter.inputText"
            >
              Thực hiện Convert Link
            </a-button>
          </div>

          <!-- Output Text -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <label
                class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                >Kết quả (Văn bản đã Convert)</label
              >
              <a-button
                type="link"
                size="small"
                class="text-xs px-0 font-semibold"
                @click="copyText(converter.outputText)"
                :disabled="!converter.outputText"
              >
                Sao chép (Copy)
              </a-button>
            </div>
            <div class="relative h-full min-h-[300px]">
              <a-textarea
                v-model:value="converter.outputText"
                :rows="12"
                readonly
                class="w-full h-full text-sm leading-relaxed !bg-slate-50 dark:!bg-slate-900 !cursor-text"
                placeholder="Kết quả sau khi chuyển đổi sẽ hiển thị tại đây..."
              />
            </div>
          </div>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { message } from "ant-design-vue";
import { ToolOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import axios from "@/api/axios";

const converter = reactive({
  inputText: "",
  outputText: "",
  loading: false,
});

const clearText = () => {
  converter.inputText = "";
  converter.outputText = "";
  message.success("Đã xoá nội dung!");
};

const handleConvertText = async () => {
  if (!converter.inputText) return;
  converter.loading = true;
  try {
    const res = await axios.post("/admin/link/replace", {
      text: converter.inputText,
    });
    const textData = res?.data?.data?.text || res?.data?.text || res?.data;
    if (typeof textData === "string") {
      converter.outputText = textData;
      message.success("Convert Link thành công!");
    } else if (textData && textData.text) {
      converter.outputText = textData.text;
      message.success("Convert Link thành công!");
    } else {
      message.error("Dữ liệu trả về không hợp lệ.");
    }
  } catch (err) {
    console.error("Lỗi convert link:", err);
    message.error(
      err?.response?.data?.message || err?.message || "Lỗi khi convert link!"
    );
  } finally {
    converter.loading = false;
  }
};

const copyText = async (text) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    message.success("Đã sao chép vào bộ nhớ tạm!");
  } catch (err) {
    message.error("Trình duyệt không hỗ trợ sao chép tự động!");
  }
};

const pasteText = async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      converter.inputText = text;
      message.success("Đã dán từ bộ nhớ tạm!");
    } else {
      message.warning("Bộ nhớ tạm đang trống!");
    }
  } catch (err) {
    message.error("Trình duyệt không cho phép đọc bộ nhớ tạm!");
  }
};
</script>

<style scoped>
.admin-card {
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
</style>
