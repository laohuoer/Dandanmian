import { upload, post } from './index.js'

/**
 * 上传图片
 * @param {File} file - 图片文件对象
 * @returns {Promise<{url: string}>} 返回图片 URL
 */
export function uploadImage(file) {
  const formData = new FormData()
  formData.append('image', file)
  return upload('/upload', formData)
}

/**
 * 批量上传照片
 * @param {File[]} files - 图片文件列表
 * @param {Object} options - 选项 { category, title }
 * @returns {Promise<{success: boolean, createdCount: number, photos: Array}>}
 */
export function batchUploadImages(files, options = {}) {
  const formData = new FormData()
  for (const file of files) {
    formData.append('images', file)
  }
  if (options.category) {
    formData.append('category', options.category)
  }
  if (options.title) {
    formData.append('title', options.title)
  }
  return upload('/photos/batch-upload', formData)
}
