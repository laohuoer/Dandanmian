import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

export function useMasonry(containerRef, getPhotos, options = {}) {
  const { gap = 16, minColWidth = 280 } = options

  const columns = ref(3)
  const columnHeights = ref([])
  const positions = ref([])

  /**
   * 获取容器内容区宽度（减去 padding）
   */
  function getContainerWidth() {
    if (!containerRef.value) return 0
    const style = window.getComputedStyle(containerRef.value)
    const paddingLeft = parseFloat(style.paddingLeft) || 0
    const paddingRight = parseFloat(style.paddingRight) || 0
    return containerRef.value.offsetWidth - paddingLeft - paddingRight
  }

  /**
   * 根据容器宽度计算列数
   */
  function calcColumns() {
    const containerWidth = getContainerWidth()
    if (containerWidth <= 0) return
    const count = Math.max(1, Math.floor((containerWidth + gap) / (minColWidth + gap)))
    columns.value = count
  }

  /**
   * 计算每张图片在瀑布流中的位置
   */
  function layout() {
    const photos = typeof getPhotos === 'function' ? getPhotos() : getPhotos.value
    const containerWidth = getContainerWidth()
    if (!containerWidth || !photos || !photos.length) {
      positions.value = []
      columnHeights.value = []
      return
    }

    const colCount = columns.value
    const totalGap = (colCount - 1) * gap
    const colWidth = (containerWidth - totalGap) / colCount

    // 初始化每列高度为 0
    const heights = new Array(colCount).fill(0)
    const pos = []

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      // 找到最短列
      const minHeight = Math.min(...heights)
      const colIndex = heights.indexOf(minHeight)

      // 根据图片宽高比计算缩放后的高度
      const scaledHeight = (photo.height / photo.width) * colWidth

      pos.push({
        id: photo.id,
        left: colIndex * (colWidth + gap),
        top: heights[colIndex],
        width: colWidth,
        height: scaledHeight
      })

      heights[colIndex] += scaledHeight + gap
    }

    columnHeights.value = heights
    positions.value = pos
  }

  /**
   * 获取容器总高度
   */
  const containerHeight = computed(() => {
    if (!columnHeights.value.length) return 0
    return Math.max(...columnHeights.value) - gap
  })

  // 防抖 resize
  let resizeTimer = null
  function onResize() {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      calcColumns()
      layout()
    }, 150)
  }

  onMounted(() => {
    // 使用 requestAnimationFrame 确保 DOM 完全渲染且有宽度
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        calcColumns()
        layout()
      })
    })
    window.addEventListener('resize', onResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
    clearTimeout(resizeTimer)
  })

  return {
    columns,
    positions,
    containerHeight,
    layout,
    calcColumns
  }
}
