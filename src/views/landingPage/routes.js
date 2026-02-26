export default [
    {
        name: 'Page not found',
        path: '/:catchAll(.*)',
        meta: {
            requiresAuth: false,
            rootPage: 'landingPage',
            title: '404 - Página não encontrada'
        },
        component: () => import('./Layout.vue')
    },
    {
        name: 'Landing Page',
        path: '/',
        meta: {
            requiresAuth: false,
            rootPage: 'landingPage',
            title: 'Alinifacture - Sistema de facturação'
        },
        component: () => import('./Layout.vue')
    }
]