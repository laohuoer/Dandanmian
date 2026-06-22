<template>
  <Transition name="fab">
    <button
      v-if="visible"
      class="back-to-top"
      @click="scrollToTop"
      aria-label="回到顶部"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > 500
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 500;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: var(--primary);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(79, 70, 229, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.back-to-top:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.45);
}

.back-to-top:active {
  transform: translateY(-1px);
}

/* FAB 过渡动画 */
.fab-enter-active {
  transition: all 0.3s ease;
}
.fab-leave-active {
  transition: all 0.2s ease;
}
.fab-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}
.fab-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.8);
}

@media (max-width: 640px) {
  .back-to-top {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 42px;
    height: 42px;
  }
}
</style>
