export default [
    {
        name: 'Dashboard',
        path: '/dashboard',
        meta: {
            requiresAuth: true,
            rootPage: 'dashboard',
            title: 'Pagina inicial | Painel de controlo',
        },
        component: () => import('./Layout.vue')
    }
]