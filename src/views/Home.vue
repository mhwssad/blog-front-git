<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="home-page">
    <div class="home-content">
      <h1 class="home-title">Welcome to Blog Front</h1>
      <p class="home-description">
        Vue 3 + TypeScript + Vite + UnoCSS + Element Plus
      </p>

      <div class="home-counter">
        <p>Count: {{ count }}</p>
        <button class="btn-primary" @click="count++">
          Increment
        </button>
      </div>

      <div class="home-features">
        <div class="feature-card">
          <h3>Vue 3</h3>
          <p>Composition API</p>
        </div>
        <div class="feature-card">
          <h3>TypeScript</h3>
          <p>Full Type Safety</p>
        </div>
        <div class="feature-card">
          <h3>UnoCSS</h3>
          <p>Atomic CSS</p>
        </div>
        <div class="feature-card">
          <h3>Element Plus</h3>
          <p>UI Components</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.home-content {
  text-align: center;
  max-width: 800px;
}

.home-title {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

.home-description {
  font-size: var(--font-size-lg);
  color: var(--color-text-regular);
  margin-bottom: var(--spacing-xl);
}

.home-counter {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--color-white);
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-base);
}

.home-counter p {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.btn-primary {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--border-radius-base);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: var(--transition-base);
}

.btn-primary:hover {
  background: var(--color-primary-dark);
}

.home-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.feature-card {
  padding: var(--spacing-lg);
  background: var(--color-white);
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-base);
  transition: var(--transition-base);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-large);
}

.feature-card h3 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.feature-card p {
  font-size: var(--font-size-sm);
  color: var(--color-text-regular);
}
</style>
