<template>
  <div class="photo-manager">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <router-link to="/admin/photos/new" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          新增照片
        </router-link>
        <button class="btn btn-batch-upload" @click="showBatchUpload = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 16 12 12 8 16"></polyline>
            <line x1="12" y1="12" x2="12" y2="21"></line>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
            <polyline points="16 16 12 12 8 16"></polyline>
          </svg>
          批量上传
        </button>
        <button
          v-if="!batchMode"
          class="btn"
          @click="enterBatchMode"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          批量操作
        </button>
        <template v-if="batchMode">
          <button class="btn" @click="selectAll">
            {{ isAllSelected ? '取消全选' : '全选' }}
          </button>
          <button class="btn btn-danger" :disabled="selectedIds.length === 0" @click="confirmBatchDelete">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            删除选中 ({{ selectedIds.length }})
          </button>
          <button class="btn" @click="exitBatchMode">取消</button>
        </template>
      </div>
      <div class="toolbar-right">
        <select v-model="filterCategory" class="filter-select">
          <option value="">全部分类</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.key">{{ cat.label }}</option>
        </select>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索标题..."
          class="search-input"
        />
      </div>
    </div>

    <!-- 照片表格 -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th v-if="batchMode" class="col-check">
              <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="checkbox" />
            </th>
            <th class="col-preview">预览</th>
            <th class="col-title">标题</th>
            <th class="col-category">分类</th>
            <th class="col-size">尺寸</th>
            <th class="col-source">来源</th>
            <th v-if="!batchMode" class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="photo in filteredPhotos" :key="photo.id" :class="{ selected: isSelected(photo.id) }">
            <td v-if="batchMode" class="col-check">
              <input type="checkbox" :checked="isSelected(photo.id)" @change="toggleSelect(photo.id)" class="checkbox" />
            </td>
            <td class="col-preview">
              <div class="thumb-wrapper">
                <img :src="getThumbUrl(photo)" :alt="photo.title" class="thumb-img" />
              </div>
            </td>
            <td class="col-title">{{ photo.title }}</td>
            <td class="col-category">
              <span class="category-tag">{{ getCategoryLabel(photo.category) }}</span>
            </td>
            <td class="col-size">{{ photo.width }}×{{ photo.height }}</td>
            <td class="col-source">
              <span :class="['source-badge', photo.url ? 'local' : 'online']">
                {{ photo.url ? '本地上传' : '在线图片' }}
              </span>
            </td>
            <td v-if="!batchMode" class="col-actions">
              <div class="action-group">
                <router-link :to="`/admin/photos/${photo.id}/edit`" class="btn-icon" title="编辑">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </router-link>
                <button class="btn-icon danger" @click="confirmDelete(photo)" title="删除">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!filteredPhotos.length">
            <td :colspan="batchMode ? 7 : 6" class="empty-row">暂无照片数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 单条删除确认弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
          <div class="modal-box">
            <h3 class="modal-title">确认删除</h3>
            <p class="modal-text">确定要删除照片「{{ deleteTarget.title }}」吗？此操作不可撤销。</p>
            <div class="modal-actions">
              <button class="btn" @click="deleteTarget = null">取消</button>
              <button class="btn btn-danger" @click="handleDelete">确认删除</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 批量删除确认弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showBatchDeleteConfirm" class="modal-overlay" @click.self="showBatchDeleteConfirm = false">
          <div class="modal-box">
            <h3 class="modal-title">确认批量删除</h3>
            <p class="modal-text">确定要删除选中的 <strong>{{ selectedIds.length }}</strong> 张照片吗？此操作不可撤销。</p>
            <div class="modal-actions">
              <button class="btn" @click="showBatchDeleteConfirm = false">取消</button>
              <button class="btn btn-danger" @click="handleBatchDelete" :disabled="batchDeleting">
                {{ batchDeleting ? '删除中...' : '确认删除' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 批量上传弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showBatchUpload" class="modal-overlay" @click.self="closeBatchUpload">
          <div class="modal-box modal-box-lg">
            <h3 class="modal-title">批量上传照片</h3>

            <div class="batch-upload-area" @click="triggerBatchUpload" @dragover.prevent @drop.prevent="handleBatchDrop">
              <div v-if="batchFiles.length === 0" class="upload-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <polyline points="16 16 12 12 8 16"></polyline>
                  <line x1="12" y1="12" x2="12" y2="21"></line>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
                </svg>
                <p>点击或拖拽上传多张图片</p>
                <span>支持 JPG / PNG / GIF / WebP，单张最大 10MB，最多 20 张，大图将自动压缩</span>
              </div>
              <div v-else class="file-list">
                <div v-for="(file, idx) in batchFiles" :key="idx" class="file-item">
                  <img v-if="batchPreviews[idx]" :src="batchPreviews[idx]" class="file-thumb" />
                  <span class="file-name">{{ file.name }}</span>
                  <button class="file-remove" @click.stop="removeBatchFile(idx)">✕</button>
                </div>
                <div class="file-item file-add" @click.stop="triggerBatchUpload">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
              </div>
            </div>
            <input ref="batchFileInput" type="file" accept="image/*" multiple class="hidden-input" @change="handleBatchFileChange" />

            <div class="batch-options">
              <div class="form-group">
                <label class="form-label">分类 <span class="required">*</span></label>
                <select v-model="batchCategory" class="form-input">
                  <option value="">请选择分类</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.key">{{ cat.label }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">标题前缀（可选）</label>
                <input v-model="batchTitlePrefix" type="text" class="form-input" placeholder="留空则使用文件名" />
              </div>
            </div>

            <div class="modal-actions">
              <button class="btn" @click="closeBatchUpload">取消</button>
              <button
                class="btn btn-primary"
                :disabled="batchFiles.length === 0 || !batchCategory || batchUploading"
                @click="handleBatchUpload"
              >
                {{ batchUploading ? '压缩并上传中...' : `压缩并上传 ${batchFiles.length} 张照片` }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchPhotos, deletePhoto, batchDeletePhotos } from '../../api/photos.js'
import { fetchCategories } from '../../api/categories.js'
import { batchUploadImages } from '../../api/upload.js'
import { usePhotos } from '../../composables/usePhotos.js'

// 使用 usePhotos 的 refreshPhotos 同步前台共享状态
const { refreshPhotos: syncGalleryPhotos } = usePhotos()

const photos = ref([])
const categories = ref([])
const searchQuery = ref('')
const filterCategory = ref('')
const deleteTarget = ref(null)

// 批量操作状态
const batchMode = ref(false)
const selectedIds = ref([])

// 批量删除状态
const showBatchDeleteConfirm = ref(false)
const batchDeleting = ref(false)

// 批量上传状态
const showBatchUpload = ref(false)
const batchFiles = ref([])
const batchPreviews = ref([])
const batchCategory = ref('')
const batchTitlePrefix = ref('')
const batchUploading = ref(false)
const batchFileInput = ref(null)

const filteredPhotos = computed(() => {
  let result = photos.value
  if (filterCategory.value) {
    result = result.filter(p => p.category === filterCategory.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => p.title.toLowerCase().includes(q))
  }
  return result
})

const isAllSelected = computed(() => {
  return filteredPhotos.value.length > 0 && filteredPhotos.value.every(p => selectedIds.value.includes(p.id))
})

function getCategoryLabel(key) {
  const cat = categories.value.find(c => c.key === key)
  return cat ? cat.label : key
}

function getThumbUrl(photo) {
  if (photo.url) return photo.url
  return `https://picsum.photos/seed/${photo.seed}/${Math.round(photo.width / 4)}/${Math.round(photo.height / 4)}`
}

// ===== 单条删除 =====
function confirmDelete(photo) {
  deleteTarget.value = photo
}
async function handleDelete() {
  if (!deleteTarget.value) return
  try {
    await deletePhoto(deleteTarget.value.id)
    photos.value = photos.value.filter(p => p.id !== deleteTarget.value.id)
    deleteTarget.value = null
    // 同步前台共享状态
    syncGalleryPhotos()
  } catch (e) {
    alert('删除失败: ' + e.message)
  }
}

// ===== 批量选择 =====
function enterBatchMode() {
  batchMode.value = true
  selectedIds.value = []
}

function exitBatchMode() {
  batchMode.value = false
  selectedIds.value = []
}

function isSelected(id) {
  return selectedIds.value.includes(id)
}

function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) {
    selectedIds.value.splice(idx, 1)
  } else {
    selectedIds.value.push(id)
  }
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredPhotos.value.map(p => p.id)
  }
}

function selectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredPhotos.value.map(p => p.id)
  }
}

// ===== 批量删除 =====
function confirmBatchDelete() {
  if (selectedIds.value.length === 0) return
  showBatchDeleteConfirm.value = true
}
async function handleBatchDelete() {
  batchDeleting.value = true
  try {
    await batchDeletePhotos(selectedIds.value)
    photos.value = photos.value.filter(p => !selectedIds.value.includes(p.id))
    selectedIds.value = []
    showBatchDeleteConfirm.value = false
    exitBatchMode()
    // 同步前台共享状态
    syncGalleryPhotos()
  } catch (e) {
    alert('批量删除失败: ' + e.message)
  } finally {
    batchDeleting.value = false
  }
}

// ===== 批量上传 =====
function triggerBatchUpload() {
  batchFileInput.value.click()
}

function handleBatchFileChange(e) {
  const files = Array.from(e.target.files || [])
  addBatchFiles(files)
  // 重置 input 以便再次选择相同文件
  if (batchFileInput.value) batchFileInput.value.value = ''
}

function handleBatchDrop(e) {
  const files = Array.from(e.dataTransfer.files || [])
  addBatchFiles(files)
}

function addBatchFiles(files) {
  const imageFiles = files.filter(f => f.type.startsWith('image/'))
  const remaining = 20 - batchFiles.value.length
  const toAdd = imageFiles.slice(0, remaining)

  for (const file of toAdd) {
    batchFiles.value.push(file)
    batchPreviews.value.push(URL.createObjectURL(file))
  }
}

function removeBatchFile(idx) {
  URL.revokeObjectURL(batchPreviews.value[idx])
  batchFiles.value.splice(idx, 1)
  batchPreviews.value.splice(idx, 1)
}

function closeBatchUpload() {
  batchPreviews.value.forEach(url => URL.revokeObjectURL(url))
  batchFiles.value = []
  batchPreviews.value = []
  batchCategory.value = ''
  batchTitlePrefix.value = ''
  showBatchUpload.value = false
}

async function handleBatchUpload() {
  if (batchFiles.value.length === 0 || !batchCategory.value) return

  batchUploading.value = true
  try {
    const result = await batchUploadImages(batchFiles.value, {
      category: batchCategory.value,
      title: batchTitlePrefix.value || undefined
    })
    // 将新创建的照片添加到列表
    if (result.photos) {
      photos.value.push(...result.photos)
    }
    closeBatchUpload()
    // 同步前台共享状态
    syncGalleryPhotos()
  } catch (e) {
    alert('批量上传失败: ' + e.message)
  } finally {
    batchUploading.value = false
  }
}

onMounted(async () => {
  try {
    const [photosData, catsData] = await Promise.all([
      fetchPhotos(),
      fetchCategories()
    ])
    photos.value = photosData
    categories.value = catsData
  } catch (e) {
    console.error('加载数据失败:', e)
  }
})
</script>

<style scoped>
.photo-manager {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  overflow: hidden;
}

/* ===== 工具栏 ===== */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  gap: 1rem;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.toolbar-right {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.filter-select,
.search-input {
  padding: 0.45rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  font-family: inherit;
  background: #fff;
  color: var(--text);
  outline: none;
  transition: border-color 0.2s;
}

.filter-select:focus,
.search-input:focus {
  border-color: var(--primary);
}

.search-input {
  width: 180px;
}

/* ===== 按钮 ===== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid #d1d5db;
  background: #fff;
  color: var(--text);
  text-decoration: none;
  transition: all 0.2s;
}

.btn:hover {
  background: #f9fafb;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-batch-upload {
  background: #059669;
  color: #fff;
  border-color: #059669;
}

.btn-batch-upload:hover {
  background: #047857;
}

.btn-danger {
  background: #ef4444;
  color: #fff;
  border-color: #ef4444;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 0.375rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f0f2f5;
  color: var(--text);
}

.btn-icon.danger:hover {
  background: #fef2f2;
  color: #ef4444;
}

/* ===== 复选框 ===== */
.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary);
}

.col-check {
  width: 40px;
  text-align: center;
}

.data-table tr.selected td {
  background: #eef2ff;
}

/* ===== 表格 ===== */
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.data-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.data-table td {
  padding: 0.65rem 1rem;
  border-bottom: 1px solid #f0f2f5;
  vertical-align: middle;
}

.data-table tr:hover td {
  background: #fafbfc;
}

.data-table tr.selected:hover td {
  background: #e0e7ff;
}

.col-preview { width: 60px; }
.col-title { min-width: 120px; }
.col-category { width: 100px; }
.col-size { width: 100px; }
.col-source { width: 90px; }
.col-actions { width: 80px; }

.thumb-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 0.375rem;
  overflow: hidden;
  background: #f0f2f5;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-tag {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  background: #e0e7ff;
  color: var(--primary);
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.source-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.7rem;
  font-weight: 500;
}

.source-badge.local {
  background: #d1fae5;
  color: #059669;
}

.source-badge.online {
  background: #e0e7ff;
  color: #4f46e5;
}

.action-group {
  display: flex;
  gap: 0.25rem;
}

.empty-row {
  text-align: center;
  padding: 3rem 1rem !important;
  color: var(--text-secondary);
}

/* ===== 弹窗 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-box {
  background: #fff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}

.modal-box-lg {
  max-width: 600px;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
}

.modal-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 1.25rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* ===== 批量上传 ===== */
.batch-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1rem;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.batch-upload-area:hover {
  border-color: var(--primary);
  background: #fafbff;
}

.upload-placeholder {
  color: var(--text-secondary);
}

.upload-placeholder p {
  margin: 0.75rem 0 0.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text);
}

.upload-placeholder span {
  font-size: 0.75rem;
}

.file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  width: 100%;
  justify-content: center;
}

.file-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-name {
  display: none;
}

.file-remove {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-item:hover .file-remove {
  opacity: 1;
}

.file-add {
  border: 2px dashed #d1d5db;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.file-add:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: #fafbff;
}

.batch-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.4rem;
}

.required {
  color: #ef4444;
}

.form-input {
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  font-family: inherit;
  color: var(--text);
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.hidden-input {
  display: none;
}

/* 弹窗动画 */
.modal-enter-active { transition: opacity 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

@media (max-width: 640px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .toolbar-left {
    flex-wrap: wrap;
  }
  .toolbar-right {
    flex-wrap: wrap;
  }
  .search-input {
    width: 100%;
  }
  .batch-options {
    grid-template-columns: 1fr;
  }
  .modal-box-lg {
    max-width: 95%;
  }
}
</style>
