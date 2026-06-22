# DamDam 相册 - 后台管理系统架构计划

## 概述

在现有 Vue 3 + Vite 纯前端相册基础上，新增一个后台管理页面。采用 JSON Server 作为数据持久层，图片上传到本地 `public/uploads/` 目录。

## 技术选型

| 层面 | 技术 | 说明 |
|------|------|------|
| 数据服务 | JSON Server (Express 封装) | RESTful API，数据持久化到 `server/db.json` |
| 文件上传 | Multer | 处理 multipart/form-data，存入 `public/uploads/` |
| 前端路由 | Vue Router 4 | `/` 相册首页，`/admin` 后台管理 |
| API 通信 | fetch (原生) | 封装到 `src/api/` 模块 |
| 并发启动 | concurrently | 同时运行 Vite dev server 和 JSON Server |

## 项目结构变化

```
damdam/
├── server/                         # [新增] 后端服务
│   ├── server.js                   # Express + JSON Server + Multer 入口
│   └── db.json                     # 初始数据（从 photos.js 迁移）
├── public/
│   └── uploads/                    # [新增] 上传图片存储目录
├── src/
│   ├── api/                        # [新增] API 请求层
│   │   ├── index.js                # fetch 封装 + base URL
│   │   ├── photos.js               # 照片 CRUD
│   │   ├── categories.js           # 分类 CRUD
│   │   └── upload.js               # 文件上传
│   ├── router/                     # [新增] 路由配置
│   │   └── index.js
│   ├── views/                      # [新增] 页面级视图
│   │   ├── GalleryView.vue         # 迁移自 App.vue 的相册页面
│   │   └── admin/
│   │       ├── AdminLayout.vue     # 后台布局（侧边栏 + 主内容区）
│   │       ├── AdminDashboard.vue  # 仪表盘（统计概览）
│   │       ├── PhotoManager.vue    # 照片列表（表格 + 操作）
│   │       ├── PhotoForm.vue       # 照片新增/编辑表单（含上传）
│   │       └── CategoryManager.vue # 分类管理（增删改）
│   ├── composables/
│   │   ├── usePhotos.js            # [重构] 从 API 获取数据
│   │   ├── useMasonry.js           # [不变]
│   │   ├── useLightbox.js          # [不变]
│   │   └── useLazyLoad.js          # [不变]
│   ├── data/
│   │   └── photos.js               # [保留] 仅保留 CATEGORIES 常量 + URL 工具函数
│   ├── components/                 # [不变] 相册组件
│   ├── assets/
│   │   └── style.css               # [不变] 全局样式
│   ├── App.vue                     # [重构] 改为 <router-view> 容器
│   └── main.js                     # [重构] 注册 Vue Router
├── package.json                    # [更新] 新增依赖 + 脚本
└── vite.config.js                  # [更新] 代理 API 到 JSON Server
```

## 数据模型 (db.json)

```json
{
  "photos": [
    {
      "id": 1,
      "title": "山间晨雾",
      "category": "nature",
      "width": 800,
      "height": 1200,
      "seed": "mountain1",
      "url": null
    }
  ],
  "categories": [
    { "id": 1, "key": "nature", "label": "自然风光" },
    { "id": 2, "key": "architecture", "label": "建筑" },
    { "id": 3, "key": "people", "label": "人像" },
    { "id": 4, "key": "animals", "label": "动物" },
    { "id": 5, "key": "abstract", "label": "抽象" }
  ]
}
```

**图片 URL 优先级**：`url` 不为 null → 使用本地上传图片；否则 → 使用 picsum 在线图片。

## API 设计

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/photos` | 获取照片列表（支持 `?category=xxx` 筛选） |
| GET | `/api/photos/:id` | 获取单张照片 |
| POST | `/api/photos` | 新增照片 |
| PUT | `/api/photos/:id` | 更新照片 |
| DELETE | `/api/photos/:id` | 删除照片 |
| GET | `/api/categories` | 获取分类列表 |
| POST | `/api/categories` | 新增分类 |
| PUT | `/api/categories/:id` | 更新分类 |
| DELETE | `/api/categories/:id` | 删除分类 |
| POST | `/api/upload` | 上传图片 → 返回 `{ url: "/uploads/xxx.jpg" }` |

## 路由设计

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | GalleryView | 相册首页（瀑布流 + 筛选 + Lightbox） |
| `/admin` | AdminLayout | 后台管理布局（重定向到 `/admin/dashboard`） |
| `/admin/dashboard` | AdminDashboard | 仪表盘统计 |
| `/admin/photos` | PhotoManager | 照片管理列表 |
| `/admin/photos/new` | PhotoForm | 新增照片 |
| `/admin/photos/:id/edit` | PhotoForm | 编辑照片 |
| `/admin/categories` | CategoryManager | 分类管理 |

## 后台管理页面布局

```
┌──────────────────────────────────────────────┐
│  AdminHeader (Logo + 回到前台链接)            │
├──────────┬───────────────────────────────────┤
│          │                                   │
│  Sidebar │  <router-view>                    │
│          │  (Dashboard / PhotoManager /      │
│  📊 仪表盘 │   PhotoForm / CategoryManager)    │
│  🖼️ 照片管理 │                                   │
│  📁 分类管理 │                                   │
│          │                                   │
└──────────┴───────────────────────────────────┘
```

## 关键技术细节

### 1. 图片上传流程
```
用户选择文件 → FormData 封装 → POST /api/upload
→ Multer 存储到 public/uploads/
→ 返回 { url: "/uploads/1718991234-photo.jpg" }
→ 前端将 url 填入表单 → 提交 POST /api/photos
```

### 2. JSON Server 自定义服务器
- 使用 `json-server` 作为 Express 中间件（而非 CLI 模式）
- 这样可以添加自定义的 `/api/upload` 路由
- 同时保留 JSON Server 的所有 REST API 能力

### 3. Vite 代理配置
- `/api` 代理到 `http://localhost:3001`（JSON Server）
- `/uploads` 静态文件由 JSON Server 的 Express 直接提供

### 4. 数据迁移
- 现有 `src/data/photos.js` 的 30 张照片数据 → 写入 `server/db.json`
- 现有的 `CATEGORIES` 常量 → 写入 `db.json` 的 `categories` 数组
- `usePhotos.js` 从读取静态数据 → 改为 fetch API

## 实施步骤

1. 安装新依赖 + 创建 `server/server.js` + `server/db.json`
2. 更新 `package.json` 脚本 + `vite.config.js` 代理
3. 创建 `src/api/` API 请求层
4. 安装 Vue Router + 创建 `src/router/index.js`
5. 重构 `App.vue` 为路由容器 + 迁移相册到 `GalleryView.vue`
6. 重构 `usePhotos.js` 从 API 获取数据
7. 创建 `AdminLayout.vue`（侧边栏 + 顶栏 + 路由出口）
8. 创建 `AdminDashboard.vue`（统计数据卡片）
9. 创建 `PhotoManager.vue`（表格 + 搜索 + 删除确认）
10. 创建 `PhotoForm.vue`（表单 + 图片上传预览）
11. 创建 `CategoryManager.vue`（分类列表 + 增删改弹窗）
12. 更新 `index.html` 标题
13. 端到端测试（上传图片 → 管理分类 → 前台展示）