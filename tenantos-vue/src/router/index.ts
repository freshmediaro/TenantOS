import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/packages'
    },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
    { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue') },
    { path: '/forgot', name: 'forgot', component: () => import('../views/ForgotPasswordView.vue') },
    { path: '/2fa-email', name: 'twofaEmail', component: () => import('../views/TwoFAEmailView.vue') },
    { path: '/verify', name: 'verify', component: () => import('../views/VerifyView.vue') },
    { path: '/platform', name: 'platform', component: () => import('../views/PlatformView.vue') },
    {
        path: '/packages',
        name: 'packages',
        component: () => import('../views/PackagesView.vue')
    },
    {
        path: '/domain',
        name: 'domain',
        component: () => import('../views/DomainView.vue')
    },
    { path: '/os', name: 'os', component: () => import('../views/OsView.vue') },
    { path: '/cart', name: 'cart', component: () => import('../views/CartView.vue') },
    { path: '/billing', name: 'billing', component: () => import('../views/BillingView.vue') },
    { path: '/payment', name: 'payment', component: () => import('../views/PaymentView.vue') },
    { path: '/payment-confirmation', name: 'paymentConfirmation', component: () => import('../views/PaymentConfirmationView.vue') },
    { path: '/confirmation', name: 'confirmation', component: () => import('../views/ConfirmationView.vue') },
    { path: '/views-setup', name: 'viewsSetup', component: () => import('../views/ViewsSetupView.vue') }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router

