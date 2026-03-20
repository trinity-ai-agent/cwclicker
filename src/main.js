import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { useGameStore } from './stores/game'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.mount('#app')

// Load saved game state
const store = useGameStore()
store.load()