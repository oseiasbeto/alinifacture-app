<template>
  <div class="ledger-scope space-y-6">
    <!-- Cabeçalho -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="ledger-title">Utilizadores</h1>
        <p class="text-sm text-stone-500 mt-1">Contas de acesso ao sistema e respectivos cargos</p>
      </div>
      <button class="btn-primary" @click="abrirModalNovo">+ Novo Utilizador</button>
    </div>

    <!-- Cartões de resumo -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" v-if="resumo">
      <div class="stat-card stat-blue">
        <span class="stat-tab"></span>
        <p class="stat-label">Total de utilizadores</p>
        <p class="stat-value">{{ resumo.total }}</p>
      </div>
      <div class="stat-card stat-emerald">
        <span class="stat-tab"></span>
        <p class="stat-label">Ativos</p>
        <p class="stat-value">{{ resumo.ativos }}</p>
      </div>
      <div class="stat-card stat-rose">
        <span class="stat-tab"></span>
        <p class="stat-label">Inativos</p>
        <p class="stat-value">{{ resumo.inativos }}</p>
      </div>
      <div class="stat-card stat-amber">
        <span class="stat-tab"></span>
        <p class="stat-label">Administradores</p>
        <p class="stat-value">{{ resumo.porCargo.administrador }}</p>
      </div>
    </div>

    <!-- Abas de cargo -->
    <div class="tabs-bar">
      <button v-for="c in cargoAbas" :key="c.valor" class="tab-btn" :class="{ active: filtros.cargo === c.valor }"
        @click="mudarCargoAba(c.valor)">
        {{ c.label }}
        <span v-if="resumo && c.valor" class="tab-count">{{ resumo.porCargo[c.valor] ?? 0 }}</span>
      </button>
    </div>

    <!-- Abas de status + busca -->
    <div class="tabs-bar">
      <button v-for="s in statusAbas" :key="s.valor" class="tab-btn tab-btn-sm" :class="{ active: filtros.ativo === s.valor }"
        @click="mudarStatusAba(s.valor)">
        {{ s.label }}
      </button>

      <div class="relative flex-1 min-w-[200px] ml-auto">
        <input type="text" v-model="filtros.busca" placeholder="Buscar por nome ou email..." class="ledger-input pl-9" />
        <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <div v-if="filtrosAtivos" class="filtro-ativo">
      <span>Filtros aplicados</span>
      <button @click="limparFiltros">Limpar filtros</button>
    </div>

    <!-- Tabela -->
    <div class="ledger-panel">
      <div v-if="loading" class="p-10 text-center text-stone-500">
        <div class="spinner"></div>
        <p class="mt-3 text-sm">Carregando utilizadores...</p>
      </div>
      <div v-else-if="error" class="p-6 text-center text-rule">{{ error }}</div>
      <div v-else-if="utilizadores.length === 0" class="p-10 text-center text-stone-500">Nenhum utilizador encontrado.</div>

      <div v-else class="overflow-x-auto">
        <table class="ledger-table w-full">
          <thead>
            <tr>
              <th class="text-left">Nome</th>
              <th class="text-left">Email</th>
              <th class="text-left">Cargo</th>
              <th class="text-left">Telefone</th>
              <th class="text-left">Status</th>
              <th class="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in utilizadores" :key="u._id">
              <td class="font-medium text-ink">{{ u.nomeProprio }} {{ u.apelido }}</td>
              <td class="text-stone-500">{{ u.email }}</td>
              <td>
                <span class="cargo-badge" :class="'badge-' + u.cargo">{{ cargoLabel(u.cargo) }}</span>
              </td>
              <td class="text-stone-500 num">{{ u.telefone || '—' }}</td>
              <td>
                <span class="status-dot" :class="u.ativo ? 'dot-ok' : 'dot-rule'"></span>
                {{ u.ativo ? 'Ativo' : 'Inativo' }}
              </td>
              <td class="text-right whitespace-nowrap">
                <button class="btn-icon" title="Ver detalhes" @click="verDetalhes(u)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button class="btn-icon" title="Editar" @click="abrirModalEditar(u)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button class="btn-icon" title="Redefinir senha" @click="confirmarRedefinirSenha(u)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                </button>
                <button class="btn-icon btn-rule" title="Eliminar" @click="confirmarEliminar(u)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="ledger-footer" v-if="pagination.totalPages > 1">
          <div>{{ pagination.totalDocs }} utilizadores</div>
          <nav class="flex gap-1">
            <button class="page-btn" :disabled="pagination.page === 1" @click="mudarPagina(pagination.page - 1)">Anterior</button>
            <button v-for="n in Math.min(7, pagination.totalPages)" :key="n" class="page-btn"
              :class="{ active: pagination.page === n }" @click="mudarPagina(n)">{{ n }}</button>
            <button class="page-btn" :disabled="!pagination.hasNextPage" @click="mudarPagina(pagination.page + 1)">Próxima</button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal Novo/Editar Utilizador -->
    <div class="modal fade" id="utilizadorModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content ledger-modal">
          <div class="modal-header">
            <h5 class="modal-title">{{ modoEdicao ? 'Editar Utilizador' : 'Novo Utilizador' }}</h5>
            <button type="button" class="btn-close" @click="fecharModal('utilizadorModal')"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="ledger-label">Nome próprio <span class="text-rule">*</span></label>
                <input type="text" class="ledger-input" v-model="form.nomeProprio" :class="{ 'input-invalid': errors.nomeProprio }" />
                <div class="error-text" v-if="errors.nomeProprio">{{ errors.nomeProprio }}</div>
              </div>
              <div class="col-md-6">
                <label class="ledger-label">Apelido</label>
                <input type="text" class="ledger-input" v-model="form.apelido" />
              </div>
              <div class="col-md-6">
                <label class="ledger-label">Email <span class="text-rule">*</span></label>
                <input type="email" class="ledger-input" v-model="form.email" :class="{ 'input-invalid': errors.email }" />
                <div class="error-text" v-if="errors.email">{{ errors.email }}</div>
              </div>
              <div class="col-md-6">
                <label class="ledger-label">Telefone</label>
                <input type="text" class="ledger-input" v-model="form.telefone" />
              </div>
              <div class="col-md-6">
                <label class="ledger-label">Cargo <span class="text-rule">*</span></label>
                <select class="ledger-input" v-model="form.cargo">
                  <option v-for="c in cargos" :key="c.valor" :value="c.valor">{{ c.label }}</option>
                </select>
              </div>
              <div class="col-md-6" v-if="modoEdicao">
                <label class="switch-label mt-4">
                  <input type="checkbox" v-model="form.ativo" class="switch-input" />
                  <span class="switch-track"><span class="switch-thumb"></span></span>
                  Conta ativa
                </label>
              </div>

              <div class="col-12" v-if="!modoEdicao">
                <div class="info-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                  A palavra-passe é gerada automaticamente e mostrada só desta vez, logo após criar a conta.
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="fecharModal('utilizadorModal')">Cancelar</button>
            <button type="button" class="btn-primary" :disabled="salvando" @click="salvarUtilizador">
              {{ salvando ? 'Salvando...' : (modoEdicao ? 'Guardar Alterações' : 'Criar Utilizador') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detalhes -->
    <div class="modal fade" id="detalhesUtilizadorModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content ledger-modal" v-if="utilizadorAtivo">
          <div class="modal-header">
            <h5 class="modal-title">{{ utilizadorAtivo.nomeProprio }} {{ utilizadorAtivo.apelido }}</h5>
            <button type="button" class="btn-close" @click="fecharModal('detalhesUtilizadorModal')"></button>
          </div>
          <div class="modal-body">
            <dl class="detalhe-grid">
              <div>
                <dt>Email</dt>
                <dd>{{ utilizadorAtivo.email }}</dd>
              </div>
              <div>
                <dt>Telefone</dt>
                <dd>{{ utilizadorAtivo.telefone || '—' }}</dd>
              </div>
              <div>
                <dt>Cargo</dt>
                <dd><span class="cargo-badge" :class="'badge-' + utilizadorAtivo.cargo">{{ cargoLabel(utilizadorAtivo.cargo) }}</span></dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <span class="status-dot" :class="utilizadorAtivo.ativo ? 'dot-ok' : 'dot-rule'"></span>
                  {{ utilizadorAtivo.ativo ? 'Ativo' : 'Inativo' }}
                </dd>
              </div>
              <div>
                <dt>Último login</dt>
                <dd>{{ utilizadorAtivo.ultimoLogin ? formatarData(utilizadorAtivo.ultimoLogin) : 'Nunca entrou' }}</dd>
              </div>
              <div>
                <dt>Criado em</dt>
                <dd>{{ formatarData(utilizadorAtivo.createdAt) }}</dd>
              </div>
            </dl>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost btn-icon-text" @click="confirmarRedefinirSenha(utilizadorAtivo)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
              Redefinir Senha
            </button>
            <button type="button" class="btn-primary" @click="abrirModalEditar(utilizadorAtivo)">Editar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Eliminação -->
    <div class="modal fade" id="confirmarEliminarModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content ledger-modal" v-if="utilizadorSelecionado">
          <div class="modal-header">
            <h5 class="modal-title">Eliminar Utilizador</h5>
            <button type="button" class="btn-close" @click="fecharModal('confirmarEliminarModal')"></button>
          </div>
          <div class="modal-body">
            Tem a certeza que deseja eliminar <strong>{{ utilizadorSelecionado.nomeProprio }}</strong>?
            <p class="text-rule mt-2 mb-0">Esta ação não pode ser desfeita — o acesso ao sistema será removido imediatamente.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="fecharModal('confirmarEliminarModal')">Cancelar</button>
            <button type="button" class="btn-danger" :disabled="eliminando" @click="eliminarUtilizador">
              {{ eliminando ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Redefinição de Senha -->
    <div class="modal fade" id="confirmarSenhaModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content ledger-modal" v-if="utilizadorSelecionado">
          <div class="modal-header">
            <h5 class="modal-title">Redefinir Palavra-passe</h5>
            <button type="button" class="btn-close" @click="fecharModal('confirmarSenhaModal')"></button>
          </div>
          <div class="modal-body">
            Gerar uma nova palavra-passe para <strong>{{ utilizadorSelecionado.nomeProprio }}</strong>?
            <p class="text-stone-500 mt-2 mb-0">A senha antiga deixa de funcionar imediatamente.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="fecharModal('confirmarSenhaModal')">Cancelar</button>
            <button type="button" class="btn-primary" :disabled="redefinindo" @click="redefinirSenha">
              {{ redefinindo ? 'Gerando...' : 'Gerar Nova Senha' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Senha Gerada (mostrada só uma vez) -->
    <div class="modal fade" id="senhaGeradaModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog">
        <div class="modal-content ledger-modal">
          <div class="modal-header">
            <h5 class="modal-title flex items-center gap-2">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
              Palavra-passe gerada
            </h5>
          </div>
          <div class="modal-body">
            <p class="text-sm text-ink mb-3">
              Guarde ou copie esta palavra-passe agora — <strong>ela não será mostrada novamente</strong>.
              Partilhe-a com o utilizador por um canal seguro.
            </p>
            <div class="senha-box">
              <span class="num">{{ senhaGeradaExibida }}</span>
              <button type="button" class="btn-ghost" @click="copiarSenha">{{ copiado ? 'Copiado!' : 'Copiar' }}</button>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-primary" @click="fecharModal('senhaGeradaModal')">Já guardei, fechar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Modal } from 'bootstrap'
import { useStore } from 'vuex'
import { toast } from 'vue3-toastify'

const store = useStore()

const cargos = [
  { valor: 'administrador', label: 'Administrador' },
  { valor: 'caixa', label: 'Caixa' },
  { valor: 'designer', label: 'Designer' },
  { valor: 'estoquista', label: 'Estoquista' },
]
const cargoLabel = (v) => cargos.find((c) => c.valor === v)?.label || v

const cargoAbas = [{ valor: '', label: 'Todos' }, ...cargos]
const statusAbas = [
  { valor: '', label: 'Todos' },
  { valor: 'true', label: 'Ativos' },
  { valor: 'false', label: 'Inativos' },
]

const filtros = ref({ busca: '', cargo: '', ativo: '', page: 1, limit: 10 })
const filtrosAtivos = computed(() => !!(filtros.value.busca || filtros.value.cargo || filtros.value.ativo))

const utilizadores = computed(() => store.getters.utilizadoresListados || [])
const pagination = computed(() => store.getters.utilizadoresPagination || {})
const loading = computed(() => store.getters.utilizadoresLoading || false)
const error = computed(() => store.getters.utilizadoresError || null)
const resumo = computed(() => store.getters.resumoUtilizadores)

const carregar = (resetPage = false) => {
  if (resetPage) filtros.value.page = 1
  return store.dispatch('listarUtilizadores', {
    page: filtros.value.page,
    limit: filtros.value.limit,
    cargo: filtros.value.cargo || undefined,
    ativo: filtros.value.ativo || undefined,
    busca: filtros.value.busca.trim() || undefined,
  })
}

const carregarResumo = () => store.dispatch('carregarResumoUtilizadores')

watch(() => filtros.value.busca, () => carregar(true))

const mudarCargoAba = (valor) => {
  filtros.value.cargo = valor
  carregar(true)
}

const mudarStatusAba = (valor) => {
  filtros.value.ativo = valor
  carregar(true)
}

const limparFiltros = () => {
  filtros.value.busca = ''
  filtros.value.cargo = ''
  filtros.value.ativo = ''
  carregar(true)
}

onMounted(async () => {
  await Promise.all([carregar(), carregarResumo()])
})

const mudarPagina = (n) => {
  if (n < 1 || n > pagination.value.totalPages) return
  filtros.value.page = n
  carregar()
}

const fecharModal = (id) => {
  const el = document.getElementById(id)
  const instance = el && Modal.getInstance(el)
  if (instance) instance.hide()
}

// --- Criar/Editar ---
const form = ref({ nomeProprio: '', apelido: '', email: '', telefone: '', cargo: 'estoquista', ativo: true })
const errors = ref({})
const salvando = ref(false)
const modoEdicao = ref(false)
const utilizadorSelecionado = ref(null)

const resetForm = () => {
  form.value = { nomeProprio: '', apelido: '', email: '', telefone: '', cargo: 'estoquista', ativo: true }
  errors.value = {}
  modoEdicao.value = false
  utilizadorSelecionado.value = null
}

const abrirModalNovo = () => {
  resetForm()
  new Modal(document.getElementById('utilizadorModal')).show()
}

const abrirModalEditar = (u) => {
  fecharModal('detalhesUtilizadorModal')
  modoEdicao.value = true
  utilizadorSelecionado.value = u
  form.value = {
    nomeProprio: u.nomeProprio,
    apelido: u.apelido || '',
    email: u.email,
    telefone: u.telefone || '',
    cargo: u.cargo,
    ativo: u.ativo,
  }
  errors.value = {}
  new Modal(document.getElementById('utilizadorModal')).show()
}

const validar = () => {
  errors.value = {}
  if (!form.value.nomeProprio?.trim()) errors.value.nomeProprio = 'Nome obrigatório'
  if (!form.value.email?.trim()) errors.value.email = 'Email obrigatório'
  else if (!/^\S+@\S+\.\S+$/.test(form.value.email.trim())) errors.value.email = 'Email inválido'
  return Object.keys(errors.value).length === 0
}

// --- Modal de senha gerada (partilhado entre criação e redefinição) ---
const senhaGeradaExibida = ref('')
const copiado = ref(false)

const mostrarSenhaGerada = (senha) => {
  senhaGeradaExibida.value = senha
  copiado.value = false
  new Modal(document.getElementById('senhaGeradaModal')).show()
}

const copiarSenha = async () => {
  try {
    await navigator.clipboard.writeText(senhaGeradaExibida.value)
    copiado.value = true
    setTimeout(() => { copiado.value = false }, 2000)
  } catch (err) {
    toast('Não foi possível copiar automaticamente — selecione e copie manualmente', { type: 'warning', autoClose: 3000 })
  }
}

const salvarUtilizador = async () => {
  if (!validar()) return
  salvando.value = true
  try {
    if (modoEdicao.value) {
      await store.dispatch('atualizarUtilizador', {
        id: utilizadorSelecionado.value._id,
        payload: {
          nomeProprio: form.value.nomeProprio.trim(),
          apelido: form.value.apelido?.trim() || undefined,
          email: form.value.email.trim(),
          telefone: form.value.telefone?.trim() || undefined,
          cargo: form.value.cargo,
          ativo: form.value.ativo,
        },
      })
      toast('Utilizador atualizado com sucesso!', { type: 'success', autoClose: 2500 })
      fecharModal('utilizadorModal')
    } else {
      const resultado = await store.dispatch('criarUtilizador', {
        nomeProprio: form.value.nomeProprio.trim(),
        apelido: form.value.apelido?.trim() || undefined,
        email: form.value.email.trim(),
        telefone: form.value.telefone?.trim() || undefined,
        cargo: form.value.cargo,
      })
      toast('Utilizador criado com sucesso!', { type: 'success', autoClose: 2500 })
      fecharModal('utilizadorModal')
      mostrarSenhaGerada(resultado.senhaGerada)
    }
    await Promise.all([carregar(), carregarResumo()])
  } catch (err) {
    toast(err.response?.data?.message || 'Erro ao salvar utilizador', { type: 'error', autoClose: 3000 })
  } finally {
    salvando.value = false
  }
}

// --- Detalhes ---
const utilizadorAtivo = ref(null)
const verDetalhes = async (u) => {
  try {
    utilizadorAtivo.value = await store.dispatch('getUtilizador', u._id)
    new Modal(document.getElementById('detalhesUtilizadorModal')).show()
  } catch (err) {
    toast('Não foi possível carregar os detalhes', { type: 'error', autoClose: 2500 })
  }
}

// --- Redefinir senha ---
const redefinindo = ref(false)
const confirmarRedefinirSenha = (u) => {
  fecharModal('detalhesUtilizadorModal')
  utilizadorSelecionado.value = u
  new Modal(document.getElementById('confirmarSenhaModal')).show()
}

const redefinirSenha = async () => {
  redefinindo.value = true
  try {
    const resultado = await store.dispatch('redefinirSenhaUtilizador', utilizadorSelecionado.value._id)
    fecharModal('confirmarSenhaModal')
    mostrarSenhaGerada(resultado.senhaGerada)
  } catch (err) {
    toast(err.response?.data?.message || 'Erro ao redefinir senha', { type: 'error', autoClose: 2500 })
  } finally {
    redefinindo.value = false
  }
}

// --- Eliminar ---
const eliminando = ref(false)
const confirmarEliminar = (u) => {
  utilizadorSelecionado.value = u
  new Modal(document.getElementById('confirmarEliminarModal')).show()
}

const eliminarUtilizador = async () => {
  eliminando.value = true
  try {
    await store.dispatch('eliminarUtilizador', utilizadorSelecionado.value._id)
    toast('Utilizador eliminado', { type: 'success', autoClose: 2000 })
    fecharModal('confirmarEliminarModal')
    await Promise.all([carregar(), carregarResumo()])
  } catch (err) {
    toast(err.response?.data?.message || 'Erro ao eliminar utilizador', { type: 'error', autoClose: 3000 })
  } finally {
    eliminando.value = false
  }
}

const formatarData = (d) => new Date(d).toLocaleString('pt-PT')
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

.ledger-scope {
  --ink: #201d1a;
  --ink-soft: #4a453f;
  --paper: #faf8f3;
  --paper-line: #e7e0d3;
  --rule: #b5433c;
  --ok: #2f7d53;
  --amber: #b8860b;
  --blue: #2563eb;
  font-family: 'Inter', system-ui, sans-serif;
}

.ledger-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.75rem; color: var(--ink); }
.text-ink { color: var(--ink); }
.text-rule { color: var(--rule); }
.num { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }

/* Cartões de resumo */
.stat-card { position: relative; border-radius: 10px; padding: 1rem 1.1rem 0.9rem; overflow: hidden; border: 1px solid var(--paper-line); transition: transform 0.15s, box-shadow 0.15s; }
.stat-card:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
.stat-tab { position: absolute; top: 0; left: 0; width: 100%; height: 4px; }

.stat-blue { background: #eaf1ff; border-color: #c7dbff; } .stat-blue .stat-tab { background: var(--blue); } .stat-blue .stat-value { color: #1d4ed8; }
.stat-rose { background: #fff0f1; border-color: #ffd0d4; } .stat-rose .stat-tab { background: var(--rule); } .stat-rose .stat-value { color: #be123c; }
.stat-emerald { background: #ecfdf5; border-color: #bdf0d6; } .stat-emerald .stat-tab { background: var(--ok); } .stat-emerald .stat-value { color: #047857; }
.stat-amber { background: #fff8e8; border-color: #fbe2a6; } .stat-amber .stat-tab { background: var(--amber); } .stat-amber .stat-value { color: #b45309; }

.stat-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-soft); margin-top: 0.4rem; }
.stat-value { font-family: 'IBM Plex Mono', monospace; font-weight: 600; font-size: 1.5rem; color: var(--ink); margin-top: 0.15rem; }

/* Abas */
.tabs-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
.tab-btn {
  display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.9rem; border-radius: 999px;
  border: 1px solid var(--paper-line); background: #fff; font-size: 0.82rem; font-weight: 600; color: var(--ink-soft);
}
.tab-btn.active { background: var(--ink); border-color: var(--ink); color: #fff; }
.tab-btn-sm { padding: 0.4rem 0.8rem; font-size: 0.78rem; }
.tab-count { font-family: 'IBM Plex Mono', monospace; font-size: 0.7rem; background: rgba(0,0,0,0.08); padding: 0.05rem 0.4rem; border-radius: 999px; }
.tab-btn.active .tab-count { background: rgba(255,255,255,0.2); }

.filtro-ativo {
  display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
  background: #eef4ff; border: 1px solid #c7d9f6; color: #2a4b8d; font-size: 0.85rem;
  padding: 0.5rem 0.9rem; border-radius: 8px; width: fit-content;
}
.filtro-ativo button { color: #1d4e89; font-weight: 600; text-decoration: underline; }

.ledger-input {
  width: 100%; border: 1px solid var(--paper-line); background: var(--paper); border-radius: 8px;
  padding: 0.5rem 0.75rem; font-size: 0.875rem; color: var(--ink); outline: none;
}
.ledger-input:focus { border-color: var(--ink); }
.input-invalid { border-color: var(--rule) !important; }
.error-text { color: var(--rule); font-size: 0.75rem; margin-top: 0.25rem; }
.ledger-label { display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ink-soft); margin-bottom: 0.3rem; font-weight: 600; }

.search-icon { position: absolute; left: 0.65rem; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--ink-soft); }

/* Painel/tabela */
.ledger-panel { background: #fff; border: 1px solid var(--paper-line); border-radius: 12px; overflow: hidden; }
.ledger-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.ledger-table thead th { text-align: left; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-soft); background: var(--paper); padding: 0.65rem 1rem; border-bottom: 2px solid var(--ink); }
.ledger-table tbody td { padding: 0.75rem 1rem; border-bottom: 1px dashed var(--paper-line); vertical-align: middle; }
.ledger-table tbody tr:last-child td { border-bottom: none; }
.ledger-table tbody tr td:first-child { border-left: 3px solid var(--rule); }

.cargo-badge { display: inline-block; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.65rem; border-radius: 999px; }
.badge-administrador { background: #fff0f1; color: var(--rule); }
.badge-caixa { background: #ecfdf5; color: var(--ok); }
.badge-designer { background: #fff8e8; color: var(--amber); }
.badge-visualizador { background: #eaf1ff; color: var(--blue); }

.status-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 0.4rem; }
.dot-ok { background: var(--ok); }
.dot-rule { background: var(--rule); }

.btn-icon {
  width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center;
  border-radius: 6px; border: 1px solid var(--paper-line); background: #fff; color: var(--ink-soft);
  margin-left: 0.25rem; cursor: pointer;
}
.btn-icon svg { width: 15px; height: 15px; }
.btn-icon:hover { border-color: var(--ink); color: var(--ink); }
.btn-icon.btn-rule:hover { border-color: var(--rule); color: var(--rule); }

.btn-icon-text { display: inline-flex; align-items: center; gap: 0.4rem; }
.btn-icon-text svg { width: 15px; height: 15px; }

.ledger-footer { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; border-top: 1px solid var(--paper-line); background: var(--paper); font-size: 0.8rem; color: var(--ink-soft); }
.page-btn { min-width: 32px; height: 32px; padding: 0 0.6rem; border-radius: 6px; border: 1px solid var(--paper-line); background: #fff; font-size: 0.8rem; font-weight: 600; color: var(--ink-soft); }
.page-btn.active { background: var(--ink); border-color: var(--ink); color: #fff; }
.page-btn:disabled { opacity: 0.45; }

.btn-primary { background: var(--ink); color: #fff; border: 1px solid var(--ink); border-radius: 8px; padding: 0.55rem 1.1rem; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.btn-primary:disabled { opacity: 0.55; }
.btn-danger { background: var(--rule); color: #fff; border: 1px solid var(--rule); border-radius: 8px; padding: 0.55rem 1.1rem; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.btn-danger:disabled { opacity: 0.55; }
.btn-ghost { background: transparent; border: 1px solid var(--paper-line); color: var(--ink-soft); border-radius: 8px; padding: 0.5rem 0.9rem; font-size: 0.82rem; font-weight: 600; cursor: pointer; }
.btn-ghost:hover { border-color: var(--ink); color: var(--ink); }

.info-box {
  display: flex; align-items: flex-start; gap: 0.5rem;
  background: #eaf1ff; border: 1px solid #c7dbff; color: #1d4ed8; font-size: 0.8rem; padding: 0.6rem 0.85rem; border-radius: 8px;
}
.info-box svg { width: 16px; height: 16px; flex-shrink: 0; margin-top: 0.1rem; }

.senha-box {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  background: var(--paper); border: 1px dashed var(--paper-line); border-radius: 8px; padding: 0.9rem 1rem;
}
.senha-box .num { font-size: 1.1rem; font-weight: 600; letter-spacing: 0.05em; }

/* Switch */
.switch-label { display: inline-flex; align-items: center; gap: 0.65rem; font-size: 0.875rem; color: var(--ink-soft); cursor: pointer; }
.switch-input { position: absolute; opacity: 0; width: 0; height: 0; }
.switch-track { position: relative; width: 38px; height: 22px; background: #cbd5e1; border-radius: 999px; transition: background 0.2s; flex-shrink: 0; }
.switch-thumb { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; background: #fff; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
.switch-input:checked + .switch-track { background: var(--ink); }
.switch-input:checked + .switch-track .switch-thumb { transform: translateX(16px); }

/* Detalhes */
.detalhe-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 1rem 1.5rem; }
.detalhe-grid dt { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-soft); margin-bottom: 0.15rem; }
.detalhe-grid dd { font-size: 0.9rem; color: var(--ink); }

/* Modais */
:deep(.ledger-modal.modal-content) { border-radius: 12px; border: none; box-shadow: 0 20px 40px -8px rgba(32,29,26,0.25); }
:deep(.ledger-modal .modal-header), :deep(.ledger-modal .modal-footer) { border-color: var(--paper-line); padding: 1.1rem 1.4rem; }
:deep(.ledger-modal .modal-title) { font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: var(--ink); }
:deep(.ledger-modal .modal-body) { padding: 1.4rem; max-height: 70vh; overflow-y: auto; }

.spinner { width: 28px; height: 28px; border: 3px solid var(--paper-line); border-top-color: var(--ink); border-radius: 50%; margin: 0 auto; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>