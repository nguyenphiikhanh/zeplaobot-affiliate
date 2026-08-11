<template>
  <div class="flex flex-col gap-6 pb-12">
    <!-- Header & Template Selector Tabs -->
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">
            <SettingOutlined /> Cấu hình hệ thống
          </div>
          <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center text-lg shrink-0">
              <MailOutlined />
            </div>
            Quản Lý Mẫu Email (Email Templates)
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tùy chỉnh tiêu đề, nội dung HTML, biến động và kiểm tra gửi email tự động.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <a-button @click="fetchTemplates" :loading="loading" class="!rounded-xl font-bold">
            <template #icon><ReloadOutlined /></template>
            Làm mới
          </a-button>

          <a-button
            type="primary"
            size="large"
            class="!rounded-xl font-bold bg-orange-500 hover:bg-orange-600 border-none shadow-md shadow-orange-500/20 px-6"
            :loading="saving"
            @click="handleSave"
          >
            <template #icon><SaveOutlined /></template>
            Lưu Mẫu Email
          </a-button>
        </div>
      </div>

      <!-- Template Selection Tabs -->
      <div v-if="templates.length > 0" class="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          v-for="tpl in templates"
          :key="tpl.key"
          type="button"
          @click="selectTemplate(tpl)"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border"
          :class="
            selectedKey === tpl.key
              ? 'bg-slate-900 text-white border-slate-900 dark:bg-orange-500 dark:border-orange-500 shadow-sm'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          "
        >
          <span class="w-2 h-2 rounded-full" :class="tpl.is_active ? 'bg-emerald-400' : 'bg-slate-400'"></span>
          {{ tpl.name }}
        </button>
      </div>
    </div>

    <!-- Alert Notification Banner -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
    >
      <a-alert
        v-if="alertMessage"
        :type="alertType"
        show-icon
        closable
        class="!rounded-xl border-none shadow-xs"
        :message="alertMessage"
        @close="alertMessage = ''"
      />
    </transition>

    <!-- Empty State -->
    <div v-if="!loading && templates.length === 0" class="py-16 px-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center">
      <div class="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-3xl mb-4">
        <InboxOutlined />
      </div>
      <h3 class="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
        Chưa có mẫu email nào trong hệ thống
      </h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-6">
        Bấm nút bên dưới để khởi tạo 4 mẫu email mặc định (Đơn hàng mới, Hoàn tiền, Rút tiền, Đặt lại mật khẩu).
      </p>
      <a-button
        type="primary"
        size="large"
        class="!rounded-xl font-bold bg-orange-500 hover:bg-orange-600 border-none shadow-lg shadow-orange-500/25 px-6"
        :loading="seeding"
        @click="handleSeedTemplates"
      >
        <template #icon><PlusOutlined /></template>
        Khởi Tạo 4 Mẫu Email Mặc Định
      </a-button>
    </div>

    <!-- MAIN EDITOR SECTION (Matching User Screenshot Exactly) -->
    <div v-else-if="currentTemplate" class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-6">
      
      <!-- Row 1: CÁC BIẾN HỖ TRỢ -->
      <div>
        <div class="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
          CÁC BIẾN HỖ TRỢ:
        </div>
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Reset to Default Button -->
          <a-popconfirm
            title="Khôi phục mẫu này về nội dung mặc định ban đầu?"
            ok-text="Khôi phục"
            cancel-text="Hủy"
            @confirm="handleResetCurrent"
          >
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300 border border-amber-300/80 dark:border-amber-500/30 transition-all cursor-pointer shadow-2xs"
            >
              <UndoOutlined /> Nhập mẫu mặc định
            </button>
          </a-popconfirm>

          <!-- Variable Pill Badges -->
          <button
            v-for="varName in currentTemplate.available_variables"
            :key="varName"
            type="button"
            @click="insertVariable(varName)"
            title="Nhấp để chèn biến vào vị trí con trỏ"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono font-medium bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-all cursor-pointer shadow-2xs"
          >
            <span class="font-bold text-amber-600 dark:text-amber-400">{{ '{' + varName + '}' }}</span>
            <span class="text-[11px] text-slate-400 dark:text-slate-500 ml-1">- {{ getVariableDescription(varName) }}</span>
          </button>
        </div>
      </div>

      <!-- Row 2: TIÊU ĐỀ EMAIL -->
      <div>
        <div class="flex items-center justify-between gap-4 mb-2">
          <div class="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            TIÊU ĐỀ EMAIL
          </div>

          <div class="flex items-center gap-2">
            <!-- Preview Button -->
            <button
              type="button"
              @click="openPreviewModal"
            class="email-template-action inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-500/30 transition-all cursor-pointer"
            >
              <EyeOutlined /> Xem trước
            </button>

            <!-- Send Test Button -->
            <button
              type="button"
              @click="openTestSendModal"
            class="email-template-action inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-500/30 transition-all cursor-pointer"
            >
              <SendOutlined /> Gửi thử
            </button>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <a-input
            v-model:value="editForm.subject"
            placeholder="Nhập tiêu đề email..."
            size="large"
            class="!rounded-xl text-sm font-medium flex-1"
          />

          <!-- Toggle Switch Active -->
          <div class="flex items-center gap-2 shrink-0 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <a-switch v-model:checked="editForm.is_active" class="bg-orange-500" />
            <span class="text-xs font-bold text-slate-700 dark:text-slate-200">Bật gửi mail</span>
          </div>
        </div>
      </div>

      <!-- Row 3: NỘI DUNG HTML TEMPLATE (TinyMCE Rich Text Editor) -->
      <div>
        <div class="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          NỘI DUNG HTML TEMPLATE
        </div>

        <TinymceEditor
          ref="tinymceRef"
          v-model="editForm.body_html"
          :height="560"
        />
      </div>
    </div>

    <!-- Modal Preview Pure HTML -->
    <a-modal
      v-model:open="previewModalVisible"
      :title="'Xem Trước: ' + (currentTemplate?.name || '')"
      width="840px"
      :footer="null"
    >
      <div v-if="previewData" class="flex flex-col gap-3 py-2">
        <div class="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
          <strong>Tiêu đề:</strong> {{ previewData.subject }}
        </div>
        <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white shadow-inner">
          <iframe
            :srcdoc="previewData.html"
            class="w-full h-[520px] border-none"
            sandbox="allow-same-origin"
          ></iframe>
        </div>
      </div>
    </a-modal>

    <!-- Modal Send Test Email -->
    <a-modal
      v-model:open="testModalVisible"
      :title="'Gửi Email Thử Nghiệm: ' + (currentTemplate?.name || '')"
      ok-text="Gửi Email Thử Nghiệm"
      cancel-text="Hủy"
      :confirm-loading="sendingTest"
      @ok="handleSendTest"
    >
      <div class="py-2 flex flex-col gap-4">
        <p class="text-xs text-slate-500 m-0">
          Hệ thống sẽ render mẫu thư này với dữ liệu mẫu và tiến hành gửi email qua cổng Resend đến địa chỉ bên dưới.
        </p>

        <div>
          <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5">
            Email người nhận:
          </label>
          <a-input
            v-model:value="testEmailInput"
            placeholder="Ví dụ: admin@saffi.vn..."
            size="large"
            class="!rounded-xl text-xs"
            type="email"
          />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import api from '@/api/axios';
import TinymceEditor from '@/components/TinymceEditor.vue';
import {
  MailOutlined,
  ReloadOutlined,
  EyeOutlined,
  SendOutlined,
  UndoOutlined,
  SettingOutlined,
  InboxOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons-vue';

interface EmailTemplate {
  id: number;
  key: string;
  name: string;
  subject: string;
  body_html: string;
  available_variables: string[];
  is_active: boolean;
}

const templates = ref<EmailTemplate[]>([]);
const selectedKey = ref<string>('');
const loading = ref(false);
const saving = ref(false);
const seeding = ref(false);
const alertMessage = ref('');
const alertType = ref<'success' | 'error' | 'info'>('success');

const tinymceRef = ref();

const editForm = reactive({
  subject: '',
  body_html: '',
  is_active: true,
});

// Preview Modal state
const previewModalVisible = ref(false);
const previewData = ref<{ subject: string; html: string } | null>(null);

// Test Send Modal state
const testModalVisible = ref(false);
const testEmailInput = ref('');
const sendingTest = ref(false);

const currentTemplate = computed(() => {
  return templates.value.find((t) => t.key === selectedKey.value) || null;
});

const variableDescriptions: Record<string, string> = {
  name: 'Tên thành viên',
  email: 'Email thành viên',
  order_id: 'Mã đơn hàng',
  amount: 'Số tiền hoa hồng',
  commission: 'Số tiền hoa hồng',
  reset_url: 'Đường dẫn đặt lại mật khẩu',
  year: 'Năm hiện tại',
};

const getVariableDescription = (varName: string): string => {
  return variableDescriptions[varName] || varName;
};

const showAlert = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
  alertMessage.value = msg;
  alertType.value = type;
  setTimeout(() => {
    if (alertMessage.value === msg) alertMessage.value = '';
  }, 6000);
};

const fetchTemplates = async () => {
  loading.value = true;
  try {
    const res = await api.get('/admin/email-templates');
    if (res.data && res.data.data) {
      templates.value = res.data.data;
      if (templates.value.length > 0 && !selectedKey.value) {
        selectTemplate(templates.value[0]);
      } else if (selectedKey.value) {
        const found = templates.value.find((t) => t.key === selectedKey.value);
        if (found) selectTemplate(found);
      }
    }
  } catch (err: any) {
    showAlert(err.response?.data?.message || 'Không thể tải danh sách email template. Vui lòng kiểm tra quyền Admin.', 'error');
  } finally {
    loading.value = false;
  }
};

const selectTemplate = (template: EmailTemplate) => {
  selectedKey.value = template.key;
  editForm.subject = template.subject;
  editForm.body_html = template.body_html;
  editForm.is_active = template.is_active;
};

const insertVariable = (varName: string) => {
  const text = ` {${varName}} `;
  if (tinymceRef.value) {
    tinymceRef.value.insertContent(text);
  } else {
    editForm.body_html += text;
  }
};

const handleSave = async () => {
  if (!currentTemplate.value) return;
  saving.value = true;
  try {
    const res = await api.put(`/admin/email-templates/${currentTemplate.value.key}`, {
      subject: editForm.subject,
      body_html: editForm.body_html,
      is_active: editForm.is_active,
    });

    if (res.data && res.data.data) {
      const updated = res.data.data;
      const idx = templates.value.findIndex((t) => t.key === updated.key);
      if (idx !== -1) {
        templates.value[idx] = updated;
      }
      showAlert(`Đã lưu cấu hình mẫu email [${updated.name}] thành công!`, 'success');
    }
  } catch (err: any) {
    showAlert(err.response?.data?.message || 'Không thể lưu thay đổi mẫu email', 'error');
  } finally {
    saving.value = false;
  }
};

const handleResetCurrent = async () => {
  if (!currentTemplate.value) return;
  try {
    const res = await api.post(`/admin/email-templates/${currentTemplate.value.key}/reset`);
    if (res.data && res.data.data) {
      const updated = res.data.data;
      const idx = templates.value.findIndex((t) => t.key === updated.key);
      if (idx !== -1) {
        templates.value[idx] = updated;
        selectTemplate(updated);
      }
      showAlert(`Đã khôi phục mẫu [${updated.name}] về mặc định!`, 'success');
    }
  } catch (err: any) {
    showAlert(err.response?.data?.message || 'Không thể khôi phục mẫu mặc định', 'error');
  }
};

const handleSeedTemplates = async () => {
  seeding.value = true;
  try {
    const res = await api.post('/admin/email-templates/seed');
    if (res.data && res.data.data) {
      templates.value = res.data.data;
      if (templates.value.length > 0) {
        selectTemplate(templates.value[0]);
      }
      showAlert('Đã khởi tạo 4 mẫu email mặc định thành công!', 'success');
    }
  } catch (err: any) {
    showAlert(err.response?.data?.message || 'Lỗi khi khởi tạo mẫu email mặc định', 'error');
  } finally {
    seeding.value = false;
  }
};

const openPreviewModal = async () => {
  if (!currentTemplate.value) return;
  try {
    const res = await api.post(`/admin/email-templates/${currentTemplate.value.key}/preview`, {
      subject: editForm.subject,
      body_html: editForm.body_html,
    });
    if (res.data && res.data.data) {
      previewData.value = res.data.data;
      previewModalVisible.value = true;
    }
  } catch (err: any) {
    showAlert(err.response?.data?.message || 'Không thể render preview HTML', 'error');
  }
};

const openTestSendModal = () => {
  testEmailInput.value = '';
  testModalVisible.value = true;
};

const handleSendTest = async () => {
  if (!currentTemplate.value || !testEmailInput.value) {
    showAlert('Vui lòng nhập địa chỉ email người nhận!', 'error');
    return;
  }
  sendingTest.value = true;
  try {
    const res = await api.post(`/admin/email-templates/${currentTemplate.value.key}/send-test`, {
      to_email: testEmailInput.value,
      subject: editForm.subject,
      body_html: editForm.body_html,
    });
    showAlert(res.data?.message || 'Đã gửi email thử nghiệm thành công!', 'success');
    testModalVisible.value = false;
  } catch (err: any) {
    showAlert(err.response?.data?.message || 'Lỗi gửi email thử nghiệm', 'error');
  } finally {
    sendingTest.value = false;
  }
};

onMounted(() => {
  fetchTemplates();
});
</script>

<style scoped>
.email-template-action {
  min-height: 30px;
  line-height: 1;
}

.email-template-action > span,
:deep(.ant-btn-icon),
:deep(.ant-btn > span) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.email-template-action :deep(svg),
:deep(.ant-btn svg) {
  display: block;
}
</style>
