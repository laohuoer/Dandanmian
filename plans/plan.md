# 全功能相册网页 - 技术方案 (Vue 3 + Vite)

## 概述
基于 Vue 3 Composition API + Vite 构建的全功能相册 SPA，组件化开发，工程化构建。

## 核心功能
1. **瀑布流布局** - Masonry 布局算法，自适应列数
2. **Lightbox 灯箱** - 点击图片全屏查看，键盘导航
3. **分类筛选** - 顶部筛选按钮，平滑过渡动画
4. **懒加载** - Intersection Observer API 实现图片按需加载
5. **响应式设计** - 移动端/平板/桌面端自适应

## 技术选型
- **Vue 3** Composition API + `<script setup>`
- **Vite** 构建工具
- **CSS3** Scoped Style + CSS 变量 + 过渡动画
- **图片源** picsum.photos 在线占位图

## 项目结构
```
damdam/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── favicon.ico
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── assets/
│   │   └── style.css              # 全局样式 + CSS 变量
│   ├── components/
│   │   ├── AppHeader.vue          # 顶部标题栏
│   │   ├── FilterBar.vue          # 分类筛选按钮组
│   │   ├── PhotoGrid.vue          # 瀑布流网格容器
│   │   ├── PhotoCard.vue          # 单张图片卡片
│   │   ├── Lightbox.vue           # 灯箱全屏查看
│   │   └── BackToTop.vue          # 回到顶部 FAB 按钮
│   ├── composables/
│   │   ├── usePhotos.js           # 图片数据 + 筛选逻辑
│   │   ├── useMasonry.js          # 瀑布流布局算法
│   │   ├── useLightbox.js         # 灯箱状态管理
│   │   └── useLazyLoad.js         # 懒加载 Intersection Observer
│   └── data/
│       └── photos.js              # 静态图片数据（约 30 张）
└── plans/
    └── plan.md                    # 本方案文档
```

## 组件树
```
App.vue
├── AppHeader.vue
├── FilterBar.vue
├── PhotoGrid.vue
│   └── PhotoCard.vue (v-for)
├── Lightbox.vue (条件渲染)
└── BackToTop.vue
```

## 数据流
```
photos.js (静态数据)
     ↓
usePhotos.js (composable: 提供 filteredPhotos, currentCategory, setCategory)
     ↓
App.vue (provide 数据)
     ↓
FilterBar.vue (emit 分类切换事件)
     ↓
PhotoGrid.vue (inject 数据, 调用 useMasonry 布局)
     ↓
PhotoCard.vue (inject 懒加载, emit 点击事件)
     ↓
Lightbox.vue (inject useLightbox, 显示大图)
```

## 响应式断点
| 断点 | 列数 | 容器宽度 |
|------|------|----------|
| < 640px | 1 列 | 100% |
| 640-1024px | 2 列 | 90% |
| 1024-1440px | 3 列 | 85% |
| > 1440px | 4 列 | 1400px max |

## 关键交互
- 筛选切换：`<TransitionGroup>` 实现图片卡片进出动画
- Lightbox：`<Teleport>` 到 body，`Esc` 关闭，`←` `→` 切换
- 懒加载：`v-intersection-observer` 指令或 composable 封装
- 回到顶部：滚动超过 500px 显示，平滑滚动