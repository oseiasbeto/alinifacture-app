<script setup>
import { useRoute } from "vue-router"

import Login from "./pages/Login.vue";
import Register from "./pages/Register.vue";

const route = useRoute()

</script>

<template>
    <div class="relative">
        <div>
            <Login v-if="route.name == 'Login'" />
            <Register v-if="route.name == 'Registro'" />
        </div>
    </div>
</template>