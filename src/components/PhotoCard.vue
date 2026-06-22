<template>
  <div
    class="photo-card"
    :style="cardStyle"
    ref="cardRef"
    @click="$emit('click', photo)"
  >
    <div class="photo-wrapper" :style="{ paddingBottom: aspectRatio + '%' }">
      <!-- 占位模糊图 -->
      <div class="photo-placeholder" :class="{ hidden: imageLoaded }"></div>
      <!-- 实际图片 -->
      <img
        :src="thumbUrl"
        :alt="photo.title"
        class="photo-img"
        :class="{ loaded: imageLoaded }"
        @load="onImageLoad"
        @error="onImageError"
        loading="lazy"
      />
      <!-- 悬停遮罩 -->
      <div class="photo-overlay">
        <span class="photo-title">{{ photo.title }}</span>
        <span class="photo-category">{{ categoryLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const props = defineProps({
  photo: { type: Object, required: true },
  position: { type: Object, default: null },
  categories: { type: Array, default: () => [] }
})

defineEmits(['click'])

const cardRef = ref(null)
const imageLoaded = ref(false)

const thumbUrl = computed(() => {
  if (props.photo.url) return props.photo.url
  return `https://picsum.photos/seed/${props.photo.seed}/${Math.round(props.photo.width / 2)}/${Math.round(props.photo.height / 2)}`
})

const aspectRatio = computed(() => {
  return (props.photo.height / props.photo.width) * 100
})

const categoryLabel = computed(() => {
  const cat = props.categories.find(c => c.key === props.photo.category)
  return cat ? cat.label : props.photo.category
})

const cardStyle = computed(() => {
  if (!props.position) {
    return {}
  }
  return {
    position: 'absolute',
    left: props.position.left + 'px',
    top: props.position.top + 'px',
    width: props.position.width + 'px'
  }
})

function onImageLoad() {
  imageLoaded.value = true
}

function onImageError() {
  // 图片加载失败时静默处理，保持占位图显示
}
</script>

<style scoped>
.photo-card {
  cursor: pointer;
  border-radius: 0.75rem;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.photo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

.photo-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: var(--card-bg);
  border-radius: 0.75rem;
}

.photo-placeholder {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 50%, #e0e0e0 100%);
  background-size: 200% 200%;
  animation: shimmer 1.5s ease-in-out infinite;
  transition: opacity 0.4s ease;
  z-index: 1;
}

.photo-placeholder.hidden {
  opacity: 0;
  pointer-events: none;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.photo-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(1.05);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.photo-img.loaded {
  opacity: 1;
  transform: scale(1);
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 40%, transparent 60%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.25rem 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
}

.photo-card:hover .photo-overlay {
  opacity: 1;
}

.photo-title {
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.photo-category {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.75rem;
  font-weight: 400;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

@media (max-width: 640px) {
  .photo-overlay {
    padding: 0.75rem 0.75rem;
  }
  .photo-title {
    font-size: 0.85rem;
  }
  .photo-category {
    font-size: 0.7rem;
  }
}
</style>
