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
                <nav v-if="breadcrumbs.length" class="breadcrumb mb-6" aria-label="Breadcrumb">
                    <ol class="breadcrumb-list">
                        <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
                            <li class="breadcrumb-item">
                                <router-link v-if="!crumb.isLast" :to="crumb.path" class="crumb-link">
                                    {{ crumb.label }}
                                </router-link>
                                <span v-else class="crumb-current" aria-current="page">{{ crumb.label }}</span>
                            </li>
                            <li v-if="!crumb.isLast" class="crumb-sep" aria-hidden="true">
                                <svg viewBox="0 0 24 24">
                                    <path d="m9 18 6-6-6-6" />
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
.breadcrumb {
  --ink: #201d1a;
  --ink-soft: #4a453f;
  --paper: #faf8f3;
  --paper-line: #e7e0d3;
  --rule: #b5433c;
  font-family: 'Inter', system-ui, sans-serif;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

/* Níveis anteriores */
.crumb-link {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--ink-soft);
  transition: color 0.15s, background 0.15s;
}
.crumb-link:hover {
  color: var(--ink);
  background: var(--paper);
}
.crumb-link:focus-visible {
  outline: 2px solid var(--rule);
  outline-offset: 2px;
}

/* Página atual (mesmo tratamento do item ativo do menu) */
.crumb-current {
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--rule);
  background: #fdf1f0;
}

/* Separador */
.crumb-sep {
  display: flex;
  align-items: center;
  color: #cfc6b4;
}
.crumb-sep svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.animate-slide-down {
    animation: slideDown 0.3s ease-out;
}
</style>