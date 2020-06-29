import Vue from 'vue'
import { IonicVueRouter } from '@ionic/vue'
// import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(IonicVueRouter)

  const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: "/new-item",
    name: "new-item",
    component: () =>
      import(/* webpackChunkName: "new-item" */ "@/components/NewItemPage.vue"),
  }
]

const router = new IonicVueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
