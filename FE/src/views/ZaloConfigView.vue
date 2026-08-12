<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { message } from "ant-design-vue";
import axios from "axios";
import { api, type ApiResponse } from "../services/api";
import {
  defaultZaloBotStatus,
  saveZaloBotStatus,
  type ZaloBotStatus,
} from "../services/zalo-bot-status";
import {
  TeamOutlined,
  LinkOutlined,
  SmileOutlined,
  SaveOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  QrcodeOutlined,
  SettingOutlined,
  CodeOutlined,
} from "@ant-design/icons-vue";

const activeSettingsMenu = ref<'bot' | 'commands'>('bot');
const activeCommandTab = ref<'group' | 'private'>('group');
const savingGroupCommands = ref(false);
const savingPrivateCommands = ref(false);
const groupCommands = reactive({
  wallet: { command: 'vitien', response: '💰 Số dư ví của bạn: {total_balance}\n🆔 UID: {uid}' },
  withdraw: { command: 'ruttien', response: '✅ Đã tạo yêu cầu rút toàn bộ {total_balance}. Vui lòng chờ quản trị viên xử lý.', insufficient_response: '⚠️ Số dư hiện tại của bạn là {total_balance}. Số tiền rút tối thiểu là 10.000đ.' },
  orders: { command: 'donhang', response: '📦 Theo dõi các đơn hàng của bạn tại đây:\n{url}\n🔐 Mã đăng nhập đã được gửi qua tin nhắn riêng.\nChú ý: Tin nhắn có thể nằm trong phần "Tin nhắn từ người lạ". Nếu tắt nhận tin nhắn từ người lạ, vui lòng nhắn riêng cho bot với cú pháp {get_tracking_code_command}', private_response: '🔐 Mã theo dõi của bạn: {tracking_code}\nTuyệt đối không chia sẻ mã này với bất kỳ ai. Nếu quên mã vui lòng chat {new_tracking_code} vào đoạn chat riêng này.' },
});
const privateCommands = reactive({
  tracking: { command: 'tracking-code', response: '🔐 Mã theo dõi của bạn: {tracking_code}\nTuyệt đối không chia sẻ mã này với bất kỳ ai. Nếu quên mã vui lòng chat {new_tracking_code} vào đoạn chat riêng này.' },
  reset_tracking: { command: 'new-tracking-code', response: '🔐 Mã theo dõi của bạn: {tracking_code}\nTuyệt đối không chia sẻ mã này với bất kỳ ai. Nếu quên mã vui lòng chat {new_tracking_code} vào đoạn chat riêng này.' },
});
const commandText = (value: string) => value.replace(/^#+/, '').replace(/\s+/g, '').toLowerCase();

// State 1: Zalo Group IDs Management
const groupIds = ref<string[]>([]);
const savingGroups = ref(false);

// State 2: Link Conversion Message Template
const linkConvertTemplate = ref(
  `🛒 Link hoàn tiền của bạn:\n{affiliate_link}\n\n📦 Sản phẩm: {product_name}\n💰 Hoa hồng: {commission} ({commission_rate})\n\nTiết kiệm ngay khi mua sắm qua Zalo Bot!`
);
const linkConvertErrorTemplate = ref(
  `⚠️ Không thể lấy thông tin sản phẩm từ link này:\n{original_link}\n\nVui lòng kiểm tra lại link Shopee hoặc thử lại sau.`
);
const savingLinkTemplate = ref(false);

// State 3: New Member Welcome Template
const enableWelcomeMessage = ref(true);
const welcomeMessageTemplate = ref(
  `👋 Chào mừng {user_name} đã tham gia nhóm {group_name}!\n\n🤖 Mình là Bot Hoàn Tiền. Hãy dán link Shopee vào nhóm để nhận ngay hoàn tiền tự động nhé! 💸`
);
const savingWelcomeTemplate = ref(false);
const checkingBotStatus = ref(false);
const startingQrLogin = ref(false);
const loadingConfig = ref(true);
const showQrModal = ref(false);
let statusTimer: number | undefined;

const botStatus = ref<ZaloBotStatus>(defaultZaloBotStatus());

interface ZaloBotSettings {
  group_ids: string[];
  link_convert_template: string;
  link_convert_error_template: string;
  welcome_enabled: boolean;
  welcome_template: string;
  group_commands: typeof groupCommands;
  private_commands: typeof privateCommands;
}

const configPayload = (): ZaloBotSettings => ({
  group_ids: groupIds.value.map((id) => id.trim()).filter(Boolean),
  link_convert_template: linkConvertTemplate.value.trim(),
  link_convert_error_template: linkConvertErrorTemplate.value.trim(),
  welcome_enabled: enableWelcomeMessage.value,
  welcome_template: welcomeMessageTemplate.value.trim(),
  group_commands: {
    wallet: { ...groupCommands.wallet, command: groupCommands.wallet.command.trim().toLowerCase() },
    withdraw: { ...groupCommands.withdraw, command: groupCommands.withdraw.command.trim().toLowerCase() },
    orders: { ...groupCommands.orders, command: groupCommands.orders.command.trim().toLowerCase() },
  },
  private_commands: {
    tracking: { ...privateCommands.tracking, command: privateCommands.tracking.command.trim().toLowerCase() },
    reset_tracking: { ...privateCommands.reset_tracking, command: privateCommands.reset_tracking.command.trim().toLowerCase() },
  },
});

const applyConfig = (config: ZaloBotSettings) => {
  groupIds.value = [...config.group_ids];
  linkConvertTemplate.value = config.link_convert_template;
  linkConvertErrorTemplate.value = config.link_convert_error_template;
  enableWelcomeMessage.value = config.welcome_enabled;
  welcomeMessageTemplate.value = config.welcome_template;
  Object.assign(groupCommands.wallet, config.group_commands.wallet);
  Object.assign(groupCommands.withdraw, config.group_commands.withdraw);
  Object.assign(groupCommands.orders, config.group_commands.orders);
  Object.assign(privateCommands.tracking, config.private_commands.tracking);
  Object.assign(privateCommands.reset_tracking, config.private_commands.reset_tracking);
};

const savePrivateCommands = async () => {
  const commands = [privateCommands.tracking.command, privateCommands.reset_tracking.command].map(value => value.trim().replace(/^#+/, '').toLowerCase());
  if (commands.some(command => !command)) return message.warning('Lệnh chat riêng không được để trống!');
  if (commands.some(command => !/^[a-z0-9_-]+$/i.test(command))) return message.warning('Lệnh chỉ được chứa chữ không dấu, số, gạch ngang và gạch dưới!');
  if (new Set(commands).size !== commands.length) return message.warning('Các lệnh chat riêng không được trùng nhau!');
  if (!privateCommands.tracking.response.trim() || !privateCommands.reset_tracking.response.trim()) return message.warning('Nội dung phản hồi không được để trống!');
  [privateCommands.tracking.command, privateCommands.reset_tracking.command] = commands;
  savingPrivateCommands.value = true;
  try { await persistConfig(); message.success('Lưu lệnh chat riêng thành công!'); }
  catch (error) { message.error(getErrorMessage(error, 'Không thể lưu lệnh chat riêng.')); }
  finally { savingPrivateCommands.value = false; }
};

const saveGroupCommands = async () => {
  const commandValues = [groupCommands.wallet.command, groupCommands.withdraw.command, groupCommands.orders.command].map(value => value.trim().replace(/^#+/, '').toLowerCase());
  if (commandValues.some(value => !value)) return message.warning('Lệnh chat nhóm không được để trống!');
  if (commandValues.some(value => !/^[a-z0-9_]+$/i.test(value))) return message.warning('Lệnh chỉ được chứa chữ không dấu, số và dấu gạch dưới!');
  if (new Set(commandValues).size !== commandValues.length) return message.warning('Các lệnh chat nhóm không được trùng nhau!');
  const contents = [groupCommands.wallet.response, groupCommands.withdraw.response, groupCommands.withdraw.insufficient_response, groupCommands.orders.response, groupCommands.orders.private_response];
  if (contents.some(value => !value.trim())) return message.warning('Nội dung phản hồi không được để trống!');
  [groupCommands.wallet.command, groupCommands.withdraw.command, groupCommands.orders.command] = commandValues;
  savingGroupCommands.value = true;
  try { await persistConfig(); message.success('Lưu thiết lập lệnh chat nhóm thành công!'); }
  catch (error) { message.error(getErrorMessage(error, 'Không thể lưu thiết lập lệnh chat nhóm.')); }
  finally { savingGroupCommands.value = false; }
};

const getErrorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback;

const loadConfig = async () => {
  loadingConfig.value = true;
  try {
    const response = await api.get<ApiResponse<ZaloBotSettings>>(
      "/api/admin/zalo-config"
    );
    if (response.data.data) applyConfig(response.data.data);
  } catch (error) {
    message.error(getErrorMessage(error, "Không thể tải cấu hình Bot Zalo."));
  } finally {
    loadingConfig.value = false;
  }
};

const stopStatusPolling = () => {
  if (statusTimer !== undefined) window.clearInterval(statusTimer);
  statusTimer = undefined;
};

const checkBotStatus = async (silent = false) => {
  if (!silent) checkingBotStatus.value = true;
  try {
    const response = await api.get<ApiResponse<ZaloBotStatus>>(
      "/api/admin/zalo-config/status"
    );
    if (response.data.data) {
      botStatus.value = response.data.data;
      saveZaloBotStatus(response.data.data);
    }
    if (botStatus.value.connected) {
      showQrModal.value = false;
      stopStatusPolling();
    }
  } catch (error) {
    if (!silent)
      message.error(
        getErrorMessage(error, "Không thể kiểm tra trạng thái Bot Zalo.")
      );
  } finally {
    checkingBotStatus.value = false;
  }
};

const startQrLogin = async () => {
  startingQrLogin.value = true;
  showQrModal.value = true;
  try {
    const response = await api.post<ApiResponse<ZaloBotStatus>>(
      "/api/admin/zalo-config/login-qr"
    );
    if (response.data.data) {
      botStatus.value = response.data.data;
      saveZaloBotStatus(response.data.data);
    }
    stopStatusPolling();
    statusTimer = window.setInterval(() => checkBotStatus(true), 1500);
    await checkBotStatus(true);
  } catch (error) {
    showQrModal.value = false;
    message.error(getErrorMessage(error, "Không thể khởi tạo đăng nhập QR."));
  } finally {
    startingQrLogin.value = false;
  }
};

const persistConfig = async () => {
  const response = await api.put<ApiResponse<ZaloBotSettings>>(
    "/api/admin/zalo-config",
    configPayload()
  );
  if (response.data.data) applyConfig(response.data.data);
  await checkBotStatus(true);
};

onMounted(() => Promise.all([loadConfig(), checkBotStatus()]));
onUnmounted(stopStatusPolling);

// Group ID operations (dynamic input rows)
const addGroupInput = () => {
  groupIds.value.push("");
};

const removeGroupInput = (index: number) => {
  groupIds.value.splice(index, 1);
};

const saveGroupIds = async () => {
  const normalized = groupIds.value.map((id) => id.trim()).filter(Boolean);
  if (!normalized.length) {
    message.warning("Vui lòng nhập ít nhất một ID nhóm Zalo!");
    return;
  }
  savingGroups.value = true;
  try {
    await persistConfig();
    message.success("Lưu danh sách ID nhóm Zalo thành công!");
  } catch (error) {
    message.error(getErrorMessage(error, "Không thể lưu danh sách nhóm Zalo."));
  } finally {
    savingGroups.value = false;
  }
};

// Variable copy helper
const copyVariable = (varName: string) => {
  navigator.clipboard.writeText(varName);
  message.success(`Đã sao chép biến ${varName}!`);
};

const saveLinkTemplate = async () => {
  if (!linkConvertTemplate.value.trim()) {
    message.warning("Nội dung chuyển đổi link không được để trống!");
    return;
  }
  if (!linkConvertErrorTemplate.value.trim()) {
    message.warning("Nội dung báo lỗi sản phẩm không được để trống!");
    return;
  }
  savingLinkTemplate.value = true;
  try {
    await persistConfig();
    message.success("Cập nhật mẫu tin nhắn chuyển đổi link thành công!");
  } catch (error) {
    message.error(getErrorMessage(error, "Không thể lưu mẫu chuyển đổi link."));
  } finally {
    savingLinkTemplate.value = false;
  }
};

const saveWelcomeTemplate = async () => {
  if (enableWelcomeMessage.value && !welcomeMessageTemplate.value.trim()) {
    message.warning("Nội dung chào mừng không được để trống!");
    return;
  }
  savingWelcomeTemplate.value = true;
  try {
    await persistConfig();
    message.success("Cập nhật cấu hình tin chào mừng thành công!");
  } catch (error) {
    message.error(getErrorMessage(error, "Không thể lưu mẫu chào mừng."));
  } finally {
    savingWelcomeTemplate.value = false;
  }
};
</script>

<template>
  <section class="max-w-4xl mx-auto space-y-6 text-left">
    <!-- Page Header -->
    <div class="border-b border-slate-200 dark:border-slate-800 pb-5 text-left">
      <h3
        class="m-0 text-lg font-black text-slate-900 dark:text-white flex items-center gap-2"
      >
        <MessageOutlined class="text-blue-500" />
        <span>Cấu hình Bot Zalo</span>
      </h3>
      <p class="mt-1 mb-0 text-xs text-slate-500">
        Quản lý nhóm Zalo hoạt động và mẫu nội dung phản hồi tự động của Bot.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        type="button"
        :class="[
          'flex items-center gap-3 rounded-2xl border p-4 text-left transition-all',
          activeSettingsMenu === 'bot'
            ? 'border-orange-200 bg-orange-50/70 shadow-sm'
            : 'border-slate-200 bg-white hover:border-orange-100 hover:bg-orange-50/30',
        ]"
        @click="activeSettingsMenu = 'bot'"
      >
        <span :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', activeSettingsMenu === 'bot' ? 'bg-[#ee4d2d] text-white' : 'bg-slate-100 text-slate-500']"><SettingOutlined /></span>
        <span><span class="block text-sm font-black text-slate-900">Thiết lập Bot</span><span class="mt-1 block text-[11px] text-slate-500">Trạng thái, nhóm và nội dung tự động</span></span>
      </button>
      <button
        type="button"
        :class="[
          'flex items-center gap-3 rounded-2xl border p-4 text-left transition-all',
          activeSettingsMenu === 'commands'
            ? 'border-orange-200 bg-orange-50/70 shadow-sm'
            : 'border-slate-200 bg-white hover:border-orange-100 hover:bg-orange-50/30',
        ]"
        @click="activeSettingsMenu = 'commands'"
      >
        <span :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', activeSettingsMenu === 'commands' ? 'bg-[#ee4d2d] text-white' : 'bg-slate-100 text-slate-500']"><CodeOutlined /></span>
        <span><span class="block text-sm font-black text-slate-900">Thiết lập lệnh chat</span><span class="mt-1 block text-[11px] text-slate-500">Lệnh chat trong nhóm và chat riêng</span></span>
      </button>
    </div>

    <a-spin :spinning="loadingConfig" tip="Đang tải cấu hình Bot Zalo...">
    <div v-show="activeSettingsMenu === 'bot'" class="flex flex-col gap-6" :class="{ 'min-h-[360px]': loadingConfig }">
      <!-- Bot Status Card -->
      <div
        class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs"
      >
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-center gap-3">
            <div
              :class="[
                'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border',
                botStatus.connected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-orange-50 border-orange-200 text-[#ee4d2d]',
              ]"
            >
              <CheckCircleOutlined v-if="botStatus.connected" class="text-xl" />
              <QrcodeOutlined v-else class="text-xl" />
            </div>
            <div>
              <h4 class="m-0 text-sm font-black text-slate-900 dark:text-white">
                Trạng thái Bot
              </h4>
              <div
                v-if="botStatus.connected"
                class="mt-1 flex items-center gap-2"
              >
                <span class="relative flex h-2.5 w-2.5">
                  <span
                    class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"
                  ></span>
                  <span
                    class="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"
                  ></span>
                </span>
                <span class="text-xs font-bold text-emerald-600"
                  >Bot đang hoạt động</span
                >
                <span
                  v-if="botStatus.botId"
                  class="text-[11px] text-slate-400 font-mono"
                  >ID: {{ botStatus.botId }}</span
                >
              </div>
              <p v-else class="mt-1 mb-0 text-xs font-semibold text-slate-500">
                Bạn chưa đăng nhập bot
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 self-start sm:self-auto">
            <button
              v-if="!botStatus.connected"
              type="button"
              :disabled="startingQrLogin"
              class="h-9 px-4 rounded-xl bg-[#ee4d2d] hover:bg-[#d63d1e] !text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 cursor-pointer disabled:opacity-60"
              @click="startQrLogin"
            >
              <ReloadOutlined v-if="startingQrLogin" spin class="!text-white" />
              <QrcodeOutlined v-else class="!text-white" />
              <span class="!text-white">Đăng nhập ngay</span>
            </button>
            <button
              type="button"
              :disabled="checkingBotStatus"
              class="h-9 px-3 rounded-xl border border-slate-200 text-slate-500 hover:text-[#ee4d2d] hover:border-orange-200 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              @click="checkBotStatus()"
            >
              <ReloadOutlined :spin="checkingBotStatus" />
              <span>Kiểm tra</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Card 1: Quản lý ID Nhóm Zalo -->
      <div
        class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4 shadow-2xs"
      >
        <div>
          <h4
            class="m-0 text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"
          >
            <TeamOutlined class="text-blue-600" />
            <span>1. ID Nhóm Zalo bot hoạt động</span>
          </h4>
          <p class="mt-1 mb-0 text-xs text-slate-500">
            Khai báo danh sách ID nhóm Zalo để bot thực hiện chuyển đổi link và
            phản hồi tin nhắn.
          </p>
        </div>

        <!-- Warning Callout Box -->
        <div
          class="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5"
        >
          <InfoCircleOutlined class="text-amber-600 text-sm shrink-0 mt-0.5" />
          <p class="m-0 leading-relaxed font-medium">
            <strong>*Note:</strong> Vui lòng thêm tài khoản Bot vào nhóm Zalo
            trước khi nhập ID nhóm bên dưới để đảm bảo bot có đủ quyền đọc và
            phản hồi tin nhắn.
          </p>
        </div>

        <!-- Dynamic Group ID Inputs List -->
        <div class="space-y-3 pt-1">
          <div class="flex items-center justify-between">
            <label
              class="block text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Danh sách ID nhóm Zalo ({{ groupIds.length }} nhóm):
            </label>
            <button
              @click="addGroupInput"
              type="button"
              class="bg-[#ee4d2d] hover:bg-[#d63d1e] !text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <PlusOutlined class="!text-white" />
              <span class="!text-white">Thêm nhóm</span>
            </button>
          </div>

          <!-- Input Rows List -->
          <div v-if="groupIds.length > 0" class="space-y-2">
            <div
              v-for="(id, idx) in groupIds"
              :key="idx"
              class="flex items-center gap-2 animate-fade-in"
            >
              <span
                class="text-xs font-bold text-slate-400 font-mono w-6 text-right shrink-0"
              >
                #{{ idx + 1 }}
              </span>
              <input
                v-model="groupIds[idx]"
                type="text"
                placeholder="Nhập ID nhóm Zalo..."
                class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:border-[#ee4d2d] focus:ring-2 focus:ring-orange-100"
              />
              <button
                @click="removeGroupInput(idx)"
                type="button"
                class="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors cursor-pointer shrink-0"
                title="Xóa ô nhập này"
              >
                <DeleteOutlined class="text-sm" />
              </button>
            </div>
          </div>

          <div
            v-else
            class="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-center"
          >
            Chưa có ID nhóm nào. Vui lòng bấm nút "Thêm nhóm" để tạo ô nhập mới.
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end pt-2">
          <button
            @click="saveGroupIds"
            :disabled="savingGroups"
            type="button"
            class="bg-[#ee4d2d] hover:bg-[#d63d1e] !text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-70"
          >
            <ReloadOutlined
              :spin="savingGroups"
              v-if="savingGroups"
              class="!text-white"
            />
            <SaveOutlined v-else class="!text-white" />
            <span class="!text-white">Lưu danh sách nhóm</span>
          </button>
        </div>
      </div>

      <!-- Card 2: Nội dung chuyển đổi link -->
      <div
        class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4 shadow-2xs"
      >
        <div>
          <h4
            class="m-0 text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"
          >
            <LinkOutlined class="text-[#ee4d2d]" />
            <span>2. Nội dung chuyển đổi link</span>
          </h4>
          <p class="mt-1 mb-0 text-xs text-slate-500">
            Mẫu tin nhắn bot sẽ tự động gửi vào nhóm Zalo sau khi quy đổi link
            Shopee thường thành link hoàn tiền.
          </p>
        </div>

        <!-- Helper Variable Tags -->
        <div class="space-y-1.5">
          <label
            class="block text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            Bấm để sao chép nhanh biến:
          </label>
          <div class="flex flex-wrap gap-1.5">
            <button
              @click="copyVariable('{affiliate_link}')"
              type="button"
              class="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-[11px] font-mono font-bold transition-all cursor-pointer"
            >
              {affiliate_link}
            </button>
            <button
              @click="copyVariable('{product_name}')"
              type="button"
              class="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-[11px] font-mono font-bold transition-all cursor-pointer"
            >
              {product_name}
            </button>
            <button
              @click="copyVariable('{commission_rate}')"
              type="button"
              class="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-[11px] font-mono font-bold transition-all cursor-pointer"
            >
              {commission_rate}
            </button>
            <button
              @click="copyVariable('{commission}')"
              type="button"
              class="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-[11px] font-mono font-bold transition-all cursor-pointer"
            >
              {commission}
            </button>
          </div>
        </div>

        <!-- Textarea template -->
        <div class="space-y-1.5">
          <textarea
            v-model="linkConvertTemplate"
            rows="5"
            placeholder="Nhập nội dung mẫu chuyển đổi link..."
            class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-sans text-slate-800 dark:text-slate-100 focus:border-[#ee4d2d] focus:ring-2 focus:ring-orange-100"
          ></textarea>
        </div>

        <div
          class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3"
        >
          <div>
            <h5
              class="m-0 text-xs font-black text-slate-800 dark:text-slate-200"
            >
              Nội dung báo lỗi khi không lấy được dữ liệu sản phẩm
            </h5>
            <p class="mt-1 mb-0 text-[11px] text-slate-500 leading-5">
              Bot gửi nội dung này khi nhận đúng link Shopee nhưng không lấy
              được thông tin sản phẩm hoặc link shopee giả.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[11px] font-bold text-slate-500"
              >Biến hỗ trợ:</span
            >
            <button
              type="button"
              class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-mono font-bold transition-all cursor-pointer"
              @click="copyVariable('{original_link}')"
            >
              {original_link}
            </button>
          </div>
          <textarea
            v-model="linkConvertErrorTemplate"
            rows="4"
            placeholder="Nhập nội dung báo lỗi khi không lấy được dữ liệu sản phẩm..."
            class="w-full bg-rose-50/40 dark:bg-slate-800 border border-rose-200 dark:border-slate-700 rounded-xl p-3 text-xs font-sans text-slate-800 dark:text-slate-100 focus:border-[#ee4d2d] focus:ring-2 focus:ring-orange-100"
          ></textarea>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end pt-1">
          <button
            @click="saveLinkTemplate"
            :disabled="savingLinkTemplate"
            type="button"
            class="bg-[#ee4d2d] hover:bg-[#d63d1e] !text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-70"
          >
            <ReloadOutlined
              :spin="savingLinkTemplate"
              v-if="savingLinkTemplate"
              class="!text-white"
            />
            <SaveOutlined v-else class="!text-white" />
            <span class="!text-white">Lưu mẫu chuyển đổi link</span>
          </button>
        </div>
      </div>

      <!-- Card 3: Nội dung chào mừng member mới -->
      <div
        class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4 shadow-2xs"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <h4
              class="m-0 text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"
            >
              <SmileOutlined class="text-[#ee4d2d]" />
              <span>3. Nội dung chào mừng member mới</span>
            </h4>
            <p class="mt-1 mb-0 text-xs text-slate-500">
              Tự động gửi tin nhắn chào mừng khi có thành viên mới gia nhập nhóm
              Zalo.
            </p>
          </div>

          <!-- Enable/Disable Switch -->
          <a-switch
            v-model:checked="enableWelcomeMessage"
            :loading="savingWelcomeTemplate"
            @change="saveWelcomeTemplate"
          />
        </div>

        <!-- Conditional Welcome Textarea -->
        <div
          v-if="enableWelcomeMessage"
          class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 text-left animate-fade-in"
        >
          <!-- Helper Variable Tags -->
          <div class="space-y-1.5">
            <label
              class="block text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Bấm để sao chép nhanh biến:
            </label>
            <div class="flex flex-wrap gap-1.5">
              <button
                @click="copyVariable('{user_name}')"
                type="button"
                class="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-[11px] font-mono font-bold transition-all cursor-pointer"
              >
                {user_name}
              </button>
            </div>
          </div>

          <textarea
            v-model="welcomeMessageTemplate"
            rows="4"
            placeholder="Nhập nội dung chào mừng..."
            class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-sans text-slate-800 dark:text-slate-100 focus:border-[#ee4d2d] focus:ring-2 focus:ring-orange-100"
          ></textarea>

          <!-- Save Button -->
          <div class="flex justify-end pt-1">
            <button
              @click="saveWelcomeTemplate"
              :disabled="savingWelcomeTemplate"
              type="button"
              class="bg-[#ee4d2d] hover:bg-[#d63d1e] !text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-70"
            >
              <ReloadOutlined
                :spin="savingWelcomeTemplate"
                v-if="savingWelcomeTemplate"
                class="!text-white"
              />
              <SaveOutlined v-else class="!text-white" />
              <span class="!text-white">Lưu mẫu chào mừng</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-show="activeSettingsMenu === 'commands'" class="min-h-[360px] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
      <div class="mb-5">
        <h4 class="m-0 flex items-center gap-2 text-sm font-black text-slate-900"><CodeOutlined class="text-[#ee4d2d]"/> Thiết lập lệnh chat</h4>
        <p class="mb-0 mt-1 text-xs text-slate-500">Quản lý lệnh Bot phản hồi theo từng loại hội thoại Zalo.</p>
      </div>
      <a-tabs v-model:activeKey="activeCommandTab" class="zalo-command-tabs">
        <a-tab-pane key="group">
          <template #tab><span class="inline-flex items-center gap-2"><TeamOutlined/> Lệnh chat nhóm</span></template>
          <div class="space-y-4">
            <a-alert type="info" show-icon message="Bot chỉ nhận các lệnh này trong nhóm đã khai báo. Dấu # luôn được giữ cố định; tên lệnh không được để trống hoặc trùng nhau." class="!rounded-xl"/>

            <div class="rounded-2xl border border-slate-200 p-4">
              <div class="mb-4"><h5 class="m-0 text-sm font-black text-slate-800">Ví tiền</h5><p class="mb-0 mt-1 text-xs leading-5 text-slate-500">Tạo người dùng và ví nếu chưa tồn tại, sau đó trả về số dư khả dụng cùng UID của người gửi.</p></div>
              <label class="mb-1.5 block text-xs font-bold text-slate-600">Lệnh</label>
              <a-input :value="groupCommands.wallet.command" placeholder="vitien" @update:value="groupCommands.wallet.command = commandText($event)"><template #addonBefore><b>#</b></template></a-input>
              <div class="mb-1.5 mt-4 flex items-center justify-between"><label class="text-xs font-bold text-slate-600">Nội dung phản hồi</label><div class="flex gap-1"><button v-for="variable in ['{total_balance}','{uid}']" :key="variable" type="button" class="rounded-md bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-600" @click="copyVariable(variable)">{{ variable }}</button></div></div>
              <a-textarea v-model:value="groupCommands.wallet.response" :rows="3"/>
            </div>

            <div class="rounded-2xl border border-slate-200 p-4">
              <div class="mb-4"><h5 class="m-0 text-sm font-black text-slate-800">Rút tiền</h5><p class="mb-0 mt-1 text-xs leading-5 text-slate-500">Rút toàn bộ số dư khả dụng. Bot từ chối nếu số dư dưới 10.000đ và tạo yêu cầu rút tiền nếu đủ điều kiện.</p></div>
              <label class="mb-1.5 block text-xs font-bold text-slate-600">Lệnh</label>
              <a-input :value="groupCommands.withdraw.command" placeholder="ruttien" @update:value="groupCommands.withdraw.command = commandText($event)"><template #addonBefore><b>#</b></template></a-input>
              <div class="mb-1.5 mt-4 flex items-center justify-between"><label class="text-xs font-bold text-slate-600">Nội dung rút thành công</label><button type="button" class="rounded-md bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-600" @click="copyVariable('{total_balance}')">{total_balance}</button></div>
              <a-textarea v-model:value="groupCommands.withdraw.response" :rows="3"/>
              <div class="mb-1.5 mt-4 flex items-center justify-between"><label class="text-xs font-bold text-slate-600">Nội dung khi chưa đủ 10.000đ</label><button type="button" class="rounded-md bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-600" @click="copyVariable('{total_balance}')">{total_balance}</button></div>
              <a-textarea v-model:value="groupCommands.withdraw.insufficient_response" :rows="3"/>
            </div>

            <div class="rounded-2xl border border-slate-200 p-4">
              <div class="mb-4"><h5 class="m-0 text-sm font-black text-slate-800">Đơn hàng</h5><p class="mb-0 mt-1 text-xs leading-5 text-slate-500">Gửi đường dẫn tra cứu vào nhóm và nhắn riêng mã tracking để người dùng đăng nhập xem đơn hàng.</p></div>
              <label class="mb-1.5 block text-xs font-bold text-slate-600">Lệnh</label>
              <a-input :value="groupCommands.orders.command" placeholder="donhang" @update:value="groupCommands.orders.command = commandText($event)"><template #addonBefore><b>#</b></template></a-input>
              <div class="mb-1.5 mt-4 flex flex-wrap items-center justify-between gap-2"><label class="text-xs font-bold text-slate-600">Nội dung phản hồi trong nhóm</label><div class="flex flex-wrap gap-1"><button v-for="variable in ['{url}','{get_tracking_code_command}']" :key="variable" type="button" class="rounded-md bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-600" @click="copyVariable(variable)">{{ variable }}</button></div></div>
              <a-textarea v-model:value="groupCommands.orders.response" :rows="3"/>
              <div class="mb-1.5 mt-4 flex flex-wrap items-center justify-between gap-2"><label class="text-xs font-bold text-slate-600">Nội dung tin nhắn riêng</label><div class="flex gap-1"><button v-for="variable in ['{tracking_code}','{new_tracking_code}']" :key="variable" type="button" class="rounded-md bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-600" @click="copyVariable(variable)">{{ variable }}</button></div></div>
              <a-textarea v-model:value="groupCommands.orders.private_response" :rows="3"/>
            </div>

            <div class="flex justify-end pt-1"><button type="button" :disabled="savingGroupCommands" class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ee4d2d] px-5 py-2.5 text-xs font-bold !text-white shadow-sm disabled:opacity-60" @click="saveGroupCommands"><ReloadOutlined v-if="savingGroupCommands" spin class="!text-white"/><SaveOutlined v-else class="!text-white"/><span class="!text-white">Lưu lệnh chat nhóm</span></button></div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="private">
          <template #tab><span class="inline-flex items-center gap-2"><MessageOutlined/> Lệnh chat riêng</span></template>
          <div class="space-y-4">
            <a-alert type="info" show-icon message="Khi người dùng gửi lệnh riêng, Bot sẽ tự tạo tài khoản và ví nếu chưa tồn tại." class="!rounded-xl"/>
            <div class="rounded-2xl border border-slate-200 p-4">
              <div class="mb-4"><h5 class="m-0 text-sm font-black text-slate-800">Mã theo dõi</h5><p class="mb-0 mt-1 text-xs leading-5 text-slate-500">Lấy tracking code của người dùng từ hệ thống để đăng nhập tại trang /login.</p></div>
              <label class="mb-1.5 block text-xs font-bold text-slate-600">Lệnh</label>
              <a-input :value="privateCommands.tracking.command" placeholder="tracking-code" @update:value="privateCommands.tracking.command = commandText($event)"><template #addonBefore><b>#</b></template></a-input>
              <div class="mb-1.5 mt-4 flex flex-wrap items-center justify-between gap-2"><label class="text-xs font-bold text-slate-600">Nội dung phản hồi</label><div class="flex gap-1"><button v-for="variable in ['{tracking_code}','{new_tracking_code}']" :key="variable" type="button" class="rounded-md bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-600" @click="copyVariable(variable)">{{ variable }}</button></div></div>
              <a-textarea v-model:value="privateCommands.tracking.response" :rows="3"/>
            </div>
            <div class="rounded-2xl border border-slate-200 p-4">
              <div class="mb-4"><h5 class="m-0 text-sm font-black text-slate-800">Quên mã theo dõi</h5><p class="mb-0 mt-1 text-xs leading-5 text-slate-500">Sinh mã tracking mới, cập nhật người dùng tương ứng trong DB và vô hiệu mã cũ.</p></div>
              <label class="mb-1.5 block text-xs font-bold text-slate-600">Lệnh</label>
              <a-input :value="privateCommands.reset_tracking.command" placeholder="new-tracking-code" @update:value="privateCommands.reset_tracking.command = commandText($event)"><template #addonBefore><b>#</b></template></a-input>
              <div class="mb-1.5 mt-4 flex flex-wrap items-center justify-between gap-2"><label class="text-xs font-bold text-slate-600">Nội dung phản hồi</label><div class="flex gap-1"><button v-for="variable in ['{tracking_code}','{new_tracking_code}']" :key="variable" type="button" class="rounded-md bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-600" @click="copyVariable(variable)">{{ variable }}</button></div></div>
              <a-textarea v-model:value="privateCommands.reset_tracking.response" :rows="3"/>
            </div>
            <div class="flex justify-end"><button type="button" :disabled="savingPrivateCommands" class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ee4d2d] px-5 py-2.5 text-xs font-bold !text-white shadow-sm disabled:opacity-60" @click="savePrivateCommands"><ReloadOutlined v-if="savingPrivateCommands" spin class="!text-white"/><SaveOutlined v-else class="!text-white"/><span class="!text-white">Lưu lệnh chat riêng</span></button></div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
    </a-spin>

    <a-modal
      v-model:open="showQrModal"
      title="Đăng nhập Bot Zalo"
      :footer="null"
      :mask-closable="false"
      width="420px"
      @cancel="stopStatusPolling"
    >
      <div class="py-3 flex flex-col items-center text-center">
        <template v-if="botStatus.qrImage">
          <div
            class="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm"
          >
            <img
              :src="botStatus.qrImage"
              alt="QR đăng nhập Zalo"
              class="w-64 h-64 object-contain"
            />
          </div>
          <h4 class="mt-4 mb-1 text-sm font-black text-slate-900">
            {{
              botStatus.qrState === "scanned"
                ? "Đã quét mã QR"
                : "Quét mã bằng ứng dụng Zalo"
            }}
          </h4>
          <p class="m-0 text-xs text-slate-500 leading-5">
            {{
              botStatus.qrState === "scanned"
                ? "Vui lòng xác nhận đăng nhập trên điện thoại."
                : "Mở Zalo → biểu tượng QR → quét mã và xác nhận đăng nhập."
            }}
          </p>
          <div
            v-if="botStatus.scannedAccount"
            class="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2"
          >
            <img
              v-if="botStatus.scannedAccount.avatar"
              :src="botStatus.scannedAccount.avatar"
              class="w-7 h-7 rounded-full object-cover"
              alt="Zalo avatar"
            />
            <span class="text-xs font-bold text-emerald-700">{{
              botStatus.scannedAccount.displayName
            }}</span>
          </div>
        </template>
        <template
          v-else-if="
            botStatus.qrState === 'expired' ||
            botStatus.qrState === 'declined' ||
            botStatus.qrState === 'error'
          "
        >
          <QrcodeOutlined class="text-5xl text-slate-300" />
          <h4 class="mt-4 mb-1 text-sm font-black text-slate-900">
            Mã QR không còn hiệu lực
          </h4>
          <p class="m-0 text-xs text-slate-500">
            {{ botStatus.error || "Vui lòng tạo mã QR mới để tiếp tục." }}
          </p>
          <button
            type="button"
            class="mt-4 h-9 px-4 rounded-xl bg-[#ee4d2d] hover:bg-[#d63d1e] !text-white text-xs font-bold cursor-pointer"
            @click="startQrLogin"
          >
            Tạo mã QR mới
          </button>
        </template>
        <template v-else>
          <a-spin size="large" />
          <p class="mt-4 mb-0 text-xs font-semibold text-slate-500">
            Đang tạo mã QR đăng nhập...
          </p>
        </template>
      </div>
    </a-modal>
  </section>
</template>
