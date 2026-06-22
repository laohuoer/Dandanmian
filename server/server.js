import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const DB_PATH = path.join(__dirname, 'db.json')

// ===== 工具函数：读写 db.json =====
function readDB() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8')
  return JSON.parse(raw)
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

function getNextId(collection) {
  if (collection.length === 0) return 1
  return Math.max(...collection.map(item => item.id)) + 1
}

// ===== 中间件 =====
app.use(cors())
app.use(express.json())

// ===== 静态文件：上传的图片 =====
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads')
app.use('/uploads', express.static(uploadsDir))

// ===== Multer 图片上传配置 =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = Date.now() + '-' + Math.random().toString(36).substring(2, 8)
    cb(null, name + ext)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的图片格式，仅允许 jpg/jpeg/png/gif/webp'))
    }
  }
})

// ===== 图片上传接口 =====
app.post('/api/upload', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message })
    }
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的图片' })
    }
    res.json({ url: `/uploads/${req.file.filename}` })
  })
})

// ===== Photos REST API =====

// 获取照片列表（支持分类筛选）
app.get('/api/photos', (req, res) => {
  const db = readDB()
  let photos = db.photos
  const { category } = req.query
  if (category && category !== 'all') {
    photos = photos.filter(p => p.category === category)
  }
  res.json(photos)
})

// 获取单张照片
app.get('/api/photos/:id', (req, res) => {
  const db = readDB()
  const photo = db.photos.find(p => p.id === parseInt(req.params.id))
  if (!photo) {
    return res.status(404).json({ error: '照片不存在' })
  }
  res.json(photo)
})

// 创建照片
app.post('/api/photos', (req, res) => {
  const db = readDB()
  const newPhoto = {
    id: getNextId(db.photos),
    seed: req.body.seed || '',
    title: req.body.title || '未命名',
    category: req.body.category || 'nature',
    width: req.body.width || 800,
    height: req.body.height || 600,
    url: req.body.url || null
  }
  db.photos.push(newPhoto)
  writeDB(db)
  res.status(201).json(newPhoto)
})

// 更新照片（全量替换）
app.put('/api/photos/:id', (req, res) => {
  const db = readDB()
  const id = parseInt(req.params.id)
  const index = db.photos.findIndex(p => p.id === id)
  if (index === -1) {
    return res.status(404).json({ error: '照片不存在' })
  }
  const updatedPhoto = {
    id,
    seed: req.body.seed ?? db.photos[index].seed,
    title: req.body.title ?? db.photos[index].title,
    category: req.body.category ?? db.photos[index].category,
    width: req.body.width ?? db.photos[index].width,
    height: req.body.height ?? db.photos[index].height,
    url: req.body.url ?? db.photos[index].url
  }
  db.photos[index] = updatedPhoto
  writeDB(db)
  res.json(updatedPhoto)
})

// 更新照片（部分更新）
app.patch('/api/photos/:id', (req, res) => {
  const db = readDB()
  const id = parseInt(req.params.id)
  const index = db.photos.findIndex(p => p.id === id)
  if (index === -1) {
    return res.status(404).json({ error: '照片不存在' })
  }
  db.photos[index] = { ...db.photos[index], ...req.body, id }
  writeDB(db)
  res.json(db.photos[index])
})

// 删除照片（同时删除上传的文件）
app.delete('/api/photos/:id', (req, res) => {
  const db = readDB()
  const id = parseInt(req.params.id)
  const index = db.photos.findIndex(p => p.id === id)
  if (index === -1) {
    return res.status(404).json({ error: '照片不存在' })
  }
  const photo = db.photos[index]
  // 删除上传的图片文件
  if (photo.url) {
    const filePath = path.join(__dirname, '..', 'public', photo.url)
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath)
      } catch (e) {
        console.warn('删除文件失败:', filePath, e.message)
      }
    }
  }
  db.photos.splice(index, 1)
  writeDB(db)
  res.json({ success: true })
})

// 批量删除照片
app.post('/api/photos/batch-delete', (req, res) => {
  const { ids } = req.body
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: '请提供要删除的照片 ID 列表' })
  }
  const db = readDB()
  const idSet = new Set(ids.map(id => parseInt(id)))
  const deleted = []
  const notFound = []

  // 先收集要删除的照片并删除文件
  for (const numId of idSet) {
    const photo = db.photos.find(p => p.id === numId)
    if (!photo) {
      notFound.push(numId)
      continue
    }
    // 删除上传的图片文件
    if (photo.url) {
      const filePath = path.join(__dirname, '..', 'public', photo.url)
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath)
        } catch (e) {
          console.warn('删除文件失败:', filePath, e.message)
        }
      }
    }
    deleted.push(photo)
  }

  // 使用 filter 一次性过滤，避免 splice 导致的索引偏移问题
  db.photos = db.photos.filter(p => !idSet.has(p.id))

  writeDB(db)
  res.json({ success: true, deletedCount: deleted.length, notFound })
})

// 批量上传照片
app.post('/api/photos/batch-upload', (req, res) => {
  upload.array('images', 20)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message })
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '请选择要上传的图片' })
    }

    const { category = 'nature', title } = req.body
    const db = readDB()
    const created = []

    for (const file of req.files) {
      const newPhoto = {
        id: getNextId(db.photos),
        seed: '',
        title: title || file.originalname.replace(/\.[^/.]+$/, ''),
        category,
        width: 800,
        height: 600,
        url: `/uploads/${file.filename}`
      }
      db.photos.push(newPhoto)
      created.push(newPhoto)
    }

    writeDB(db)
    res.status(201).json({ success: true, createdCount: created.length, photos: created })
  })
})

// ===== Categories REST API =====

// 获取分类列表
app.get('/api/categories', (req, res) => {
  const db = readDB()
  res.json(db.categories)
})

// 获取单个分类
app.get('/api/categories/:id', (req, res) => {
  const db = readDB()
  const cat = db.categories.find(c => c.id === parseInt(req.params.id))
  if (!cat) {
    return res.status(404).json({ error: '分类不存在' })
  }
  res.json(cat)
})

// 创建分类
app.post('/api/categories', (req, res) => {
  const db = readDB()
  // 检查 key 是否重复
  if (db.categories.some(c => c.key === req.body.key)) {
    return res.status(400).json({ error: '分类 key 已存在' })
  }
  const newCat = {
    id: getNextId(db.categories),
    key: req.body.key || '',
    label: req.body.label || ''
  }
  db.categories.push(newCat)
  writeDB(db)
  res.status(201).json(newCat)
})

// 更新分类
app.put('/api/categories/:id', (req, res) => {
  const db = readDB()
  const id = parseInt(req.params.id)
  const index = db.categories.findIndex(c => c.id === id)
  if (index === -1) {
    return res.status(404).json({ error: '分类不存在' })
  }
  // 检查 key 是否与其他分类重复
  if (req.body.key && db.categories.some(c => c.key === req.body.key && c.id !== id)) {
    return res.status(400).json({ error: '分类 key 已存在' })
  }
  const updatedCat = {
    id,
    key: req.body.key ?? db.categories[index].key,
    label: req.body.label ?? db.categories[index].label
  }
  db.categories[index] = updatedCat
  writeDB(db)
  res.json(updatedCat)
})

// 删除分类
app.delete('/api/categories/:id', (req, res) => {
  const db = readDB()
  const id = parseInt(req.params.id)
  const index = db.categories.findIndex(c => c.id === id)
  if (index === -1) {
    return res.status(404).json({ error: '分类不存在' })
  }
  db.categories.splice(index, 1)
  writeDB(db)
  res.json({ success: true })
})

// ===== 启动服务器 =====
const PORT = 3001
app.listen(PORT, () => {
  console.log(`🚀 API Server 运行在 http://localhost:${PORT}`)
  console.log(`📡 API 端点: http://localhost:${PORT}/api/photos, /api/categories`)
  console.log(`📤 上传接口: http://localhost:${PORT}/api/upload`)
})
