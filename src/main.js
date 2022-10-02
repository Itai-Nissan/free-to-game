import { createApp } from 'vue'
import { defineComponent } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import ElementPlus from 'element-plus'

import './styles/styles.scss'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(ElementPlus)


app.mount('#app')