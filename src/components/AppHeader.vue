<template>
  <header class="app-header">
    <div class="header-content">
      <h1 class="header-title">DamDam</h1>
      <p class="header-subtitle">记录生活中的每一个精彩瞬间</p>
    </div>
    <div class="header-curve"></div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.app-header {
  position: relative;
  background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%);
  color: #fff;
  overflow: visible;
}

.header-content {
  text-align: center;
  padding: 2.5rem 1rem 3rem;
  position: relative;
  z-index: 1;
}

.header-title {
  font-family: 'Playfair Display', serif;
  font-size: 3rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.05em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.header-subtitle {
  font-size: 1.1rem;
  font-weight: 300;
  margin: 0.5rem 0 0;
  opacity: 0.9;
  letter-spacing: 0.1em;
}

.header-curve {
  position: relative;
  height: 40px;
  background: var(--bg);
  border-radius: 2.5rem 2.5rem 0 0;
  margin-top: -1px;
}

@media (max-width: 640px) {
  .header-content {
    padding: 2rem 1rem 2.5rem;
  }
  .header-title {
    font-size: 2.2rem;
  }
  .header-subtitle {
    font-size: 0.95rem;
  }
  .header-curve {
    height: 30px;
    border-radius: 1.5rem 1.5rem 0 0;
  }
}
</style>
