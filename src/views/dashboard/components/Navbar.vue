<template>
    <nav class="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <!-- Logo -->
                <div class="flex items-center">
                   <img class="w-[64px]" src="../../../assets/palheta.png">
                </div>

                <!-- Menu Desktop -->
                <div class="hidden md:flex items-center space-x-8">
                    <a v-for="item in menuItems" :key="item.name" :href="item.path" :class="[
                        'text-sm font-medium transition-colors duration-200',
                        route.path === item.path
                            ? 'text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                    ]">
                        <span class="flex items-center space-x-1">
                            <span>{{ item.icon }}</span>
                            <span>{{ item.name }}</span>
                        </span>
                    </a>
                </div>

                <!-- Lado Direito -->
                <div class="flex items-center space-x-4">
                    <!-- Notificações -->
                    <button
                        class="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg relative hidden sm:block">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span class="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    </button>

                    <!-- Menu do Usuário -->
                    <div class="relative">
                        <button @click="userMenuOpen = !userMenuOpen"
                            class="flex items-center space-x-3 focus:outline-none">
                            <div
                                class="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                                AD
                            </div>
                            <span class="hidden truncate lg:block text-sm font-medium text-gray-700">
                                {{ user?.nomeCompleto }}
                            </span>
                            <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <!-- Dropdown do Usuário -->
                        <div v-if="userMenuOpen"
                            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200 z-50">
                            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Perfil</a>
                            <div class="border-t border-gray-100"></div>
                            <button @click="logout"
                                class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Sair</button>
                        </div>
                    </div>

                    <!-- Botão Menu Mobile -->
                    <button @click="mobileMenuOpen = !mobileMenuOpen"
                        class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Menu Mobile -->
        <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-200">
            <div class="px-4 py-3 space-y-1">
                <router-link v-for="item in menuItems" :key="item.name" :to="item.path" :class="[
                    'block px-3 py-2 rounded-md text-base font-medium',
                    route.path === item.path
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                ]">
                    <span class="flex items-center space-x-2">
                        <span>{{ item.icon }}</span>
                        <span>{{ item.name }}</span>
                    </span>
                </router-link>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import Cookies from "js-cookie"

const route = useRoute()
const store = useStore()

const user = computed(() => store.getters.currentUser)

const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)

const sessionId = Cookies.get("session_id")

const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Produtos', path: '/dashboard/produtos', icon: '📦' },
    { name: 'Clientes', path: '/dashboard/clientes', icon: '👥' },
    { name: 'Financeiro', path: '/dashboard/financeiro', icon: '💰' }
]

const logout = async () => {
    await store.dispatch("logout", sessionId)
        .then(() => {
            window.location.href = '/auth/login'
        })

}
</script>