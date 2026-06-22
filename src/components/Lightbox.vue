<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div v-if="isOpen" class="lightbox-overlay" @click.self="close">
        <div class="lightbox-content">
          <!-- 关闭按钮 -->
          <button class="lightbox-close" @click="close" aria-label="关闭">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <!-- 上一张 -->
          <button
            v-if="hasPrev"
            class="lightbox-nav lightbox-prev"
            @click="prev"
            aria-label="上一张"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <!-- 图片 -->
          <div class="lightbox-img-wrapper" v-if="currentPhoto">
            <Transition name="lightbox-img" mode="out-in">
              <img
                :key="currentPhoto.id"
                :src="fullUrl"
                :alt="currentPhoto.title"
                class="lightbox-img"
              />
            </Transition>
            <div class="lightbox-info">
              <span class="lightbox-title">{{ currentPhoto.title }}</span>
              <span class="lightbox-counter">{{ currentIndex + 1 }} / {{ totalCount }}</span>
            </div>
          </div>

          <!-- 下一张 -->
          <button
            v-if="hasNext"
            class="lightbox-nav lightbox-next"
            @click="next"
            aria-label="下一张"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useLightbox } from '../composables/useLightbox.js'

const { isOpen, currentIndex, currentPhoto, hasPrev, hasNext, totalCount, close, prev, next } = useLightbox()

const fullUrl = computed(() => {
  if (!currentPhoto.value) return ''
  if (currentPhoto.value.url) return currentPhoto.value.url
  return `https://picsum.photos/seed/${currentPhoto.value.seed}/${currentPhoto.value.width}/${currentPhoto.value.height}`
})
</script>

<style scoped>
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}

.lightbox-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 10;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.25);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.25);
}

.lightbox-prev {
  left: 1.5rem;
}

.lightbox-next {
  right: 1.5rem;
}

.lightbox-img-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 90vw;
  max-height: 85vh;
}

.lightbox-img {
  max-width: 90vw;
  max-height: 75vh;
  object-fit: contain;
  border-radius: 0.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.lightbox-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 90vw;
  padding: 1rem 0.5rem 0;
  color: rgba(255, 255, 255, 0.85);
  gap: 1rem;
}

.lightbox-title {
  font-size: 1rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.lightbox-counter {
  font-size: 0.85rem;
  opacity: 0.7;
  flex-shrink: 0;
}

/* Lightbox 过渡动画 */
.lightbox-enter-active {
  transition: opacity 0.3s ease;
}
.lightbox-leave-active {
  transition: opacity 0.2s ease;
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

/* 图片切换动画 */
.lightbox-img-enter-active {
  transition: all 0.3s ease;
}
.lightbox-img-leave-active {
  transition: all 0.15s ease;
}
.lightbox-img-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.lightbox-img-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

@media (max-width: 640px) {
  .lightbox-img {
    max-width: 95vw;
    max-height: 70vh;
    border-radius: 0.375rem;
  }
  .lightbox-img-wrapper {
    max-width: 95vw;
  }
  .lightbox-info {
    max-width: 95vw;
    padding: 0.75rem 0.25rem 0;
  }
  .lightbox-title {
    font-size: 0.9rem;
  }
  .lightbox-counter {
    font-size: 0.8rem;
  }
  .lightbox-nav {
    width: 40px;
    height: 40px;
  }
  .lightbox-nav svg {
    width: 24px;
    height: 24px;
  }
  .lightbox-prev {
    left: 0.5rem;
  }
  .lightbox-next {
    right: 0.5rem;
  }
  .lightbox-close {
    top: 0.75rem;
    right: 0.75rem;
    width: 38px;
    height: 38px;
  }
  .lightbox-close svg {
    width: 20px;
    height: 20px;
  }
}
</style>
