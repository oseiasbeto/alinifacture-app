<template>
    <nav class="ledger-nav fixed top-0 left-0 right-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <!-- Logo + Eyebrow -->
                <div class="flex items-center gap-3">
                    <img class="w-[56px]" src="../../../assets/logo.png" />
                    <div class="hidden sm:block leading-tight">
                        <p class="nav-eyebrow">Grafica do Leste</p>
                        <p class="nav-sub">Painel de Gestão</p>
                    </div>
                </div>

                <!-- Menu Desktop -->
                <div class="hidden md:flex items-center gap-1">
                    <router-link v-for="item in menuItems" :key="item.name" :to="item.path" :class="[
                        'nav-link',
                        route.path === item.path ? 'nav-link-active' : ''
                    ]">
                        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" :d="item.icon" />
                        </svg>
                        <span>{{ item.name }}</span>
                    </router-link>
                </div>

                <!-- Lado Direito -->
                <div class="flex items-center gap-3">
                    <!-- Notificações -->
                    <button class="icon-btn hidden sm:flex">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span class="notif-dot"></span>
                    </button>

                    <!-- Menu do Usuário -->
                    <div class="relative">
                        <button @click="userMenuOpen = !userMenuOpen" class="user-trigger">
                            <div class="user-avatar">AD</div>
                            <span class="hidden truncate lg:block user-name">
                                {{ user?.nomeCompleto }}
                            </span>
                            <svg class="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <!-- Dropdown do Usuário -->
                        <div v-if="userMenuOpen" class="user-dropdown">
                            <a href="#" class="dropdown-item">Perfil</a>
                            <div class="dropdown-rule"></div>
                            <button @click="logout" class="dropdown-item dropdown-item-danger">Sair</button>
                        </div>
                    </div>

                    <!-- Botão Menu Mobile -->
                    <button @click="mobileMenuOpen = !mobileMenuOpen" class="icon-btn lg:hidden">
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
        <div v-if="mobileMenuOpen" class="mobile-menu md:hidden">
            <div class="px-4 py-3 space-y-1">
                <router-link v-for="item in menuItems" :key="item.name" :to="item.path" :class="[
                    'mobile-link',
                    route.path === item.path ? 'mobile-link-active' : ''
                ]" @click="mobileMenuOpen = false">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" :d="item.icon" />
                    </svg>
                    <span>{{ item.name }}</span>
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
    {
        name: 'Dashboard',
        path: '/dashboard',
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
    },
    {
        name: 'Produtos',
        path: '/dashboard/produtos',
        icon: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z'
    },
    {
        name: 'Estoque',
        path: '/dashboard/estoque',
        icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6.75 5.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z'
    },
    {
        name: 'Clientes',
        path: '/dashboard/clientes',
        icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
    },
    {
        name: 'Caixa',
        path: '/dashboard/caixa',
        icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z'
    },
    {
        name: 'Financeiro',
        path: '/dashboard/financeiro',
        icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    }
]

const logout = async () => {
    await store.dispatch("logout", sessionId)
        .then(() => {
            window.location.href = '/auth/login'
        })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

.ledger-nav {
  --ink: #201d1a;
  --ink-soft: #4a453f;
  --paper: #faf8f3;
  --paper-line: #e7e0d3;
  --rule: #b5433c;
  --ok: #2f7d53;
  font-family: 'Inter', system-ui, sans-serif;
  background: #fff;
  border-bottom: 1px solid var(--paper-line);
  box-shadow: 0 1px 0 var(--rule);
}

.nav-eyebrow {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--rule);
  margin: 0;
}

.nav-sub {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--ink);
  margin: 0;
}

/* Links de navegação - desktop */
.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.8rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--ink-soft);
  transition: color 0.15s, background 0.15s;
}
.nav-link:hover {
  color: var(--ink);
  background: var(--paper);
}
.nav-link-active {
  color: var(--rule);
  background: #fdf1f0;
}
.nav-link-active .nav-icon {
  filter: none;
}

.nav-icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

/* Botão ícone (notificações / hamburguer) */
.icon-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: var(--ink-soft);
  border: 1px solid transparent;
  transition: all 0.15s;
}
.icon-btn:hover {
  color: var(--ink);
  background: var(--paper);
  border-color: var(--paper-line);
}

.notif-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  height: 7px;
  width: 7px;
  border-radius: 50%;
  background: var(--rule);
  box-shadow: 0 0 0 2px #fff;
}

/* Usuário */
.user-trigger {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.user-avatar {
  height: 32px;
  width: 32px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--paper);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 600;
  font-size: 0.75rem;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--ink);
}

.user-dropdown {
  position: absolute;
  right: 0;
  margin-top: 0.5rem;
  width: 180px;
  background: #fff;
  border: 1px solid var(--paper-line);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(32, 29, 26, 0.1);
  padding: 0.35rem 0;
  z-index: 50;
}

.dropdown-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.dropdown-item:hover {
  background: var(--paper);
  color: var(--ink);
}
.dropdown-item-danger {
  color: var(--rule);
}
.dropdown-item-danger:hover {
  background: #fdf1f0;
}

.dropdown-rule {
  height: 1px;
  margin: 0.3rem 0;
  border-top: 1px dashed var(--paper-line);
}

/* Menu Mobile */
.mobile-menu {
  border-top: 1px solid var(--paper-line);
  background: var(--paper);
}

.mobile-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--ink-soft);
}
.mobile-link:hover {
  background: #fff;
  color: var(--ink);
}
.mobile-link-active {
  color: var(--rule);
  background: #fdf1f0;
}
</style>