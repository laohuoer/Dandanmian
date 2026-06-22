import { ref, computed } from 'vue'
import { fetchPhotos } from '../api/photos.js'
import { fetchCategories } from '../api/categories.js'

// 模块级共享状态
const currentCategory = ref('all')
const photos = ref([])
const categories = ref([])
const loading = ref(false)
const loaded = ref(false)

export function usePhotos() {
  const filteredPhotos = computed(() => {
    if (currentCategory.value === 'all') return photos.value
    return photos.value.filter(p => p.category === currentCategory.value)
  })

  // 包含"全部"的分类列表
  const allCategories = computed(() => {
    return [
      { key: 'all', label: '全部' },
      ...categories.value
    ]
  })

  function setCategory(key) {
    currentCategory.value = key
  }
  async function loadData() {
    if (loaded.value) return
    loading.value = true
    try {
      const [photosData, catsData] = await Promise.all([
        fetchPhotos(),
        fetchCategories()
      ])
      photos.value = photosData
      categories.value = catsData
      loaded.value = true
    } catch (e) {
      console.error('加载相册数据失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function refreshPhotos() {
    try {
      photos.value = await fetchPhotos()
    } catch (e) {
      console.error('刷新照片数据失败:', e)
    }
  }

  async function refreshCategories() {
    try {
      categories.value = await fetchCategories()
    } catch (e) {
      console.error('刷新分类数据失败:', e)
    }
  }

  /**
   * 强制重新加载所有数据（重置 loaded 标记后重新请求）
   */
  async function forceReload() {
    loaded.value = false
    await loadData()
  }

  return {
    currentCategory,
    photos,
    categories,
    allCategories,
    filteredPhotos,
    loading,
    loaded,
    setCategory,
    loadData,
    refreshPhotos,
    refreshCategories,
    forceReload
  }
}
