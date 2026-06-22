<template>
  <div class="dashboard">
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-icon" style="background: #e0e7ff; color: #4f46e5;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ photoCount }}</span>
          <span class="stat-label">照片总数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #d1fae5; color: #059669;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ categoryCount }}</span>
          <span class="stat-label">分类数量</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #fef3c7; color: #d97706;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ uploadedCount }}</span>
          <span class="stat-label">本地上传</span>
        </div>
      </div>
    </div>

    <!-- 分类分布 -->
    <div class="dashboard-section">
      <h3 class="section-title">分类分布</h3>
      <div class="category-bars">
        <div v-for="cat in categoryStats" :key="cat.key" class="bar-item">
          <span class="bar-label">{{ cat.label }}</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: cat.percentage + '%' }"></div>
          </div>
          <span class="bar-count">{{ cat.count }} 张</span>
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="dashboard-section">
      <h3 class="section-title">快捷操作</h3>
      <div class="quick-actions">
        <router-link to="/admin/photos/new" class="action-btn primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          上传照片
        </router-link>
        <router-link to="/admin/photos" class="action-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          </svg>
          管理照片
        </router-link>
        <router-link to="/admin/categories" class="action-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          管理分类
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchPhotos } from '../../api/photos.js'
import { fetchCategories } from '../../api/categories.js'

const photos = ref([])
const categories = ref([])

const photoCount = computed(() => photos.value.length)
const categoryCount = computed(() => categories.value.length)
const uploadedCount = computed(() => photos.value.filter(p => p.url).length)

const categoryStats = computed(() => {
  const total = photos.value.length || 1
  return categories.value.map(cat => {
    const count = photos.value.filter(p => p.category === cat.key).length
    return {
      key: cat.key,
      label: cat.label,
      count,
      percentage: Math.round((count / total) * 100)
    }
  })
})

onMounted(async () => {
  try {
    const [photosData, catsData] = await Promise.all([
      fetchPhotos(),
      fetchCategories()
    ])
    photos.value = photosData
    categories.value = catsData
  } catch (e) {
    console.error('加载仪表盘数据失败:', e)
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 960px;
}

/* ===== 统计卡片 ===== */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #fff;
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.15rem;
}

/* ===== 区块 ===== */
.dashboard-section {
  background: #fff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 1rem;
}

/* ===== 分类分布条 ===== */
.category-bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bar-label {
  width: 70px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  flex-shrink: 0;
  text-align: right;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: #f0f0f5;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), #818cf8);
  border-radius: 4px;
  transition: width 0.6s ease;
}

.bar-count {
  font-size: 0.8rem;
  color: var(--text-secondary);
  width: 50px;
  flex-shrink: 0;
}

/* ===== 快捷操作 ===== */
.quick-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  color: var(--text);
  background: #f0f2f5;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}

.action-btn.primary {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.action-btn.primary:hover {
  background: var(--primary-dark);
}

@media (max-width: 640px) {
  .stat-cards {
    grid-template-columns: 1fr;
  }
  .bar-label {
    width: 55px;
    font-size: 0.8rem;
  }
}
</style>
