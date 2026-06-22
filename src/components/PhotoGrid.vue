<template>
  <div class="photo-grid-container" ref="gridRef">
    <div class="grid-inner" :style="gridStyle">
      <PhotoCard
        v-for="photo in photos"
        :key="photo.id"
        :photo="photo"
        :position="getPosition(photo.id)"
        :categories="categories"
        @click="$emit('photo-click', photo)"
      />
    </div>
    <div v-if="!photos.length" class="empty-state">
      <p>暂无图片</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import PhotoCard from './PhotoCard.vue'
import { useMasonry } from '../composables/useMasonry.js'
import { usePhotos } from '../composables/usePhotos.js'

const props = defineProps({
  photos: { type: Array, required: true }
})

defineEmits(['photo-click'])

const { categories } = usePhotos()

const gridRef = ref(null)
const { positions, containerHeight, layout, calcColumns } = useMasonry(gridRef, () => props.photos, {
  gap: 16,
  minColWidth: 280
})
// 使用 computed Map 确保响应式追踪
const positionMap = computed(() => {
  const map = new Map()
  for (const pos of positions.value) {
    map.set(pos.id, pos)
  }
  return map
})

function getPosition(id) {
  return positionMap.value.get(id) || null
}

const gridStyle = computed(() => ({
  height: containerHeight.value + 'px',
  position: 'relative'
}))

// 监听 photos 变化重新布局
// 注意：初始布局由 useMasonry 的 onMounted 处理，此处仅处理后续变化
watch(() => props.photos, async () => {
  await nextTick()
  calcColumns()
  layout()
}, { deep: true })
</script>

<style scoped>
.photo-grid-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  width: 100%;
}

.grid-inner {
  width: 100%;
  position: relative;
  transition: height 0.4s ease;
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

@media (max-width: 640px) {
  .photo-grid-container {
    padding: 1rem 0.75rem;
  }
}

/* TransitionGroup 动画 */
.grid-enter-active {
  transition: all 0.5s ease;
}
.grid-leave-active {
  transition: all 0.3s ease;
}
.grid-enter-from {
  opacity: 0;
  transform: scale(0.8);
}
.grid-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
.grid-move {
  transition: transform 0.5s ease;
}
</style>
