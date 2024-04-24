import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Register from '../views/Register.vue'
import Login from '../views/login.vue'
import User from '../views/User.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },
  {
    path:'/login',
    name: 'login',
    component: Login
  },
  {
    path:'/user',
    name: 'user',
    component: User
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
// router.beforeEach((to, from ,next) =>  {
//   const islogin = localStorage.eletoken ? true : false    //检查用户是否已经登录
//   if (to.path == "/login" || to.path == "/register"){
//     next()
//   } else {
//     islogin ? next() : next("/login")    //如果目标路由不是登录页或注册页，则根据用户是否已登录来进行进一步的判断。
//   }
// })

export default router
