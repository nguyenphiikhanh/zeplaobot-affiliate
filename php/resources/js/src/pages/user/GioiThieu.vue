<template>
  <div class="max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-20 sm:pb-12">
    <!-- Hero Banner -->
    <div
      class="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-orange-600 via-amber-500 to-rose-500 p-4 sm:p-8 text-white shadow-lg sm:shadow-xl shadow-orange-500/15"
    >
      <div
        class="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"
      ></div>
      <div
        class="absolute right-1/3 -bottom-16 w-48 h-48 bg-amber-400/20 rounded-full blur-xl pointer-events-none"
      ></div>

      <div
        class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center"
      >
        <div class="lg:col-span-7 space-y-2.5 sm:space-y-3.5 text-left">
          <div
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[11px] sm:text-xs font-black tracking-wider uppercase"
          >
            <GiftOutlined /> Chương Trình Giới Thiệu
          </div>

          <h1
            class="text-lg sm:text-3xl font-black tracking-tight leading-snug m-0 text-white"
          >
            Giới Thiệu Ngay -
            <span
              class="underline decoration-amber-300 decoration-wavy decoration-2"
              >Nhận Quà Liền Tay</span
            >
          </h1>

          <p
            class="text-white/95 text-xs sm:text-sm font-medium leading-relaxed m-0 max-w-2xl"
          >
            Chia sẻ liên kết giới thiệu tới bạn bè để nhận ngay các phần thưởng độc quyền:
          </p>

          <!-- Highlights Chips on Mobile & PC -->
          <div class="flex flex-wrap gap-2 pt-1">
            <div
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-200"
            >
              🎁 <span><strong>+5 S-Point</strong> cho đơn hàng đầu tiên</span>
            </div>
            <div
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-200"
            >
              💰 <span><strong>5% Hoa hồng</strong> trong 365 ngày</span>
            </div>
          </div>
        </div>

        <!-- Quick Copy Box inside Hero -->
        <div
          class="lg:col-span-5 bg-white/15 backdrop-blur-md border border-white/25 p-4 sm:p-5 rounded-xl sm:rounded-2xl space-y-3 shadow-inner"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-100"
            >
              Liên kết giới thiệu của bạn
            </span>
            <span
              class="text-[10px] text-white/90 bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
              >Sao chép 1-Click</span
            >
          </div>

          <!-- Full Link Box (Row 1) -->
          <div
            class="bg-black/30 rounded-xl p-3 border border-white/20 font-mono text-xs sm:text-sm font-bold tracking-tight text-amber-300 break-all select-all leading-relaxed text-center"
          >
            {{ referralLink || "Đang tải link..." }}
          </div>

          <!-- Full-Width Copy Button (Row 2) -->
          <a-button
            block
            type="primary"
            size="large"
            class="bg-white text-orange-600 hover:bg-amber-50 active:bg-amber-100 font-black border-0 rounded-xl shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm h-11 transition-all"
            @click="copyReferralLink"
          >
            <CopyOutlined />
            {{ copiedLink ? "Đã sao chép Link!" : "Sao chép Link giới thiệu" }}
          </a-button>
        </div>
      </div>
    </div>

    <!-- How it works (3 Steps Timeline Process) -->
    <div class="space-y-3 sm:space-y-4">
      <div class="flex items-center justify-between">
        <h3
          class="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider m-0 flex items-center gap-2"
        >
          <span class="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
          Quy Trình Giới Thiệu Đơn Giản
        </h3>
        <span class="text-xs text-slate-400 font-medium">3 Bước Nhận Thưởng</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
        <!-- Step 1 -->
        <div
          class="relative group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-3"
        >
          <div class="flex items-center justify-between">
            <div
              class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center text-lg font-black shadow-md shadow-orange-500/20 shrink-0"
            >
              <ShareAltOutlined />
            </div>
            <span
              class="font-mono text-2xl font-black text-slate-200 dark:text-slate-800 group-hover:text-orange-500 transition-colors"
            >
              01
            </span>
          </div>

          <div class="space-y-1">
            <h4
              class="font-extrabold text-slate-800 dark:text-slate-100 text-sm m-0"
            >
              Gửi link giới thiệu
            </h4>
            <p
              class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed m-0"
            >
              Sao chép liên kết giới thiệu độc quyền của bạn và chia sẻ cho bạn bè.
            </p>
          </div>
        </div>

        <!-- Step 2 -->
        <div
          class="relative group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-3"
        >
          <div class="flex items-center justify-between">
            <div
              class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center text-lg font-black shadow-md shadow-blue-500/20 shrink-0"
            >
              <UsergroupAddOutlined />
            </div>
            <span
              class="font-mono text-2xl font-black text-slate-200 dark:text-slate-800 group-hover:text-blue-500 transition-colors"
            >
              02
            </span>
          </div>

          <div class="space-y-1">
            <h4
              class="font-extrabold text-slate-800 dark:text-slate-100 text-sm m-0"
            >
              Bạn bè đăng ký
            </h4>
            <p
              class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed m-0"
            >
              Người dùng mới truy cập link và đăng nhập tài khoản lần đầu.
            </p>
          </div>
        </div>

        <!-- Step 3 -->
        <div
          class="relative group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-3"
        >
          <div class="flex items-center justify-between">
            <div
              class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center text-lg font-black shadow-md shadow-emerald-500/20 shrink-0"
            >
              <GiftOutlined />
            </div>
            <span
              class="font-mono text-2xl font-black text-slate-200 dark:text-slate-800 group-hover:text-emerald-500 transition-colors"
            >
              03
            </span>
          </div>

          <div class="space-y-1">
            <h4
              class="font-extrabold text-slate-800 dark:text-slate-100 text-sm m-0"
            >
              Nhận thưởng tự động
            </h4>
            <p
              class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed m-0"
            >
              Cả hai nhận +5 S-Point cho đơn đầu &amp; 5% hoa hồng từ đơn hàng thành công.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Program Rules Section (Thể Lệ Chương Trình) -->
    <div
      class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-sm space-y-4 sm:space-y-6"
    >
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center text-lg font-black shadow-md shadow-orange-500/20 shrink-0"
          >
            <FileTextOutlined />
          </div>
          <div>
            <h2
              class="text-base sm:text-xl font-black text-slate-800 dark:text-slate-100 m-0 tracking-tight leading-tight"
            >
              Thể Lệ &amp; Quyền Lợi Chương Trình
            </h2>
            <p class="text-xs text-slate-400 font-medium m-0 pt-0.5">
              Chi tiết quy tắc tính thưởng hoa hồng và điểm S-Point cho bạn và người được giới thiệu
            </p>
          </div>
        </div>

        <a-tag
          color="orange"
          class="self-start sm:self-center m-0 px-3 py-1 font-bold text-xs rounded-full border-0 bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 shrink-0"
        >
          ✨ ÁP DỤNG TẤT CẢ THÀNH VIÊN
        </a-tag>
      </div>

      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5 text-xs sm:text-sm"
      >
        <!-- Rule 1 -->
        <div
          class="group p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-900/40 hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-300 shadow-xs hover:shadow-md space-y-2.5"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <div
                class="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center text-sm font-bold shadow-xs"
              >
                <GiftOutlined />
              </div>
              <span
                class="font-extrabold text-slate-800 dark:text-slate-100 text-sm"
              >
                1. Thưởng Đơn Đầu Tiên
              </span>
            </div>
            <span
              class="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-black text-[10px] uppercase tracking-wider shrink-0"
            >
              +5 S-Point Cả Hai
            </span>
          </div>

          <p
            class="text-slate-600 dark:text-slate-300 leading-relaxed m-0 text-xs sm:text-sm font-normal"
          >
            Khi người được giới thiệu hoàn thành đơn hàng thành công đầu tiên,
            <strong class="text-orange-600 dark:text-orange-400 font-bold"
              >CẢ HAI</strong
            >
            (người giới thiệu và người được giới thiệu) sẽ nhận ngay
            <strong>5 S-Point</strong> vào tài khoản.
          </p>
        </div>

        <!-- Rule 2 -->
        <div
          class="group p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300 shadow-xs hover:shadow-md space-y-2.5"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <div
                class="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center text-sm font-bold shadow-xs"
              >
                <DollarOutlined />
              </div>
              <span
                class="font-extrabold text-slate-800 dark:text-slate-100 text-sm"
              >
                2. Thưởng 5% Hoa Hồng
              </span>
            </div>
            <span
              class="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black text-[10px] uppercase tracking-wider shrink-0"
            >
              Liên Tục 365 Ngày
            </span>
          </div>

          <p
            class="text-slate-600 dark:text-slate-300 leading-relaxed m-0 text-xs sm:text-sm font-normal"
          >
            Trong vòng 365 ngày tính từ ngày bạn bè tạo tài khoản, mỗi đơn hàng hoàn thành thành công của người đó sẽ trích
            <strong class="text-emerald-600 dark:text-emerald-400 font-bold"
              >5% hoa hồng thực nhận</strong
            >
            thưởng trực tiếp cho bạn.
          </p>
        </div>

        <!-- Rule 3 -->
        <div
          class="group p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 shadow-xs hover:shadow-md space-y-2.5"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <div
                class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center text-sm font-bold shadow-xs"
              >
                <CheckCircleOutlined />
              </div>
              <span
                class="font-extrabold text-slate-800 dark:text-slate-100 text-sm"
              >
                3. Quyền Lợi Người Được Giới Thiệu
              </span>
            </div>
            <span
              class="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-black text-[10px] uppercase tracking-wider shrink-0"
            >
              100% Hoa Hồng
            </span>
          </div>

          <p
            class="text-slate-600 dark:text-slate-300 leading-relaxed m-0 text-xs sm:text-sm font-normal"
          >
            Người được giới thiệu vẫn giữ nguyên
            <strong class="text-blue-600 dark:text-blue-400 font-bold"
              >100% hoa hồng cá nhân</strong
            >
            từ các đơn hàng của mình mà không bị chiết khấu bớt bất kỳ chi phí nào.
          </p>
        </div>

        <!-- Rule 4 -->
        <div
          class="group p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50/80 via-white to-fuchsia-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 shadow-xs hover:shadow-md space-y-2.5"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <div
                class="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-fuchsia-500 text-white flex items-center justify-center text-sm font-bold shadow-xs"
              >
                <ThunderboltOutlined />
              </div>
              <span
                class="font-extrabold text-slate-800 dark:text-slate-100 text-sm"
              >
                4. Cộng Thưởng Tự Động
              </span>
            </div>
            <span
              class="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-black text-[10px] uppercase tracking-wider shrink-0"
            >
              Cộng Vào Số Dư Ví
            </span>
          </div>

          <p
            class="text-slate-600 dark:text-slate-300 leading-relaxed m-0 text-xs sm:text-sm font-normal"
          >
            Hoa hồng 5% sẽ được tự động kết toán và cộng trực tiếp vào
            <strong>Ví tiền khả dụng</strong> của bạn. Bạn có thể thực hiện rút tiền về ngân hàng bất cứ lúc nào.
          </p>
        </div>
      </div>
    </div>

    <!-- Referrals List Section -->
    <div
      class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm space-y-3 sm:space-y-4"
    >
      <div
        class="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800"
      >
        <div class="space-y-0.5">
          <h2
            class="text-sm sm:text-lg font-bold text-slate-800 dark:text-slate-100 m-0 leading-tight"
          >
            Danh Sách Bạn Bè Đã Giới Thiệu
          </h2>
          <p class="text-[11px] sm:text-xs text-slate-400 m-0">
            Danh sách các thành viên đăng ký qua mã của bạn
          </p>
        </div>
        <a-button
          type="default"
          size="middle"
          class="rounded-xl flex items-center gap-1 font-semibold text-xs shrink-0"
          @click="fetchData"
          :loading="loading"
        >
          <template #icon><ReloadOutlined /></template>
          Làm mới
        </a-button>
      </div>

      <!-- Mobile Card List View (Visible on Mobile) -->
      <div class="block md:hidden space-y-3">
        <div v-if="loading" class="py-8 text-center">
          <a-spin />
        </div>
        <template v-else-if="referrals.length > 0">
          <div
            v-for="item in referrals"
            :key="item.id"
            class="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 p-3.5 rounded-xl space-y-2.5"
          >
            <!-- Card Header: Avatar & Info -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <a-avatar
                  :src="item.image"
                  :size="36"
                  class="bg-orange-500 font-bold uppercase shrink-0"
                >
                  {{ item.name?.charAt(0) || "U" }}
                </a-avatar>
                <div class="min-w-0">
                  <div
                    class="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm truncate"
                  >
                    {{ item.name || "Người dùng" }}
                  </div>
                  <div class="text-[11px] text-slate-400 truncate">
                    {{ maskEmail(item.email) }}
                  </div>
                </div>
              </div>

              <!-- Status Tag -->
              <a-tag
                v-if="item.is_active"
                color="success"
                class="rounded-full px-2 py-0.5 font-semibold text-[10px] border-0 shrink-0"
              >
                Còn {{ item.days_remaining }} ngày
              </a-tag>
              <a-tag
                v-else
                color="default"
                class="rounded-full px-2 py-0.5 font-medium text-[10px] shrink-0"
              >
                Hết hạn
              </a-tag>
            </div>

            <!-- Card Footer: Registered Date & Completed Orders -->
            <div
              class="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[11px]"
            >
              <span class="text-slate-500 dark:text-slate-400">
                Ngày ĐK:
                <strong class="text-slate-700 dark:text-slate-200">{{
                  formatDate(item.registered_at)
                }}</strong>
              </span>
              <span class="text-slate-500 dark:text-slate-400">
                Đơn hàng:
                <strong
                  class="text-orange-600 dark:text-orange-400 font-bold"
                  >{{ item.completed_orders_count }}</strong
                >
              </span>
            </div>
          </div>

          <!-- Mobile Pagination -->
          <div class="flex justify-center pt-2">
            <a-pagination
              v-model:current="pagination.current"
              :total="pagination.total"
              :page-size="pagination.pageSize"
              size="small"
              @change="handleTableChange"
            />
          </div>
        </template>
        <div v-else class="py-8">
          <a-empty description="Chưa có người dùng nào được giới thiệu" />
        </div>
      </div>

      <!-- Desktop Table View (Hidden on Mobile) -->
      <div class="hidden md:block">
        <a-table
          :columns="columns"
          :data-source="referrals"
          :loading="loading"
          :pagination="pagination"
          @change="handleTableChange"
          row-key="id"
          class="custom-table"
        >
          <!-- Custom Empty Text Slot -->
          <template #emptyText>
            <div class="py-8">
              <a-empty description="Chưa có người dùng nào được giới thiệu" />
            </div>
          </template>

          <!-- Table Body Cells -->
          <template #bodyCell="{ column, record, index }">
            <!-- STT Slot -->
            <template v-if="column.key === 'stt'">
              <span class="font-mono text-xs font-semibold text-slate-400">
                {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
              </span>
            </template>

            <!-- User Info Slot -->
            <template v-else-if="column.key === 'user'">
              <div class="flex items-center gap-3 py-1">
                <a-avatar
                  :src="record.image"
                  :size="40"
                  class="bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold uppercase shrink-0 shadow-xs"
                >
                  {{ record.name?.charAt(0) || "U" }}
                </a-avatar>
                <div class="overflow-hidden">
                  <div
                    class="font-bold text-slate-800 dark:text-slate-100 text-sm truncate"
                  >
                    {{ record.name || "Người dùng" }}
                  </div>
                  <div class="text-xs text-slate-400 truncate">
                    {{ maskEmail(record.email) }}
                  </div>
                </div>
              </div>
            </template>

            <!-- Registered Date Slot -->
            <template v-else-if="column.key === 'registered_at'">
              <div
                class="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300"
              >
                <CalendarOutlined class="text-slate-400 text-xs" />
                <span>{{ formatDate(record.registered_at) }}</span>
              </div>
            </template>

            <!-- Status / Expiration Slot -->
            <template v-else-if="column.key === 'status'">
              <span
                v-if="record.is_active"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                ></span>
                Còn {{ record.days_remaining }} ngày
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                Đã hết hạn
              </span>
            </template>

            <!-- Completed Orders Slot -->
            <template v-else-if="column.key === 'completed_orders'">
              <div class="flex items-center justify-end gap-1.5">
                <span
                  class="inline-flex items-center gap-1 font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 border border-orange-200/60 dark:border-orange-900/50 px-2.5 py-1 rounded-lg text-xs"
                >
                  <ShoppingCartOutlined />
                  {{ record.completed_orders_count }} đơn
                </span>
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import axios from "@/api/axios";
import { message } from "ant-design-vue";
import {
  GiftOutlined,
  CopyOutlined,
  ShareAltOutlined,
  UsergroupAddOutlined,
  DollarOutlined,
  PercentageOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons-vue";

const summary = ref({
  referral_code: "",
  total_referred: 0,
  active_referred: 0,
  total_commission: 0,
  commission_rate: 5,
  valid_days: 365,
});

const referrals = ref<any[]>([]);
const loading = ref(false);
const copiedCode = ref(false);
const copiedLink = ref(false);

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: false,
});

const columns = [
  {
    title: "STT",
    key: "stt",
    width: 70,
    align: "center",
  },
  {
    title: "Thành viên",
    key: "user",
    dataIndex: "name",
  },
  {
    title: "Ngày đăng ký",
    key: "registered_at",
    dataIndex: "registered_at",
    width: 160,
  },
  {
    title: "Thời hạn",
    key: "status",
    dataIndex: "is_active",
    width: 170,
  },
  {
    title: "Đơn hoàn thành",
    key: "completed_orders",
    dataIndex: "completed_orders_count",
    width: 170,
    align: "right",
  },
];

const referralLink = computed(() => {
  if (!summary.value.referral_code) return "";
  const origin = window.location.origin;
  return `${origin}/?ref=${summary.value.referral_code}`;
});

const fetchSummary = async () => {
  try {
    const res = await axios.get("/referral/summary");
    if (res.data?.data) {
      summary.value = res.data.data;
    }
  } catch (err) {
    console.error("Fetch referral summary error:", err);
  }
};

const fetchReferrals = async (page = 1) => {
  loading.value = true;
  try {
    const res = await axios.get("/referral/list", {
      params: {
        page,
        limit: pagination.value.pageSize,
      },
    });
    const resData = res.data?.data;
    if (resData) {
      referrals.value = resData.data || [];
      pagination.value.current = resData.current_page || 1;
      pagination.value.total = resData.total || 0;
    }
  } catch (err) {
    console.error("Fetch referrals list error:", err);
  } finally {
    loading.value = false;
  }
};

const fetchData = () => {
  fetchSummary();
  fetchReferrals(pagination.value.current);
};

onMounted(() => {
  fetchData();
});

const handleTableChange = (pag: any) => {
  const page = typeof pag === "number" ? pag : pag.current;
  fetchReferrals(page);
};

const copyReferralCode = () => {
  if (!summary.value.referral_code) return;
  navigator.clipboard.writeText(summary.value.referral_code);
  copiedCode.value = true;
  message.success("Đã sao chép mã giới thiệu!");
  setTimeout(() => {
    copiedCode.value = false;
  }, 2500);
};

const copyReferralLink = () => {
  if (!referralLink.value) return;
  navigator.clipboard.writeText(referralLink.value);
  copiedLink.value = true;
  message.success("Đã sao chép liên kết giới thiệu!");
  setTimeout(() => {
    copiedLink.value = false;
  }, 2500);
};

const formatMoney = (val: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val || 0);
};

const formatNumber = (val: number) => {
  return new Intl.NumberFormat("vi-VN").format(val || 0);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const maskEmail = (email: string) => {
  if (!email) return "***";
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const maskedName =
    name.length > 3 ? name.substring(0, 3) + "***" : name + "***";
  return `${maskedName}@${domain}`;
};
</script>

<style scoped>
:deep(.ant-table) {
  background: transparent !important;
}

html.dark :deep(.ant-table-thead > tr > th) {
  background: #0f172a !important;
  color: #94a3b8 !important;
  border-bottom-color: #1e293b !important;
}

html.dark :deep(.ant-table-tbody > tr > td) {
  border-bottom-color: #1e293b !important;
}

html.dark :deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(30, 41, 59, 0.5) !important;
}
</style>
