<template>
  <div class="category-manager">
    <!-- 工具栏 -->
    <div class="toolbar">
      <h3 class="toolbar-title">分类列表</h3>
      <button class="btn btn-primary" @click="openAddModal">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        新增分类
      </button>
    </div>

    <!-- 分类列表 -->
    <div class="category-list">
      <div v-for="cat in categories" :key="cat.id" class="category-item">
        <div class="category-info">
          <span class="category-key">{{ cat.key }}</span>
          <span class="category-label">{{ cat.label }}</span>
          <span class="category-count">{{ getPhotoCount(cat.key) }} 张照片</span>
        </div>
        <div class="category-actions">
          <button class="btn-icon" @click="openEditModal(cat)" title="编辑">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="btn-icon danger" @click="confirmDelete(cat)" title="删除">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
      <div v-if="!categories.length" class="empty-state">暂无分类</div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-box">
            <h3 class="modal-title">{{ isEditing ? '编辑分类' : '新增分类' }}</h3>
            <div class="form-group">
              <label class="form-label">分类 Key <span class="required">*</span></label>
              <input
                v-model="form.key"
                type="text"
                class="form-input"
                placeholder="例如: nature（英文，用于 URL 标识）"
                :disabled="isEditing"
              />
              <p class="form-hint">创建后不可修改，建议使用小写英文</p>
            </div>
            <div class="form-group">
              <label class="form-label">分类名称 <span class="required">*</span></label>
              <input v-model="form.label" type="text" class="form-input" placeholder="例如: 自然风光" />
            </div>
            <div class="modal-actions">
              <button class="btn" @click="closeModal">取消</button>
              <button class="btn btn-primary" @click="handleSave" :disabled="saving">
                {{ saving ? '保存中...' : '保存' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 删除确认弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
          <div class="modal-box">
            <h3 class="modal-title">确认删除</h3>
            <p class="modal-text">
              确定要删除分类「{{ deleteTarget.label }}」吗？
              <br />该分类下有 <strong>{{ getPhotoCount(deleteTarget.key) }}</strong> 张照片，删除后这些照片的分类将变为空值。
            </p>
            <div class="modal-actions">
              <button class="btn" @click="deleteTarget = null">取消</button>
              <button class="btn btn-danger" @click="handleDelete">确认删除</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories.js'
import { fetchPhotos } from '../../api/photos.js'

const categories = ref([])
const photos = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleteTarget = ref(null)

const form = ref({
  id: null,
  key: '',
  label: ''
})

function getPhotoCount(key) {
  return photos.value.filter(p => p.category === key).length
}

function openAddModal() {
  isEditing.value = false
  form.value = { id: null, key: '', label: '' }
  showModal.value = true
}

function openEditModal(cat) {
  isEditing.value = true
  form.value = { id: cat.id, key: cat.key, label: cat.label }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function handleSave() {
  if (!form.value.key || !form.value.label) {
    alert('请填写分类 Key 和名称')
    return
  }

  saving.value = true
  try {
    if (isEditing.value) {
      await updateCategory(form.value.id, { key: form.value.key, label: form.value.label })
      const idx = categories.value.findIndex(c => c.id === form.value.id)
      if (idx >= 0) categories.value[idx] = { ...form.value }
    } else {
      const newCat = await createCategory({ key: form.value.key, label: form.value.label })
      categories.value.push(newCat)
    }
    closeModal()
  } catch (e) {
    alert('保存失败: ' + e.message)
  } finally {
    saving.value = false
  }
}

function confirmDelete(cat) {
  deleteTarget.value = cat
}

async function handleDelete() {
  if (!deleteTarget.value) return
  try {
    await deleteCategory(deleteTarget.value.id)
    categories.value = categories.value.filter(c => c.id !== deleteTarget.value.id)
    deleteTarget.value = null
  } catch (e) {
    alert('删除失败: ' + e.message)
  }
}

onMounted(async () => {
  try {
    const [catsData, photosData] = await Promise.all([
      fetchCategories(),
      fetchPhotos()
    ])
    categories.value = catsData
    photos.value = photosData
  } catch (e) {
    console.error('加载数据失败:', e)
  }
})
</script>

<style scoped>
.category-manager {
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
}

.toolbar-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

/* ===== 分类列表 ===== */
.category-list {
  padding: 0.5rem 0;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid #f0f2f5;
  transition: background 0.15s;
}

.category-item:last-child {
  border-bottom: none;
}

.category-item:hover {
  background: #fafbfc;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-key {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  background: #f0f2f5;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-family: 'Courier New', monospace;
  color: var(--text-secondary);
}

.category-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text);
}

.category-count {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.category-actions {
  display: flex;
  gap: 0.25rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
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
  transition: all 0.2s;
}

.btn:hover {
  background: #f9fafb;
}

.btn-primary {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1.25rem;
}

.modal-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 1.25rem;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* ===== 表单 ===== */
.form-group {
  margin-bottom: 1rem;
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

.form-input:disabled {
  background: #f9fafb;
  color: var(--text-secondary);
}

.form-hint {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0.35rem 0 0;
}

/* 弹窗动画 */
.modal-enter-active { transition: opacity 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
