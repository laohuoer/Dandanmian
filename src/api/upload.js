import { upload, post } from './index.js'

/**
 * 客户端图片压缩配置
 */
const CLIENT_COMPRESS_OPTIONS = {
  maxWidth: 6000,
  maxHeight: 6000,
  quality: 0.8,           // 压缩质量 0-1
  threshold: 500 * 1024,   // 超过 500KB 才压缩
  mimeType: 'image/jpeg'   // 默认输出 JPEG 格式
}

/**
 * 客户端压缩图片文件
 * @param {File} file - 原始图片文件
 * @param {Object} options - 压缩选项
 * @returns {Promise<{file: File, compressed: boolean, originalSize: number, compressedSize: number}>}
 */
export function compressImageOnClient(file, options = {}) {
  const opts = { ...CLIENT_COMPRESS_OPTIONS, ...options }

  return new Promise((resolve) => {
    // 如果文件小于阈值，不压缩
    if (file.size < opts.threshold) {
      resolve({
        file,
        compressed: false,
        originalSize: file.size,
        compressedSize: file.size
      })
      return
    }

    // GIF 不做客户端压缩（会丢失动画）
    if (file.type === 'image/gif') {
      resolve({
        file,
        compressed: false,
        originalSize: file.size,
        compressedSize: file.size
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        let { width, height } = img

        // 计算缩放后的尺寸
        if (width > opts.maxWidth || height > opts.maxHeight) {
          const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        canvas.width = width
        canvas.height = height

        // 白色背景（处理 PNG 透明通道）
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        // 确定输出格式
        let outputType = opts.mimeType
        if (file.type === 'image/png' && file.size < 2 * 1024 * 1024) {
          // 小于 2MB 的 PNG 保持 PNG 格式
          outputType = 'image/png'
        }

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // 压缩后更大或失败，返回原文件
              resolve({
                file,
                compressed: false,
                originalSize: file.size,
                compressedSize: file.size
              })
              return
            }

            const ext = outputType === 'image/png' ? '.png' : '.jpg'
            const originalName = file.name.replace(/\.[^/.]+$/, '')
            const newFile = new File([blob], originalName + ext, { type: outputType })

            resolve({
              file: newFile,
              compressed: true,
              originalSize: file.size,
              compressedSize: newFile.size
            })
          },
          outputType,
          opts.quality
        )
      }

      img.onerror = () => {
        // 图片加载失败，返回原文件
        resolve({
          file,
          compressed: false,
          originalSize: file.size,
          compressedSize: file.size
        })
      }

      img.src = e.target.result
    }

    reader.onerror = () => {
      resolve({
        file,
        compressed: false,
        originalSize: file.size,
        compressedSize: file.size
      })
    }

    reader.readAsDataURL(file)
  })
}

/**
 * 格式化文件大小
 */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB'
}

/**
 * 上传图片（自动压缩）
 * @param {File} file - 图片文件对象
 * @param {Object} compressOptions - 压缩选项
 * @returns {Promise<{url: string, compressed?: boolean, originalSize?: number, compressedSize?: number}>}
 */
export async function uploadImage(file, compressOptions = {}) {
  // 客户端预压缩
  const compressed = await compressImageOnClient(file, compressOptions)

  if (compressed.compressed) {
    const ratio = ((1 - compressed.compressedSize / compressed.originalSize) * 100).toFixed(1)
    console.log(`📦 客户端压缩: ${file.name} | ${formatSize(compressed.originalSize)} → ${formatSize(compressed.compressedSize)} (节省 ${ratio}%)`)
  }

  const formData = new FormData()
  formData.append('image', compressed.file)
  return upload('/upload', formData)
}

/**
 * 批量上传照片（自动压缩）
 * @param {File[]} files - 图片文件列表
 * @param {Object} options - 选项 { category, title, compressOptions }
 * @returns {Promise<{success: boolean, createdCount: number, photos: Array}>}
 */
export async function batchUploadImages(files, options = {}) {
  const { compressOptions = {}, ...uploadOptions } = options

  // 客户端预压缩所有文件
  const compressedFiles = []
  for (const file of files) {
    const result = await compressImageOnClient(file, compressOptions)
    if (result.compressed) {
      const ratio = ((1 - result.compressedSize / result.originalSize) * 100).toFixed(1)
      console.log(`📦 客户端压缩: ${file.name} | ${formatSize(result.originalSize)} → ${formatSize(result.compressedSize)} (节省 ${ratio}%)`)
    }
    compressedFiles.push(result.file)
  }

  const formData = new FormData()
  for (const file of compressedFiles) {
    formData.append('images', file)
  }
  if (uploadOptions.category) {
    formData.append('category', uploadOptions.category)
  }
  if (uploadOptions.title) {
    formData.append('title', uploadOptions.title)
  }
  return upload('/photos/batch-upload', formData)
}
