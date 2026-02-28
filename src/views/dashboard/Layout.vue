<script setup>
import { useRoute } from "vue-router"

import Cookies from "js-cookie"
import Home from "./pages/Home.vue";
import { useStore } from "vuex";
import { computed, onMounted, ref } from "vue";

const route = useRoute()
const store = useStore()
const loading = ref(true)
const sessionId = Cookies.get("session_id")
const accessToken = computed(() => store.getters?.accessToken || null)
const isAuthenticated = computed(() => accessToken?.value ? true : false)

const initializeAuthFlow = async () => {
    try {
        if (sessionId) {
            await store.dispatch("refreshToken", sessionId);
        } else {
            loading.value = false;
        }
    } catch (error) {
        console.error('Auth error:', error);
    } finally {
        loading.value = false;
    }
}

onMounted(async () => {z
    if (!isAuthenticated.value) {
        await initializeAuthFlow();
    } else {
        loading.value = false;
    }
});
</script>

<template>
    <div v-if="!loading" class="relative">
        <div>
            <Home v-if="route.path == '/dashboard'" />
        </div>
    </div>
</template>