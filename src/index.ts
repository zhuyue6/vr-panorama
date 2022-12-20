import { createApp } from 'vue'
import App from './app.vue'
import router from './router'
import { createPinia } from 'pinia'
import './styles'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

app.mount('#app')
