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
    },
    {
        name: 'Products',
        path: '/dashboard/produtos',
        meta: {
            requiresAuth: true,
            rootPage: 'dashboard',
            title: 'Produtos | Painel de controlo',
        },
        component: () => import('./Layout.vue')
    },
    {
        name: 'Clients',
        path: '/dashboard/clientes',
        meta: {
            requiresAuth: true,
            rootPage: 'dashboard',
            title: 'Clientes | Painel de controlo',
        },
        component: () => import('./Layout.vue')
    }
]