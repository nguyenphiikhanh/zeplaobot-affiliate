<template>
  <div class="leaderboard-section">
    <div class="leaderboard-card">
      <!-- Header -->
      <div class="leaderboard-header">
        <div>
          <h2 class="leaderboard-title">🏆 Bảng Xếp Hạng</h2>
        </div>

        <!-- Tab switcher -->
        <div class="leaderboard-tabs">
          <button
            id="tab-alltime"
            @click="activeTab = 'allTime'"
            class="leaderboard-tab"
            :class="activeTab === 'allTime' ? 'leaderboard-tab--active' : ''"
          >
            Tất Cả
          </button>
          <button
            id="tab-monthly"
            @click="activeTab = 'monthly'"
            class="leaderboard-tab"
            :class="activeTab === 'monthly' ? 'leaderboard-tab--active' : ''"
          >
            Tháng Này
          </button>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isLoading" class="leaderboard-skeleton">
        <div v-for="i in 5" :key="i" class="skeleton-row">
          <div class="skeleton-block skeleton-rank"></div>
          <div class="skeleton-block skeleton-name"></div>
          <div class="skeleton-block skeleton-amount"></div>
        </div>
      </div>

      <!-- Leaderboard List -->
      <div v-else-if="currentLeaderboard.length > 0" class="leaderboard-list">
        <div
          v-for="(entry, idx) in currentLeaderboard"
          :key="entry.userId"
          class="leaderboard-row"
          :class="{
            'leaderboard-row--gold': idx === 0,
            'leaderboard-row--silver': idx === 1,
            'leaderboard-row--bronze': idx === 2,
            'leaderboard-row--normal': idx > 2,
          }"
        >
          <!-- Top Badge Ribbons -->
          <div v-if="idx === 0" class="leaderboard-ribbon leaderboard-ribbon--gold">
            👑
            {{ activeTab === "monthly" ? "Chiến Thần Chốt Đơn" : "Huyền Thoại Tích Lũy" }}
          </div>
          <div v-else-if="idx === 1" class="leaderboard-ribbon leaderboard-ribbon--silver">
            🥈
            {{ activeTab === "monthly" ? "Bậc Thầy Săn Deal" : "Triệu Phú Saffi" }}
          </div>
          <div v-else-if="idx === 2" class="leaderboard-ribbon leaderboard-ribbon--bronze">
            🥉
            {{ activeTab === "monthly" ? "Tay Đua Hoàn Tiền" : "Chuyên Gia Tiết Kiệm" }}
          </div>

          <div class="leaderboard-row-left" :class="{ 'leaderboard-row-left--ribbon': idx <= 2 }">
            <!-- Rank Number -->
            <div class="leaderboard-rank-num">
              <template v-if="idx === 0">
                <div class="rank-num rank-num--gold">
                  <span class="rank-sparkle">✨</span>
                  <span class="rank-num-text rank-num-text--gold">#1</span>
                  <span class="rank-sparkle rank-sparkle--flip">✨</span>
                </div>
              </template>
              <template v-else-if="idx === 1">
                <div class="rank-num rank-num--silver">
                  <span class="rank-leaf">🌿</span>
                  <span class="rank-num-text rank-num-text--silver">#2</span>
                  <span class="rank-leaf rank-leaf--flip">🌿</span>
                </div>
              </template>
              <template v-else-if="idx === 2">
                <div class="rank-num rank-num--bronze">
                  <span class="rank-leaf">🌿</span>
                  <span class="rank-num-text rank-num-text--bronze">#3</span>
                  <span class="rank-leaf rank-leaf--flip">🌿</span>
                </div>
              </template>
              <template v-else>
                <span class="rank-num-plain">#{{ idx + 1 }}</span>
              </template>
            </div>

            <!-- Avatar & Info -->
            <div class="leaderboard-user-info">
              <h3 class="leaderboard-user-name">{{ entry.name }}</h3>
              <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px">
                <span class="leaderboard-user-orders">{{ entry.totalOrders }} đơn hoàn thành</span>
              </div>
            </div>
          </div>

          <!-- Commission -->
          <div class="leaderboard-commission">
            <div class="leaderboard-check-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div class="leaderboard-commission-amount">
              {{ formatMoney(entry.totalCommission) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="leaderboard-empty">
        <div class="leaderboard-empty-icon">🏃</div>
        Chưa có dữ liệu thống kê cho bảng xếp hạng này.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "@/api/axios";

const activeTab = ref("allTime");
const leaderboardData = ref({ allTime: [], monthly: [] });
const isLoading = ref(true);
const currentLeaderboard = computed(() =>
  activeTab.value === "monthly"
    ? leaderboardData.value.monthly
    : leaderboardData.value.allTime
);

const fetchLeaderboard = async () => {
  try {
    const res = await axios.get("/stat/leaderboard");
    if (res.data?.data) {
      leaderboardData.value = res.data.data;
    } else if (res.data) {
      leaderboardData.value = res.data;
    }
  } catch (err) {
    console.error("Failed to fetch leaderboard", err);
  } finally {
    isLoading.value = false;
  }
};

const formatMoney = (val) => {
  if (!val && val !== 0) return "0đ";
  return Math.round(Number(val)).toLocaleString("vi-VN") + "đ";
};

onMounted(fetchLeaderboard);
</script>

<style scoped>
/* Leaderboard */
.leaderboard-section {
  width: 100%;
  margin-bottom: 3rem;
}

.leaderboard-card {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 1.25rem;
  padding: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

@media (min-width: 768px) {
  .leaderboard-card { padding: 1.25rem; }
}

.leaderboard-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

@media (min-width: 640px) {
  .leaderboard-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.leaderboard-title {
  font-size: 16px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.025em;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

@media (min-width: 768px) {
  .leaderboard-title { font-size: 18px; }
}

.leaderboard-tabs {
  display: flex;
  align-items: center;
  background: #f1f5f9;
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: 9999px;
  padding: 3px;
  flex-shrink: 0;
}

.leaderboard-tab {
  padding: 4px 14px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  background: none;
  color: #64748b;
  transition: all 0.2s ease;
}

.leaderboard-tab--active {
  background: #ee4d2d;
  color: white;
  box-shadow: 0 2px 6px rgba(238, 77, 45, 0.3);
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.leaderboard-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.leaderboard-row--gold {
  border: 1px solid rgba(125, 211, 252, 0.4);
  background: linear-gradient(to right, rgba(224, 242, 254, 0.6), rgba(224, 242, 254, 0.1), transparent);
  box-shadow: 0 2px 10px rgba(125, 211, 252, 0.12);
  border-radius: 0.85rem;
  padding: 0.65rem 0.85rem;
}
.leaderboard-row--gold:hover { box-shadow: 0 4px 16px rgba(125, 211, 252, 0.18); transform: translateY(-1px); }

.leaderboard-row--silver {
  border: 1px solid rgba(245, 158, 11, 0.4);
  background: linear-gradient(to right, rgba(254, 243, 199, 0.5), rgba(254, 243, 199, 0.1), transparent);
  box-shadow: 0 2px 10px rgba(245, 158, 11, 0.06);
  border-radius: 0.85rem;
  padding: 0.65rem 0.85rem;
}
.leaderboard-row--silver:hover { box-shadow: 0 4px 14px rgba(245, 158, 11, 0.12); transform: translateY(-1px); }

.leaderboard-row--bronze {
  border: 1px solid rgba(251, 146, 60, 0.3);
  background: linear-gradient(to right, rgba(255, 237, 213, 0.3), rgba(255, 237, 213, 0.05), transparent);
  border-radius: 0.85rem;
  padding: 0.65rem 0.85rem;
}
.leaderboard-row--bronze:hover { box-shadow: 0 3px 10px rgba(251, 146, 60, 0.08); transform: translateY(-1px); }

.leaderboard-row--normal {
  border-bottom: 1px solid #f1f5f9;
  padding: 0.5rem 0.75rem;
  border-radius: 0.6rem;
  transition: background 0.2s ease;
}
.leaderboard-row--normal:last-child { border-bottom: none; }
.leaderboard-row--normal:hover { background: rgba(248, 250, 252, 0.6); }

/* Ribbon */
.leaderboard-ribbon {
  position: absolute;
  top: 0;
  left: 0;
  padding: 1px 8px;
  border-bottom-right-radius: 6px;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 3px;
}
.leaderboard-ribbon--gold { background: linear-gradient(to right, #38bdf8, #bae6fd); color: #082f49; }
.leaderboard-ribbon--silver { background: linear-gradient(to right, #f59e0b, #eab308); color: #1e293b; }
.leaderboard-ribbon--bronze { background: linear-gradient(to right, #f97316, rgba(251, 146, 60, 0.8)); color: white; }

.leaderboard-row-left { display: flex; align-items: center; gap: 6px; }
@media (min-width: 768px) { .leaderboard-row-left { gap: 0.75rem; } }
.leaderboard-row-left--ribbon { margin-top: 6px; }
@media (min-width: 640px) { .leaderboard-row-left--ribbon { margin-top: 0; } }

.leaderboard-rank-num {
  width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 800;
}
@media (min-width: 768px) { .leaderboard-rank-num { width: 54px; } }

.rank-num { display: flex; align-items: center; gap: 2px; }
.rank-num-text { font-weight: 800; }
.rank-num-text--gold {
  font-size: 22px;
  color: transparent;
  background: linear-gradient(to bottom, #7dd3fc, #0284c7);
  -webkit-background-clip: text;
  background-clip: text;
}
.rank-num-text--silver {
  font-size: 18px;
  color: transparent;
  background: linear-gradient(to bottom, #fbbf24, #d97706);
  -webkit-background-clip: text;
  background-clip: text;
}
.rank-num-text--bronze {
  font-size: 18px;
  color: transparent;
  background: linear-gradient(to bottom, #f97316, #ea580c);
  -webkit-background-clip: text;
  background-clip: text;
}
.rank-sparkle { font-size: 11px; opacity: 0.8; animation: pulse-glow 1.5s infinite; }
.rank-sparkle--flip { transform: scaleX(-1); }
.rank-leaf { font-size: 11px; opacity: 0.6; }
.rank-leaf--flip { transform: scaleX(-1); }
.rank-num-plain { font-size: 14px; color: #94a3b8; font-weight: 700; }
@media (min-width: 768px) { .rank-num-plain { font-size: 15px; } }

@keyframes pulse-glow {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.4; }
}

@media (prefers-reduced-motion: reduce) {
  .rank-sparkle { animation: none; }
  .leaderboard-row { transition: none; }
}

.leaderboard-user-name { font-weight: 700; color: #1e293b; font-size: 13px; margin: 0; }
@media (min-width: 768px) { .leaderboard-user-name { font-size: 14px; } }

.leaderboard-user-orders {
  font-size: 10px;
  font-weight: 600;
  color: #059669;
  background: rgba(5, 150, 105, 0.07);
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid rgba(5, 150, 105, 0.1);
}
@media (min-width: 768px) { .leaderboard-user-orders { font-size: 11px; } }

.leaderboard-commission {
  display: flex;
  flex-direction: flex-row;
  align-items: center;
  gap: 6px;
  padding-right: 4px;
}
@media (min-width: 768px) { .leaderboard-commission { padding-right: 0.5rem; } }

.leaderboard-check-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}
@media (min-width: 768px) { .leaderboard-check-icon { width: 26px; height: 26px; } }

.leaderboard-commission-amount { font-weight: 800; color: #334155; font-size: 13px; }
@media (min-width: 768px) { .leaderboard-commission-amount { font-size: 14px; } }

.leaderboard-empty {
  text-align: center;
  padding: 2.5rem;
  color: #64748b;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 1.25rem;
  border: 2px dashed #e2e8f0;
}
.leaderboard-empty-icon { font-size: 30px; opacity: 0.5; margin-bottom: 8px; }

/* Show more button */
.leaderboard-show-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  border: 1px dashed #e2e8f0;
  border-radius: 0.75rem;
  background: none;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.leaderboard-show-more:hover { background: #f8fafc; color: #334155; }

/* Loading skeleton */
.leaderboard-skeleton { display: flex; flex-direction: column; gap: 0.75rem; }
.skeleton-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  background: #f8fafc;
}
.skeleton-block {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: 6px;
  height: 16px;
}
.skeleton-rank { width: 40px; flex-shrink: 0; }
.skeleton-name { flex: 1; }
.skeleton-amount { width: 80px; flex-shrink: 0; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .skeleton-block { animation: none; background: #f1f5f9; }
}
</style>

<style>
/* Dark Mode Overrides */
html.dark .leaderboard-card { background: #0B0F19 !important; border-color: #1E293B !important; box-shadow: none !important; }
html.dark .leaderboard-header { border-color: #1E293B !important; }
html.dark .leaderboard-title { color: #F8FAFC !important; }
html.dark .leaderboard-tabs { background: #0F172A !important; border-color: #1E293B !important; }
html.dark .leaderboard-tab { color: #94A3B8 !important; }
html.dark .leaderboard-tab--active { background: #ee4d2d !important; color: white !important; }
html.dark .leaderboard-row--gold {
  background: linear-gradient(to right, rgba(56, 189, 248, 0.12), transparent) !important;
  border-color: rgba(56, 189, 248, 0.3) !important;
}
html.dark .leaderboard-row--silver {
  background: linear-gradient(to right, rgba(251, 191, 36, 0.1), transparent) !important;
  border-color: rgba(251, 191, 36, 0.2) !important;
}
html.dark .leaderboard-row--bronze {
  background: linear-gradient(to right, rgba(249, 115, 22, 0.1), transparent) !important;
  border-color: rgba(249, 115, 22, 0.2) !important;
}
html.dark .leaderboard-row--normal { border-color: #1E293B !important; }
html.dark .leaderboard-row--normal:hover { background: rgba(30, 41, 59, 0.4) !important; }
html.dark .leaderboard-user-name { color: #F8FAFC !important; }
html.dark .leaderboard-commission-amount { color: #F8FAFC !important; }
html.dark .leaderboard-empty { background: rgba(15, 23, 42, 0.5) !important; border-color: #1E293B !important; color: #94A3B8 !important; }
html.dark .leaderboard-check-icon { background: #0B0F19 !important; border-color: rgba(16, 185, 129, 0.4) !important; }
html.dark .skeleton-row { background: #0F172A !important; }
html.dark .skeleton-block {
  background: linear-gradient(90deg, #0F172A 25%, #1E293B 50%, #0F172A 75%) !important;
  background-size: 200% 100% !important;
}
</style>
