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
        name: 'DetalhesProduto',
        path: '/dashboard/produtos/:id',
        meta: {
            requiresAuth: true,
            rootPage: 'dashboard',
            title: 'Detalhes do produto | Painel de controlo',
        },
        component: () => import('./Layout.vue')
    },
    {
        name: 'Stock',
        path: '/dashboard/estoque',
        meta: {
            requiresAuth: true,
            rootPage: 'dashboard',
            title: 'Estoque | Painel de controlo',
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