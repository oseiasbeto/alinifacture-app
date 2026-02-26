export default [
    {
        name: 'Login',
        path: '/auth/login',
        meta: {
            routeAuth: true,
            rootPage: 'auth',
            title: 'Login - Alinifacture'
        },
        component: () => import('./Layout.vue')
    },
     {
        name: 'Registro',
        path: '/auth/registro',
        meta: {
            routeAuth: true,
            rootPage: 'auth',
            title: 'Registro - Alinifacture'
        },
        component: () => import('./Layout.vue')
    }
]