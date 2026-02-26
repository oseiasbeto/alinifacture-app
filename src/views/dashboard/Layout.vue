<script setup>
import { useRoute } from "vue-router"

import Home from "./pages/Home.vue";

const route = useRoute()

</script>

<template>
    <div class="relative">
        <div>
            <Home v-if="route.path == '/dashboard'" />
        </div>
    </div>
</template>