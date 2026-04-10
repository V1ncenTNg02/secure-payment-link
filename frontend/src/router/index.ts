import { createRouter, createWebHistory } from 'vue-router'
import CreatePaymentLink from '../views/CreatePaymentLink.vue'
import ClaimPaymentLink from '../views/ClaimPaymentLink.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: CreatePaymentLink },
    { path: '/pay/:token', component: ClaimPaymentLink },
  ],
})

export default router
