import { onMounted, onUnmounted, reactive, ref } from "vue";
import { message } from "ant-design-vue";
import axios from "axios";
import { api, type ApiResponse } from "../services/api";
import {
  defaultZaloBotStatus,
  saveZaloBotStatus,
  type ZaloBotStatus,
} from "../services/zalo-bot-status";

export function useZaloConfig() {
  const activeSettingsMenu = ref<'bot' | 'commands'>('bot');
  const activeCommandTab = ref<'group' | 'private'>('group');

  const savingGroupCommands = ref(false);
  const savingPrivateCommands = ref(false);

  const groupCommands = reactive({
    wallet: { command: 'vitien', response: '👤 TÀI KHOẢN #{uid}\n───────────────────\n💰 Số dư ví:      {total_balance}\n🔄 Đang xử lý:    {pending_balance}\n💸 Đã thanh toán:  {total_paid}\n───────────────────' },
    withdraw: {
      command: 'ruttien',
      response: '✅ Đã tạo yêu cầu rút toàn bộ {total_balance}. Vui lòng chờ quản trị viên xử lý.',
      insufficient_response: '⚠️ Số dư hiện tại của bạn là {total_balance}. Số tiền rút tối thiểu là 10.000đ.',
      no_bank_response: '⚠️ Bạn chưa cấu hình tài khoản ngân hàng. Vui lòng truy cập {url} để cập nhật thông tin trước khi rút tiền.'
    },
    orders: {
      command: 'donhang',
      response: '📦 Theo dõi các đơn hàng của bạn tại đây:\n{url}\n🔐 Mã đăng nhập đã được gửi qua tin nhắn riêng.\nChú ý: Tin nhắn có thể nằm trong phần "Tin nhắn từ người lạ". Nếu tắt nhận tin nhắn từ người lạ, vui lòng nhắn riêng cho bot với cú pháp {get_tracking_code_command}',
      private_response: '🔐 Mã theo dõi của bạn: {tracking_code}\nTuyệt đối không chia sẻ mã này với bất kỳ ai. Nếu quên mã vui lòng chat {new_tracking_code} vào đoạn chat riêng này.'
    },
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
    `🛒 Link hoàn tiền của bạn:\n{affiliate_link}\n\n📦 Sản phẩm: {product_name}\n💰 Hoa hồng: {commission} ({commission_rate})\n💰 Hoa hồng cho bạn(ước tính): {user_commission}\n\n📌 Lưu ý cách mua đúng\n• Xoá sản phẩm cũ trong giỏ -> bấm link -> thêm giỏ mới -> mua hàng bình thường.\n• Tuyệt đối không được xem live và video.\n• Mua hàng không xem sản phẩm khác.`
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

  // Group ID operations
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

  // Variable copy helper & descriptions
  const varDescriptions: Record<string, string> = {
    '{affiliate_link}': 'Link hoàn tiền Shopee đã được chuyển đổi thành link affiliate',
    '{product_name}': 'Tên sản phẩm Shopee nhận được từ đường dẫn',
    '{commission}': 'Số tiền hoa hồng dự kiến nhận được (VD: 15.000đ)',
    '{commission_rate}': 'Tỷ lệ phần trăm hoa hồng sản phẩm (VD: 5.5%)',
    '{user_commission}': 'Hoa hồng ước tính thực nhận của người dùng sau khi trừ thuế & phí dịch vụ',
    '{original_link}': 'Đường dẫn Shopee gốc người dùng gửi vào nhóm',
    '{user_name}': 'Tên tài khoản Zalo của thành viên vừa tham gia nhóm',
    '{group_name}': 'Tên nhóm Zalo hiện tại',
    '{total_balance}': 'Số dư ví khả dụng hiện tại của người dùng',
    '{pending_balance}': 'Số tiền chờ xử lý rút',
    '{total_paid}': 'Tổng số tiền đã thanh toán',
    '{uid}': 'ID tài khoản Zalo (Zalo UID)',
    '{url}': 'Đường dẫn liên kết đến trang Web Portal tương ứng',
    '{get_tracking_code_command}': 'Lệnh chat riêng lấy mã theo dõi (mặc định #tracking-code)',
    '{tracking_code}': 'Mã đăng nhập / mã theo dõi cá nhân của người dùng',
    '{new_tracking_code}': 'Lệnh chat riêng tạo mới mã theo dõi (mặc định #new-tracking-code)',
  };

  const getVarDesc = (varName: string) => varDescriptions[varName] || `Biến thay thế ${varName}`;

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

  const saveGroupCommands = async () => {
    const commandValues = [groupCommands.wallet.command, groupCommands.withdraw.command, groupCommands.orders.command].map(value => value.trim().replace(/^#+/, '').toLowerCase());
    if (commandValues.some(value => !value)) return message.warning('Lệnh chat nhóm không được để trống!');
    if (commandValues.some(value => !/^[a-z0-9_]+$/i.test(value))) return message.warning('Lệnh chỉ được chứa chữ không dấu, số và dấu gạch dưới!');
    if (new Set(commandValues).size !== commandValues.length) return message.warning('Các lệnh chat nhóm không được trùng nhau!');
    const contents = [groupCommands.wallet.response, groupCommands.withdraw.response, groupCommands.withdraw.insufficient_response, groupCommands.withdraw.no_bank_response, groupCommands.orders.response, groupCommands.orders.private_response];
    if (contents.some(value => !value.trim())) return message.warning('Nội dung phản hồi không được để trống!');
    [groupCommands.wallet.command, groupCommands.withdraw.command, groupCommands.orders.command] = commandValues;
    savingGroupCommands.value = true;
    try { await persistConfig(); message.success('Lưu thiết lập lệnh chat nhóm thành công!'); }
    catch (error) { message.error(getErrorMessage(error, 'Không thể lưu thiết lập lệnh chat nhóm.')); }
    finally { savingGroupCommands.value = false; }
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

  return {
    activeSettingsMenu,
    activeCommandTab,
    botStatus,
    checkingBotStatus,
    startingQrLogin,
    loadingConfig,
    showQrModal,
    groupIds,
    savingGroups,
    linkConvertTemplate,
    linkConvertErrorTemplate,
    savingLinkTemplate,
    enableWelcomeMessage,
    welcomeMessageTemplate,
    savingWelcomeTemplate,
    groupCommands,
    savingGroupCommands,
    privateCommands,
    savingPrivateCommands,
    commandText,
    addGroupInput,
    removeGroupInput,
    saveGroupIds,
    copyVariable,
    getVarDesc,
    saveLinkTemplate,
    saveWelcomeTemplate,
    saveGroupCommands,
    savePrivateCommands,
    checkBotStatus,
    startQrLogin,
  };
}
