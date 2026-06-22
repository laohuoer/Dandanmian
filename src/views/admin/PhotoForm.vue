<template>
  <div class="photo-form-page">
    <div class="form-header">
      <router-link to="/admin/photos" class="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        返回列表
      </router-link>
      <h2 class="form-title">{{ isEdit ? '编辑照片' : '新增照片' }}</h2>
    </div>

    <form class="photo-form" @submit.prevent="handleSubmit">
      <!-- 图片上传区 -->
      <div class="form-section">
        <label class="form-label">照片图片</label>
        <div class="upload-area" @click="triggerUpload" @dragover.prevent @drop.prevent="handleDrop">
          <div v-if="previewUrl" class="upload-preview">
            <img :src="previewUrl" alt="预览" />
            <button type="button" class="remove-preview" @click.stop="removeImage">✕</button>
          </div>
          <div v-else class="upload-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <p>点击或拖拽上传图片</p>
            <span>支持 JPG / PNG / GIF / WebP，最大 10MB</span>
          </div>
        </div>
        <input ref="fileInput" type="file" accept="image/*" class="hidden-input" @change="handleFileChange" />

        <!-- 或者使用在线图片 -->
        <div class="online-option">
          <label class="form-label">或使用在线图片 Seed</label>
          <input v-model="form.seed" type="text" class="form-input" placeholder="例如: mountain1" :disabled="!!form.url" />
          <p class="form-hint">留空则使用 picsum.photos 随机图片，输入 seed 可获取固定图片</p>
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="form-section">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">标题 <span class="required">*</span></label>
            <input v-model="form.title" type="text" class="form-input" placeholder="输入照片标题" required />
          </div>
          <div class="form-group">
            <label class="form-label">分类 <span class="required">*</span></label>
            <select v-model="form.category" class="form-input" required>
              <option value="">请选择分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.key">{{ cat.label }}</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">宽度 (px)</label>
            <input v-model.number="form.width" type="number" class="form-input" placeholder="800" min="100" />
          </div>
          <div class="form-group">
            <label class="form-label">高度 (px)</label>
            <input v-model.number="form.height" type="number" class="form-input" placeholder="600" min="100" />
          </div>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="form-actions">
        <router-link to="/admin/photos" class="btn">取消</router-link>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? '保存中...' : (isEdit ? '更新照片' : '创建照片') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchPhoto, createPhoto, updatePhoto } from '../../api/photos.js'
import { fetchCategories } from '../../api/categories.js'
import { uploadImage } from '../../api/upload.js'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => route.name === 'PhotoEdit')
const categories = ref([])
const submitting = ref(false)
const fileInput = ref(null)
const previewUrl = ref('')

const form = ref({
  title: '',
  category: '',
  width: 800,
  height: 600,
  seed: '',
  url: null
})

function triggerUpload() {
  fileInput.value.click()
}

async function handleFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  await uploadFile(file)
}

async function handleDrop(e) {
  const file = e.dataTransfer.files[0]
  if (!file) return
  await uploadFile(file)
}

async function uploadFile(file) {
  try {
    previewUrl.value = URL.createObjectURL(file)
    const result = await uploadImage(file)
    form.value.url = result.url
    form.value.seed = ''
  } catch (e) {
    alert('上传失败: ' + e.message)
    previewUrl.value = ''
  }
}

function removeImage() {
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = ''
  form.value.url = null
  if (fileInput.value) fileInput.value.value = ''
}

async function handleSubmit() {
  if (!form.value.title || !form.value.category) {
    alert('请填写标题和分类')
    return
  }

  submitting.value = true
  try {
    const data = { ...form.value }
    if (!data.url && !data.seed) {
      data.seed = 'photo-' + Date.now()
    }
    if (!data.width) data.width = 800
    if (!data.height) data.height = 600

    if (isEdit.value) {
      await updatePhoto(route.params.id, data)
    } else {
      await createPhoto(data)
    }
    router.push('/admin/photos')
  } catch (e) {
    alert('保存失败: ' + e.message)
  } finally {
    submitting.value = false
  }
}

// 组件卸载时释放 ObjectURL 内存
onUnmounted(() => {
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
})

onMounted(async () => {
  try {
    categories.value = await fetchCategories()

    if (isEdit.value && route.params.id) {
      const photo = await fetchPhoto(route.params.id)
      form.value = {
        title: photo.title,
        category: photo.category,
        width: photo.width,
        height: photo.height,
        seed: photo.seed || '',
        url: photo.url || null
      }
      if (photo.url) {
        previewUrl.value = photo.url
      } else if (photo.seed) {
        previewUrl.value = `https://picsum.photos/seed/${photo.seed}/200/200`
      }
    }
  } catch (e) {
    console.error('加载数据失败:', e)
  }
})
</script>

<style scoped>
.photo-form-page {
  max-width: 720px;
}

.form-header {
  margin-bottom: 1.5rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--primary);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  transition: opacity 0.2s;
}

.back-link:hover {
  opacity: 0.8;
}

.form-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.photo-form {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f0f2f5;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.required {
  color: #ef4444;
}

.form-hint {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0.35rem 0 0;
}

/* ===== 上传区 ===== */
.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1rem;
}

.upload-area:hover {
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

.upload-preview {
  position: relative;
  display: inline-block;
}

.upload-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 0.5rem;
  object-fit: contain;
}

.remove-preview {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  border: 2px solid #fff;
  cursor: pointer;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hidden-input {
  display: none;
}

.online-option {
  margin-top: 1rem;
}

/* ===== 表单行 ===== */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-input {
  padding: 0.55rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  font-family: inherit;
  color: var(--text);
  outline: none;
  transition: border-color 0.2s;
  background: #fff;
}

.form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-input:disabled {
  background: #f9fafb;
  color: var(--text-secondary);
}

/* ===== 按钮 ===== */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.25rem;
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

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  .upload-area {
    padding: 1.25rem;
  }
}
</style>
