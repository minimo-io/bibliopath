import Vue from 'vue'
import Home from '../views/Home.vue'
import VueRouter from 'vue-router'
import store from '@/store'
// import { IonicVueRouter } from '@ionic/vue';
Vue.use(VueRouter)
// Vue.use(IonicVueRouter);

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "About" */ '../views/About.vue')
  },
  {
    path: '/catalog',
    name: 'Catalog',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "Catalog" */ '../views/Catalog.vue')
  },
  {
    path: '/author/:slug',
    name: 'Author',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "Authors" */ '../views/Author.vue')
  },
  {
    path: '/book/:slug',
    name: 'Book',
    component: () => import(/* webpackChunkName: "Book2" */ '../components/Book2.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  },
  routes
})

router.beforeResolve((to, from, next) => {

  if (to.name) {
      store.commit("setLoading");
  }
  next()
})
router.afterEach((to, from) => {
  store.commit("setNotLoading");
})

export default router
