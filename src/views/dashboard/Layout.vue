<script setup>
import { useRoute, useRouter } from "vue-router"
import Cookies from "js-cookie"
import Home from "./pages/Home.vue";
import { useStore } from "vuex";
import { computed, onMounted, ref } from "vue";
import Navbar from "./components/Navbar.vue";
import Products from "./pages/Products.vue";
import Client from "./pages/Client.vue";

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
    <div v-if="!loading" class="min-h-screen bg-gray-50">
        <!-- Navbar -->
        <navbar />
        
        <!-- Conteúdo Principal -->
        <main class="pt-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <!-- Alerta de informações da empresa -->
                <div v-if="needsCompanyInfo && showCompanyAlert" class="mb-4 animate-slide-down">
                    <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm" role="alert">
                        <div class="flex items-start">
                            <div class="flex-shrink-0">
                                <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div class="ml-3 flex-1">
                                <div class="flex items-center justify-between flex-wrap">
                                    <div>
                                        <h3 class="text-sm font-medium text-red-800">
                                            Informações da empresa incompletas
                                        </h3>
                                        <div class="mt-1 text-sm text-red-700">
                                            <p>Por favor, complete o cadastro da sua empresa para utilizar todas as funcionalidades do sistema.</p>
                                            <p class="mt-1 text-xs text-red-600">
                                                <strong>NIF não informado:</strong> O NIF da empresa é obrigatório para emissão de documentos fiscais.
                                            </p>
                                        </div>
                                    </div>
                                    <div class="mt-2 sm:mt-0 flex space-x-2">
                                        <button @click="goToCompanySettings" 
                                            class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200">
                                            <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Completar cadastro
                                        </button>
                                  
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Breadcrumb simples -->
                <nav class="flex mb-6 text-sm text-gray-500">
                    <ol class="flex items-center space-x-2">
                        <li>
                            <a href="#" class="hover:text-gray-700">Dashboard</a>
                        </li>
                        <li>
                            <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5l7 7-7 7" />
                            </svg>
                        </li>
                        <li class="text-gray-700 font-medium">Home</li>
                    </ol>
                </nav>

                <!-- Conteúdo da Página -->
                <div class="">
                    <Home v-if="route.path == '/dashboard'" />
                    <Products v-if="route.path == '/dashboard/produtos'" />
                    <Client v-if="route.path == '/dashboard/clientes'" />
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