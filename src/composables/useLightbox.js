import { ref, computed } from 'vue'

const isOpen = ref(false)
const currentIndex = ref(-1)
const photosList = ref([])

export function useLightbox() {
  const currentPhoto = computed(() => {
    if (currentIndex.value < 0 || currentIndex.value >= photosList.value.length) return null
    return photosList.value[currentIndex.value]
  })

  const hasPrev = computed(() => currentIndex.value > 0)
  const hasNext = computed(() => currentIndex.value < photosList.value.length - 1)
  const totalCount = computed(() => photosList.value.length)

  function open(photos, index) {
    photosList.value = [...photos]
    currentIndex.value = index
    isOpen.value = true
    document.body.style.overflow = 'hidden'
  }

  function close() {
    isOpen.value = false
    currentIndex.value = -1
    document.body.style.overflow = ''
  }

  function prev() {
    if (hasPrev.value) {
      currentIndex.value--
    }
  }

  function next() {
    if (hasNext.value) {
      currentIndex.value++
    }
  }

  function handleKeydown(e) {
    if (!isOpen.value) return
    switch (e.key) {
      case 'Escape':
        close()
        break
      case 'ArrowLeft':
        prev()
        break
      case 'ArrowRight':
        next()
        break
    }
  }

  return {
    isOpen,
    currentIndex,
    currentPhoto,
    hasPrev,
    hasNext,
    totalCount,
    open,
    close,
    prev,
    next,
    handleKeydown
  }
}
