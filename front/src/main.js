import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import axios from 'axios'

const app = createApp(App)

app.use(createPinia())
app.use(router)

axios.defaults.baseURL = import.meta.env.VITE_APP_SERVER_URL
console.log(import.meta.env.VITE_APP_SERVER_URL)
app.config.globalProperties.$axios = axios   // 将 axios 挂载为 app 的全局自定义属性

//通过axios拦截器添加token，保证拥有获取数据的权限.
axios.interceptors.request.use(config => {
  //为请求头对象添加token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

app.mount('#app')
