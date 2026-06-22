<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="admin-sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <h2 class="sidebar-logo">DamDam</h2>
        <span class="sidebar-badge">管理后台</span>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/admin/dashboard" class="nav-item" @click="sidebarOpen = false">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
          </svg>
          <span>仪表盘</span>
        </router-link>
        <router-link to="/admin/photos" class="nav-item" @click="sidebarOpen = false">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span>照片管理</span>
        </router-link>
        <router-link to="/admin/categories" class="nav-item" @click="sidebarOpen = false">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>分类管理</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <router-link to="/" class="back-to-gallery">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>回到相册</span>
        </router-link>
      </div>
    </aside>

    <!-- 遮罩层（移动端） -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>

    <!-- 主内容区 -->
    <div class="admin-main">
      <!-- 顶栏 -->
      <header class="admin-topbar">
        <button class="menu-toggle" @click="sidebarOpen = !sidebarOpen" aria-label="菜单">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 class="topbar-title">{{ pageTitle }}</h1>
      </header>

      <!-- 页面内容 -->
      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const sidebarOpen = ref(false)

const pageTitles = {
  AdminDashboard: '仪表盘',
  PhotoManager: '照片管理',
  PhotoNew: '新增照片',
  PhotoEdit: '编辑照片',
  CategoryManager: '分类管理'
}

const pageTitle = computed(() => pageTitles[route.name] || '管理后台')
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f0f2f5;
}

/* ===== 侧边栏 ===== */
.admin-sidebar {
  width: 240px;
  background: linear-gradient(180deg, #1e1e2d 0%, #2a2a3d 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 200;
  transition: transform 0.3s ease;
}

.sidebar-header {
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sidebar-logo {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.sidebar-badge {
  font-size: 0.7rem;
  background: var(--primary);
  padding: 0.15rem 0.5rem;
  border-radius: 1rem;
  font-weight: 500;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: rgba(255,255,255,0.65);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item:hover {
  color: #fff;
  background: rgba(255,255,255,0.08);
}

.nav-item.router-link-active {
  color: #fff;
  background: var(--primary);
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.4);
}

.sidebar-footer {
  padding: 1rem 0.75rem;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.back-to-gallery {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: rgba(255,255,255,0.5);
  text-decoration: none;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.back-to-gallery:hover {
  color: #fff;
  background: rgba(255,255,255,0.08);
}

/* ===== 遮罩 ===== */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 199;
}

/* ===== 主内容区 ===== */
.admin-main {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.admin-topbar {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text);
  padding: 0.25rem;
  margin-right: 0.75rem;
}

.topbar-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.admin-content {
  flex: 1;
  padding: 1.5rem;
}

/* ===== 移动端适配 ===== */
@media (max-width: 768px) {
  .admin-sidebar {
    transform: translateX(-100%);
  }

  .admin-sidebar.open {
    transform: translateX(0);
  }

  .admin-main {
    margin-left: 0;
  }

  .menu-toggle {
    display: flex;
    align-items: center;
  }

  .admin-content {
    padding: 1rem;
  }
}
</style>
