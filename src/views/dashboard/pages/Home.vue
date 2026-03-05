<template>
    <!-- Cards de Resumo -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Faturamento</p>
                    <p class="text-xl font-semibold text-gray-900 mt-1">Kz 0</p>
                </div>
                <div class="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">
                    📈
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Clientes</p>
                    <p class="text-xl font-semibold text-gray-900 mt-1">1.234</p>
                </div>
                <div class="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                    👥
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Produtos</p>
                    <p class="text-xl font-semibold text-gray-900 mt-1">0</p>
                </div>
                <div class="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center text-xl">
                    📦
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Pendentes</p>
                    <p class="text-xl font-semibold text-gray-900 mt-1">Kz 0</p>
                </div>
                <div class="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center text-xl">
                    ⏳
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>

import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore()
const user = computed(() => store.getters.currentUser)
</script>