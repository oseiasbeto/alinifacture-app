<template>
  <nav class="ledger-nav fixed top-0 left-0 right-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo + Eyebrow -->
        <div class="flex items-center gap-3">
          <img class="w-[56px] object-contain" src="../../../assets/logo.png" alt="Gráfica do Leste" />
          <div class="hidden sm:block brand-text">
            <p class="nav-eyebrow">Grafica do Leste</p>
            <p class="nav-sub">Painel de Gestão</p>
          </div>
        </div>

        <!-- Menu Desktop -->
        <div class="hidden lg:flex items-stretch gap-1 h-16">
          <router-link v-for="item in menuItemsVisiveis" :key="item.name" :to="item.path" :class="[
            'nav-link',
            route.path === item.path ? 'nav-link-active' : ''
          ]">
            <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
              <path v-for="(d, i) in item.icon" :key="i" :d="d" />
            </svg>
            <span>{{ item.name }}</span>
          </router-link>
        </div>

        <!-- Lado Direito -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Notificações -->
          <button class="icon-btn hidden sm:flex" aria-label="Notificações">
            <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
              <path v-for="(d, i) in icons.bell" :key="i" :d="d" />
            </svg>
            <span class="notif-dot"></span>
          </button>

          <span class="nav-divider hidden sm:block" aria-hidden="true"></span>

          <!-- Menu do Usuário -->
          <div class="relative">
            <button @click="userMenuOpen = !userMenuOpen" class="user-trigger" aria-haspopup="menu"
              :aria-expanded="userMenuOpen">
              <span class="user-avatar">{{ iniciais }}</span>
              <span class="user-text hidden lg:flex flex-col">
                <span class="user-name truncate">{{ user?.nomeCompleto }}</span>
                <span v-if="user?.cargo" class="user-role truncate">{{ user.cargo }}</span>
              </span>
              <svg class="ico chev" :class="{ 'chev-open': userMenuOpen }" viewBox="0 0 24 24" aria-hidden="true">
                <path v-for="(d, i) in icons.chevron" :key="i" :d="d" />
              </svg>
            </button>

            <!-- Dropdown do Usuário -->
            <Transition name="pop">
              <div v-if="userMenuOpen" class="user-dropdown" role="menu">
                <div class="dropdown-head">
                  <p class="dropdown-name">{{ user?.nomeCompleto || '-' }}</p>
                  <p class="dropdown-mail">{{ user?.email || '-' }}</p>
                </div>
                <div class="dropdown-rule"></div>
                <button @click="abrirPerfil" class="dropdown-item" role="menuitem">
                  <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
                    <path v-for="(d, i) in icons.user" :key="i" :d="d" />
                  </svg>
                  <span>Perfil</span>
                </button>
                <div class="dropdown-rule"></div>
                <button @click="logout" class="dropdown-item dropdown-item-danger" role="menuitem">
                  <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
                    <path v-for="(d, i) in icons.logout" :key="i" :d="d" />
                  </svg>
                  <span>Sair</span>
                </button>
              </div>
            </Transition>
          </div>

          <!-- Botão Menu Mobile -->
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="icon-btn flex lg:hidden"
            :aria-label="mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'" :aria-expanded="mobileMenuOpen">
            <svg class="ico ico-lg" viewBox="0 0 24 24" aria-hidden="true">
              <path v-for="(d, i) in (mobileMenuOpen ? icons.close : icons.menu)" :key="i" :d="d" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Menu Mobile -->
    <Transition name="slide">
      <div v-if="mobileMenuOpen" class="mobile-menu lg:hidden">
        <div class="px-4 py-3 space-y-1">
          <router-link v-for="item in menuItemsVisiveis" :key="item.name" :to="item.path" :class="[
            'mobile-link',
            route.path === item.path ? 'mobile-link-active' : ''
          ]" @click="mobileMenuOpen = false">
            <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
              <path v-for="(d, i) in item.icon" :key="i" :d="d" />
            </svg>
            <span>{{ item.name }}</span>
          </router-link>
        </div>
      </div>
    </Transition>

    <!-- Modal de Perfil -->
    <Teleport to="body">
      <Transition name="perfil-fade">
        <div v-if="perfilOpen" class="perfil-overlay" @click.self="fecharPerfil">
          <div class="perfil-modal" role="dialog" aria-modal="true" aria-labelledby="perfil-titulo">
            <!-- Cabeçalho -->
            <div class="perfil-header">
              <p class="perfil-eyebrow">Conta</p>
              <button class="perfil-close" @click="fecharPerfil" aria-label="Fechar">
                <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
                  <path v-for="(d, i) in icons.close" :key="i" :d="d" />
                </svg>
              </button>
            </div>

            <!-- Avatar + nome -->
            <div class="perfil-hero">
              <img v-if="user?.fotoPerfil" :src="user.fotoPerfil" alt="Foto de perfil" class="perfil-foto" />
              <div v-else class="perfil-avatar">{{ iniciais }}</div>
              <h3 id="perfil-titulo" class="perfil-nome">{{ user?.nomeCompleto || '-' }}</h3>
              <span class="perfil-badge" :class="user?.ativo === false ? 'perfil-badge-off' : 'perfil-badge-on'">
                <span class="perfil-badge-dot"></span>
                {{ user?.ativo === false ? 'Inativo' : 'Ativo' }}
              </span>
            </div>

            <!-- Informações -->
            <dl class="perfil-lista">
              <div class="perfil-linha">
                <span class="perfil-ico">
                  <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
                    <path v-for="(d, i) in icons.mail" :key="i" :d="d" />
                  </svg>
                </span>
                <div class="perfil-info">
                  <dt>Email</dt>
                  <dd>{{ user?.email || '-' }}</dd>
                </div>
              </div>
              <div class="perfil-linha">
                <span class="perfil-ico">
                  <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
                    <path v-for="(d, i) in icons.phone" :key="i" :d="d" />
                  </svg>
                </span>
                <div class="perfil-info">
                  <dt>Telefone</dt>
                  <dd>{{ user?.telefone || '-' }}</dd>
                </div>
              </div>
              <div class="perfil-linha">
                <span class="perfil-ico">
                  <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
                    <path v-for="(d, i) in icons.briefcase" :key="i" :d="d" />
                  </svg>
                </span>
                <div class="perfil-info">
                  <dt>Cargo</dt>
                  <dd class="capitalize">{{ user?.cargo || '-' }}</dd>
                </div>
              </div>
              <div class="perfil-linha">
                <span class="perfil-ico">
                  <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
                    <path v-for="(d, i) in icons.clock" :key="i" :d="d" />
                  </svg>
                </span>
                <div class="perfil-info">
                  <dt>Último acesso</dt>
                  <dd>{{ formatarData(user?.ultimoLogin) }}</dd>
                </div>
              </div>
            </dl>

            <div class="perfil-footer">
              <button class="perfil-btn" @click="fecharPerfil">Fechar</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import Cookies from "js-cookie"

const route = useRoute()
const store = useStore()

const user = computed(() => store.getters.currentUser)

const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)
const perfilOpen = ref(false)

const sessionId = Cookies.get("session_id")

const menuItemsVisiveis = computed(() => {
  const cargoAtual = user.value?.cargo?.toLowerCase()
  return menuItems.filter(item => {
    if (!item.cargos || item.cargos.length === 0) return true
    return cargoAtual && item.cargos.includes(cargoAtual)
  })
})

// Ícones (conjunto único, traço de 1.75px, estilo Lucide) — cada ícone é uma lista de paths
const icons = {
  dashboard: [
    'M4 3h5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z',
    'M15 3h5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z',
    'M15 12h5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z',
    'M4 16h5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z',
  ],
  produtos: [
    'm7.5 4.27 9 5.15',
    'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z',
    'm3.3 7 8.7 5 8.7-5',
    'M12 22V12',
  ],
  estoque: [
    'M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z',
    'M6 18h12',
    'M6 14h12',
    'M6 10h12v12H6z',
  ],
  clientes: [
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    'M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    'M22 21v-2a4 4 0 0 0-3-3.87',
    'M16 3.13a4 4 0 0 1 0 7.75',
  ],
  pedidos: [
    'M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z',
    'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2',
    'M12 11h4',
    'M12 16h4',
    'M8 11h.01',
    'M8 16h.01',
  ],
  bell: [
    'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9',
    'M10.3 21a1.94 1.94 0 0 0 3.4 0',
  ],
  chevron: ['m6 9 6 6 6-6'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  close: ['M18 6 6 18', 'm6 6 12 12'],
  user: [
    'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2',
    'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  ],
  logout: [
    'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4',
    'm16 17 5-5-5-5',
    'M21 12H9',
  ],
  mail: [
    'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7',
  ],
  phone: [
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
  ],
  briefcase: [
    'M4 7h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z',
    'M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2',
  ],
  clock: [
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
    'M12 6v6l4 2',
  ],
  utilizadores: [
    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2',
    'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    'M23 21v-2a4 4 0 0 0-3-3.87',
    'M16 3.13a4 4 0 0 1 0 7.75',
    'M19 8h4',
    'M21 6v4',
  ]
}

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: icons.dashboard },
  { name: 'Produtos', path: '/dashboard/produtos', icon: icons.produtos, cargos: ['administrador', 'caixa', 'estoquista'] },
  { name: 'Estoque', path: '/dashboard/estoque', icon: icons.estoque, cargos: ['administrador', 'estoquista'] },
  { name: 'Clientes', path: '/dashboard/clientes', icon: icons.clientes },
  { name: 'Pedidos', path: '/dashboard/caixa', icon: icons.pedidos, cargos: ['administrador', 'caixa', 'designer'] },
  { name: 'Utilizadores', path: '/dashboard/utilizadores', icon: icons.utilizadores, cargos: ['administrador'] },
]

// Iniciais do nome (ex.: "João Silva" -> "JS")
const iniciais = computed(() => {
  const nome = user.value?.nomeCompleto?.trim()
  if (!nome) return '??'
  const partes = nome.split(/\s+/)
  return ((partes[0]?.[0] || '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase()
})

const formatarData = (valor) => {
  if (!valor) return '-'
  return new Date(valor).toLocaleString('pt-PT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const abrirPerfil = () => {
  userMenuOpen.value = false
  perfilOpen.value = true
}

const fecharPerfil = () => {
  perfilOpen.value = false
}

// Fecha o modal com a tecla Esc
const onKeydown = (e) => {
  if (e.key === 'Escape' && perfilOpen.value) fecharPerfil()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

const logout = async () => {
  await store.dispatch("logout", sessionId)
    .then(() => {
      window.location.href = '/'
    })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

.ledger-nav {
  --ink: #201d1a;
  --ink-soft: #4a453f;
  --paper: #faf8f3;
  --paper-line: #e7e0d3;
  --rule: #b5433c;
  --ok: #2f7d53;
  font-family: 'Inter', system-ui, sans-serif;
  background: rgba(255, 255, 255, 0.94);
  -webkit-backdrop-filter: saturate(1.4) blur(8px);
  backdrop-filter: saturate(1.4) blur(8px);
  border-bottom: 1px solid var(--paper-line);
  box-shadow: 0 1px 0 var(--rule);
}

/* Ícones */
.ico {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ico-lg {
  width: 22px;
  height: 22px;
}

/* Foco visível (teclado) */
.ledger-nav :is(a, button):focus-visible,
.perfil-overlay :is(a, button):focus-visible {
  outline: 2px solid var(--rule);
  outline-offset: 2px;
}

/* Marca */
.brand-text {
  line-height: 1.15;
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
  font-size: 0.9rem;
  letter-spacing: -0.01em;
  color: var(--ink);
  margin: 0;
}

/* Links de navegação - desktop (indicador assenta na régua do rodapé) */
.nav-link {
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 64px;
  padding: 0 0.9rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ink-soft);
  transition: color 0.15s;
}

.nav-link::before {
  content: '';
  position: absolute;
  inset: 14px 0;
  z-index: -1;
  border-radius: 8px;
  background: transparent;
  transition: background 0.15s;
}

.nav-link::after {
  content: '';
  position: absolute;
  left: 0.9rem;
  right: 0.9rem;
  bottom: -1px;
  height: 2px;
  border-radius: 2px 2px 0 0;
  background: var(--rule);
  transform: scaleX(0);
  transition: transform 0.2s ease;
}

.nav-link:hover {
  color: var(--ink);
}

.nav-link:hover::before {
  background: var(--paper);
}

.nav-link-active,
.nav-link-active:hover {
  color: var(--rule);
}

.nav-link-active::before,
.nav-link-active:hover::before {
  background: #fdf1f0;
}

.nav-link-active::after {
  transform: scaleX(1);
}

/* Botão ícone (notificações / hamburguer) */
.icon-btn {
  position: relative;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  color: var(--ink-soft);
  border: 1px solid transparent;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.icon-btn:hover {
  color: var(--ink);
  background: var(--paper);
  border-color: var(--paper-line);
}

.notif-dot {
  position: absolute;
  top: 8px;
  right: 9px;
  height: 8px;
  width: 8px;
  border-radius: 50%;
  background: var(--rule);
  box-shadow: 0 0 0 2px #fff;
}

.nav-divider {
  width: 1px;
  height: 24px;
  background: var(--paper-line);
}

/* Usuário */
.user-trigger {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.25rem 0.6rem 0.25rem 0.25rem;
  border: 1px solid var(--paper-line);
  border-radius: 999px;
  background: #fff;
  transition: background 0.15s, border-color 0.15s;
}

.user-trigger:hover,
.user-trigger[aria-expanded='true'] {
  background: var(--paper);
  border-color: #d8cfbe;
}

.user-avatar {
  height: 32px;
  width: 32px;
  flex-shrink: 0;
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

.user-text {
  align-items: flex-start;
  max-width: 150px;
  min-width: 0;
  line-height: 1.2;
  text-align: left;
}

.user-name {
  max-width: 100%;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ink);
}

.user-role {
  max-width: 100%;
  font-size: 0.7rem;
  color: var(--ink-soft);
  text-transform: capitalize;
}

.chev {
  width: 16px;
  height: 16px;
  color: var(--ink-soft);
  transition: transform 0.2s ease;
}

.chev-open {
  transform: rotate(180deg);
}

/* Dropdown */
.user-dropdown {
  position: absolute;
  right: 0;
  margin-top: 0.6rem;
  width: 240px;
  background: #fff;
  border: 1px solid var(--paper-line);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(32, 29, 26, 0.14);
  padding: 0.35rem;
  z-index: 50;
  transform-origin: top right;
}

.dropdown-head {
  padding: 0.6rem 0.65rem;
}

.dropdown-name {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-mail {
  margin: 0.1rem 0 0;
  font-size: 0.75rem;
  color: var(--ink-soft);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  text-align: left;
  padding: 0.55rem 0.65rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--ink-soft);
  transition: background 0.15s, color 0.15s;
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
  color: var(--rule);
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
  box-shadow: 0 14px 24px -14px rgba(32, 29, 26, 0.2);
}

.mobile-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--ink-soft);
  transition: background 0.15s, color 0.15s;
}

.mobile-link:hover {
  background: #fff;
  color: var(--ink);
}

.mobile-link-active,
.mobile-link-active:hover {
  color: var(--rule);
  background: #fdf1f0;
}

.mobile-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--rule);
}

/* Modal de perfil (variáveis redefinidas porque o modal é teletransportado para o body) */
.perfil-overlay {
  --ink: #201d1a;
  --ink-soft: #4a453f;
  --paper: #faf8f3;
  --paper-line: #e7e0d3;
  --rule: #b5433c;
  --ok: #2f7d53;
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(32, 29, 26, 0.5);
  backdrop-filter: blur(2px);
  font-family: 'Inter', system-ui, sans-serif;
}

.perfil-modal {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border: 1px solid var(--paper-line);
  border-top: 3px solid var(--rule);
  border-radius: 14px;
  box-shadow: 0 24px 60px rgba(32, 29, 26, 0.28);
  overflow: hidden;
}

.perfil-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.1rem 0;
}

.perfil-eyebrow {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--rule);
  margin: 0;
}

.perfil-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: var(--ink-soft);
  transition: background 0.15s, color 0.15s;
}

.perfil-close:hover {
  background: var(--paper);
  color: var(--ink);
}

.perfil-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  padding: 0.75rem 1.25rem 1.35rem;
  border-bottom: 1px dashed var(--paper-line);
}

.perfil-avatar,
.perfil-foto {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  box-shadow: 0 0 0 4px #fff, 0 0 0 5px var(--paper-line);
}

.perfil-avatar {
  background: var(--ink);
  color: var(--paper);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 600;
  font-size: 1.5rem;
}

.perfil-foto {
  object-fit: cover;
}

.perfil-nome {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: -0.01em;
  color: var(--ink);
  margin: 0.5rem 0 0;
  text-align: center;
}

.perfil-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
}

.perfil-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.perfil-badge-on {
  color: var(--ok);
  background: #eaf5ef;
}

.perfil-badge-off {
  color: var(--rule);
  background: #fdf1f0;
}

.perfil-lista {
  margin: 0;
  padding: 0.5rem 1.25rem;
}

.perfil-linha {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--paper-line);
}

.perfil-linha:last-child {
  border-bottom: none;
}

.perfil-ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 9px;
  background: var(--paper);
  border: 1px solid var(--paper-line);
  color: var(--ink-soft);
}

.perfil-ico .ico {
  width: 16px;
  height: 16px;
}

.perfil-info {
  min-width: 0;
}

.perfil-info dt {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.perfil-info dd {
  margin: 0.1rem 0 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--ink);
  word-break: break-word;
}

.perfil-footer {
  padding: 0.75rem 1.25rem 1.1rem;
  background: var(--paper);
  border-top: 1px solid var(--paper-line);
  display: flex;
  justify-content: flex-end;
}

.perfil-btn {
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  background: var(--ink);
  color: var(--paper);
  font-size: 0.85rem;
  font-weight: 500;
  transition: opacity 0.15s;
}

.perfil-btn:hover {
  opacity: 0.85;
}

/* Animações (respondem a uma ação do utilizador) */
.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.perfil-fade-enter-active,
.perfil-fade-leave-active {
  transition: opacity 0.18s ease;
}

.perfil-fade-enter-active .perfil-modal,
.perfil-fade-leave-active .perfil-modal {
  transition: transform 0.18s ease;
}

.perfil-fade-enter-from,
.perfil-fade-leave-to {
  opacity: 0;
}

.perfil-fade-enter-from .perfil-modal,
.perfil-fade-leave-to .perfil-modal {
  transform: translateY(10px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {

  .ledger-nav *,
  .perfil-overlay,
  .perfil-overlay * {
    transition: none !important;
  }
}
</style>