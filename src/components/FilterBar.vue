<template>
  <div class="filter-bar">
    <div class="filter-container">
      <button
        v-for="cat in categories"
        :key="cat.key"
        :class="['filter-btn', { active: currentCategory === cat.key }]"
        @click="$emit('filter', cat.key)"
      >
        {{ cat.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  categories: {
    type: Array,
    required: true
  },
  currentCategory: {
    type: String,
    required: true
  }
})

defineEmits(['filter'])
</script>

<style scoped>
.filter-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg);
  padding: 1rem 0;
  border-bottom: 1px solid var(--border);
  transition: box-shadow 0.3s ease;
}

.filter-bar.is-scrolled {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.filter-container {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.filter-btn {
  padding: 0.5rem 1.25rem;
  border: 2px solid var(--border);
  border-radius: 2rem;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  white-space: nowrap;
}

.filter-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}

.filter-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
}

@media (max-width: 640px) {
  .filter-container {
    justify-content: flex-start;
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding: 0 1rem;
  }
  .filter-container::-webkit-scrollbar {
    display: none;
  }
  .filter-btn {
    flex-shrink: 0;
    padding: 0.4rem 1rem;
    font-size: 0.85rem;
  }
}
</style>
