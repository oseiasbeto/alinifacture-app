<script setup>
import { useRoute, useRouter } from "vue-router"
import Cookies from "js-cookie"
import Home from "./pages/Home.vue";
import { useStore } from "vuex";
import { computed, onMounted, ref } from "vue";
import Navbar from "./components/Navbar.vue";
import Produtos from "./pages/Produtos.vue";
import Caixa from "./pages/Caixa.vue";
import Clientes from "./pages/Clientes.vue";
import Produto from "./pages/Produto.vue";
import Estoque from "./pages/Estoque.vue";

const route = useRoute()
const router = useRouter()
const store = useStore()
const loading = ref(true)
const sessionId = Cookies.get("session_id")
const showCompanyAlert = ref(true)

const user = computed(() => store.getters.currentUser)

const accessToken = computed(() => store.getters?.accessToken || null)
const isAuthenticated = computed(() => accessToken?.value ? true : false)

const needsCompanyInfo = computed(() => {
    return user.value?.empresa?.nif === null || user.value?.empresa?.nif === undefined
})

// Rótulos amigáveis para cada segmento de rota conhecido.
// Chave = caminho acumulado (ex: '/dashboard/produtos'), valor = label exibido.
const routeLabels = {
    '/dashboard': 'Dashboard',
    '/dashboard/produtos': 'Produtos',
    '/dashboard/clientes': 'Clientes',
    '/dashboard/estoque': 'Estoque',
    '/dashboard/caixa': 'Caixa',
    '/dashboard/financeiro': 'Financeiro',
    '/configuracoes/empresa': 'Configurações da Empresa'
}

const capitalizar = (texto) => {
    return decodeURIComponent(texto)
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
}

// Monta o breadcrumb dinamicamente a partir do path atual.
// - usa route.meta.breadcrumb quando definido na rota (ex: nome do produto)
// - senão usa o mapa estático routeLabels
// - senão capitaliza o segmento (ex: um :id vira "Id")
const breadcrumbs = computed(() => {
    const segments = route.path.split('/').filter(Boolean)
    let acumulado = ''

    return segments.map((segmento, index) => {
        acumulado += `/${segmento}`
        const isLast = index === segments.length - 1

        let label = routeLabels[acumulado] || capitalizar(segmento)

        // Permite que uma rota específica (ex: detalhes de produto) sobrescreva
        // o rótulo do último crumb via route.meta.breadcrumb
        if (isLast && route.meta?.breadcrumb) {
            label = route.meta.breadcrumb
        }

        return { label, path: acumulado, isLast }
    })
})

const initializeAuthFlow = async () => {
    try {
        if (sessionId) {
            await store.dispatch("refreshToken", sessionId);
        }
    } catch (error) {
        console.error('Auth error:', error);
    } finally {
        loading.value = false;
    }
}

const dismissAlert = () => {
    showCompanyAlert.value = false
}

const goToCompanySettings = () => {
    router.push('/configuracoes/empresa')
}

onMounted(async () => {
    if (!isAuthenticated.value) {
        await initializeAuthFlow();
    } else {
        loading.value = false;
    }
});
</script>

<template>
    <div v-if="!loading" class="min-h-screen bg-[#faf8f3]">
        <!-- Navbar -->
        <navbar />

        <!-- Conteúdo Principal -->
        <main class="pt-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                <!-- Breadcrumb dinâmico -->
                <nav v-if="breadcrumbs.length" class="flex mb-6 text-sm text-gray-500">
                    <ol class="flex items-center flex-wrap gap-2">
                        <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
                            <li>
                                <router-link v-if="!crumb.isLast" :to="crumb.path" class="hover:text-gray-700">
                                    {{ crumb.label }}
                                </router-link>
                                <span v-else class="text-gray-700 font-medium">{{ crumb.label }}</span>
                            </li>
                            <li v-if="!crumb.isLast">
                                <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                            </li>
                        </template>
                    </ol>
                </nav>

                <!-- Conteúdo da Página -->
                <div class="">
                    <Home v-if="route.path == '/dashboard'" />
                    <Produtos v-if="route.path == '/dashboard/produtos'" />
                    <Produto v-if="route.name == 'DetalhesProduto'" />
                    <Clientes v-if="route.path == '/dashboard/clientes'" />
                    <Estoque v-if="route.path == '/dashboard/estoque'" />
                    <Caixa v-if="route.path == '/dashboard/caixa'" />
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-slide-down {
    animation: slideDown 0.3s ease-out;
}
</style>