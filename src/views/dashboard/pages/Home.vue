<template>
    <h1>Dashboard - home</h1>
    <p>{{ `Olá, ${user?.nomeCompleto || 'visitante'}!` }}</p>
    <button @click="handleLogout">Logout</button>
</template>

<script setup>
import Cookies from "js-cookie"
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore()
const user = computed(() => store.getters.currentUser)


const handleLogout = async () => {
    const sessionId = Cookies.get("session_id")
    await store.dispatch("logout", sessionId)
    .then(() => {
        window.location.href = '/auth/login'
    })
}
</script>