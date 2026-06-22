<template>
  <div id="gallery-app">
    <AppHeader />
    <FilterBar
      :categories="allCategories"
      :currentCategory="currentCategory"
      @filter="setCategory"
    />
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    <PhotoGrid
      v-else
      :photos="filteredPhotos"
      @photo-click="openLightbox"
    />
    <Lightbox />
    <BackToTop />
    <footer class="app-footer">
      <p>© 2026 DamDam Gallery · 用心记录每一刻 · <router-link to="/admin" class="admin-link">管理后台</router-link></p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import FilterBar from '../components/FilterBar.vue'
import PhotoGrid from '../components/PhotoGrid.vue'
import Lightbox from '../components/Lightbox.vue'
import BackToTop from '../components/BackToTop.vue'
import { usePhotos } from '../composables/usePhotos.js'
import { useLightbox } from '../composables/useLightbox.js'

const { currentCategory, filteredPhotos, allCategories, loading, setCategory, loadData, forceReload } = usePhotos()
const { open, handleKeydown } = useLightbox()

function openLightbox(photo) {
  const index = filteredPhotos.value.findIndex(p => p.id === photo.id)
  if (index >= 0) {
    open(filteredPhotos.value, index)
  }
}

onMounted(() => {
  // 每次进入前台页面时强制刷新数据，确保与后台操作同步
  forceReload()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style>
#gallery-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.app-footer {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
  border-top: 1px solid var(--border);
  margin-top: auto;
  background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.02));
  letter-spacing: 0.03em;
}

.app-footer p {
  opacity: 0.8;
}

.admin-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.admin-link:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .app-footer {
    padding: 2rem 1rem;
    font-size: 0.8rem;
  }
}
</style>
