import { createRouter, createWebHistory } from 'vue-router'
import routes from "./routes"
import Cookies from "js-cookie"

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title}`
  window.scrollTo(0, 0)
  const token = Cookies.get("session_id")
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      next({ path: "/conta/login", query: { r: to.fullPath } });
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.routeAuth)) {
    if (token) {
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router