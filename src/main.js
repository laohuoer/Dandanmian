import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './assets/style.css'

const app = createApp(App)

// 捕获路由错误
router.onError((error) => {
  console.error('[Router Error]', error.message, error.stack)
})

app.use(router)

app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Error]', err, info)
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Rejection]', event.reason)
})

app.mount('#app')
