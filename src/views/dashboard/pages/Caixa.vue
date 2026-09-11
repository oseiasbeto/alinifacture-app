<template>
  <div class="ledger-scope space-y-6">
    <!-- Cabeçalho -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="ledger-title">Pedidos</h1>
        <p class="text-sm text-stone-500 mt-1">Do atendimento à entrega — acompanhe cada pedido</p>
      </div>
      <button class="btn-primary" @click="abrirModalNovo">+ Novo Pedido</button>
    </div>

    <!-- Cartões de resumo -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" v-if="resumo">
      <div class="stat-card stat-rose">
        <span class="stat-tab"></span>
        <p class="stat-label">Pendentes</p>
        <p class="stat-value">{{ resumo.pendente }}</p>
      </div>
      <div class="stat-card stat-blue">
        <span class="stat-tab"></span>
        <p class="stat-label">Em execução</p>
        <p class="stat-value">{{ resumo.em_execucao }}</p>
      </div>
      <div class="stat-card stat-amber">
        <span class="stat-tab"></span>
        <p class="stat-label">Prontos p/ entrega</p>
        <p class="stat-value">{{ resumo.pronto }}</p>
      </div>
      <div class="stat-card stat-emerald">
        <span class="stat-tab"></span>
        <p class="stat-label">Entregues</p>
        <p class="stat-value">{{ resumo.entregue }}</p>
      </div>
    </div>

    <!-- Abas de status -->
    <div class="tabs-bar">
      <button v-for="aba in abas" :key="aba.valor" class="tab-btn" :class="{ active: filtros.status === aba.valor }"
        @click="mudarAba(aba.valor)">
        {{ aba.label }}
        <span v-if="resumo && aba.valor" class="tab-count">{{ resumo[aba.valor] ?? 0 }}</span>
      </button>

      <div class="relative flex-1 min-w-[200px] ml-auto">
        <input type="text" v-model="filtros.busca" placeholder="Buscar por nº, cliente ou produto..."
          class="ledger-input pl-9" />
        <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- Tabela -->
    <div class="ledger-panel">
      <div v-if="pedidosLoading" class="p-10 text-center text-stone-500">
        <div class="spinner"></div>
        <p class="mt-3 text-sm">Carregando pedidos...</p>
      </div>

      <div v-else-if="pedidosError" class="p-6 text-center text-rule">{{ pedidosError }}</div>

      <div v-else-if="pedidos.length === 0" class="p-10 text-center text-stone-500">
        Nenhum pedido encontrado.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="ledger-table w-full">
          <thead>
            <tr>
              <th class="text-left">Nº Pedido</th>
              <th class="text-left">Cliente</th>
              <th class="text-left">Produto/Serviço</th>
              <th class="text-right">Qtd</th>
              <th class="text-left">Prazo</th>
              <th class="text-left">Status</th>
              <th class="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pedido in pedidos" :key="pedido._id" class="row-clickable" @click="abrirDetalhes(pedido)">
              <td class="num font-medium text-ink">{{ pedido.numeroPedido }}</td>
              <td>{{ pedido.cliente?.nome || pedido.nomeCliente }}</td>
              <td class="text-stone-500">{{ pedido.produto?.nome }} / {{ pedido.tipoProduto }}</td>
              <td class="text-right num">{{ pedido.quantidade }}</td>
              <td class="text-stone-500 whitespace-nowrap">{{ formatarDataCurta(pedido.dataEntregaPrevista) }}</td>
              <td>
                <span class="status-badge" :class="'badge-' + pedido.status">
                  <span class="status-dot"></span>
                  {{ statusLabel(pedido.status) }}
                </span>
              </td>
              <td class="text-right whitespace-nowrap" @click.stop>
                <button v-if="proximosStatus(pedido.status)[0]" class="btn-icon btn-ok"
                  :title="'Avançar para ' + statusLabel(proximosStatus(pedido.status)[0])"
                  @click="avancarStatus(pedido)">→</button>
                <button class="btn-icon" title="Detalhes" @click="abrirDetalhes(pedido)">≡</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="ledger-footer" v-if="pagination.totalPages > 1">
        <div>
          Mostrando {{ (pagination.page - 1) * pagination.limit + 1 }}–
          {{ Math.min(pagination.page * pagination.limit, pagination.totalDocs) }} de {{ pagination.totalDocs }} pedidos
        </div>
        <nav class="flex gap-1">
          <button class="page-btn" :disabled="pagination.page === 1" @click="mudarPagina(pagination.page - 1)">Anterior</button>
          <button v-for="n in Math.min(7, pagination.totalPages)" :key="n" class="page-btn"
            :class="{ active: pagination.page === n }" @click="mudarPagina(n)">{{ n }}</button>
          <button class="page-btn" :disabled="!pagination.hasNextPage" @click="mudarPagina(pagination.page + 1)">Próxima</button>
        </nav>
      </div>
    </div>

    <!-- Modal Novo Pedido -->
    <div class="modal fade" id="novoPedidoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content ledger-modal">
          <div class="modal-header">
            <h5 class="modal-title">Novo Pedido</h5>
            <button type="button" class="btn-close" @click="fecharModal('novoPedidoModal')"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="salvarPedido" @keydown.enter.prevent>
              <div class="row g-3">
                <div class="col-12">
                  <label class="ledger-label">Cliente <span class="text-rule">*</span></label>
                  <button type="button" class="ledger-input selector-btn" :class="{ 'input-invalid': errors.cliente }"
                    @click="abrirModalCliente">
                    <span v-if="clienteSelecionado">{{ clienteSelecionado.nome }}</span>
                    <span v-else class="text-stone-400">Selecionar cliente...</span>
                    <span class="selector-arrow">▸</span>
                  </button>
                  <div class="error-text" v-if="errors.cliente">{{ errors.cliente }}</div>
                </div>

                <div class="col-12">
                  <label class="ledger-label">Produto do catálogo <span class="text-rule">*</span></label>
                  <button type="button" class="ledger-input selector-btn" :class="{ 'input-invalid': errors.produto }"
                    @click="abrirModalProduto">
                    <span v-if="produtoSelecionado">
                      {{ produtoSelecionado.nome }}
                      <span v-if="produtoSelecionado.cor" class="text-stone-500"> — {{ produtoSelecionado.cor }}</span>
                    </span>
                    <span v-else class="text-stone-400">Selecionar produto do catálogo...</span>
                    <span class="selector-arrow">▸</span>
                  </button>
                  <div class="error-text" v-if="errors.produto">{{ errors.produto }}</div>
                </div>

                <div class="col-12">
                  <label class="ledger-label">Serviço <span class="text-rule">*</span></label>
                  <select class="ledger-input" v-model="form.tipoProduto" :class="{ 'input-invalid': errors.tipoProduto }">
                    <option value="">Selecione o serviço</option>
                    <option v-for="s in servicosDisponiveis" :key="s" :value="s">{{ s }}</option>
                  </select>
                  <div class="error-text" v-if="errors.tipoProduto">{{ errors.tipoProduto }}</div>
                </div>

                <div class="col-12">
                  <label class="ledger-label">Especificações <span class="text-rule">*</span></label>
                  <textarea class="ledger-input" rows="3" v-model="form.especificacoes"
                    placeholder="Tamanho, cor, material, texto a imprimir, referências..."
                    :class="{ 'input-invalid': errors.especificacoes }"></textarea>
                  <div class="error-text" v-if="errors.especificacoes">{{ errors.especificacoes }}</div>
                </div>

                <div class="col-md-4">
                  <label class="ledger-label">Quantidade</label>
                  <input type="number" min="1" class="ledger-input num" v-model="form.quantidade" />
                </div>

                <div class="col-md-4">
                  <label class="ledger-label">Preço unitário <span class="text-rule">*</span></label>
                  <input type="text" class="ledger-input num" :value="formatarMoeda(form.precoUnitario)" disabled />
                  <div class="error-text" v-if="errors.precoUnitario">{{ errors.precoUnitario }}</div>
                </div>

                <div class="col-md-4">
                  <label class="ledger-label">Valor total <span class="text-rule">*</span></label>
                  <input type="text" class="ledger-input num" :value="formatarMoeda(valorTotal)" disabled />
                </div>

                <div class="col-md-6">
                  <label class="ledger-label">Prazo de entrega</label>
                  <input type="date" class="ledger-input" v-model="form.dataEntregaPrevista" />
                  <small class="text-stone-500 d-block mt-1">{{ prazoLabel }}</small>
                </div>

                <div class="col-12">
                  <label class="ledger-label">Observações</label>
                  <textarea class="ledger-input" rows="2" v-model="form.observacoes"></textarea>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="fecharModal('novoPedidoModal')">Cancelar</button>
            <button type="button" class="btn-primary" :disabled="salvando" @click="salvarPedido">
              {{ salvando ? 'Salvando...' : 'Criar Pedido' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Selecionar Cliente -->
    <div class="modal fade" id="selecionarClienteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content ledger-modal">
          <div class="modal-header">
            <h5 class="modal-title">Selecionar Cliente</h5>
            <button type="button" class="btn-close" @click="fecharModal('selecionarClienteModal')"></button>
          </div>
          <div class="modal-body">
            <div class="flex gap-2 mb-3">
              <div class="relative flex-1">
                <input type="text" v-model="modalCliente.busca" placeholder="Buscar por nome, email, telefone ou NIF..."
                  class="ledger-input pl-9" />
                <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button type="button" class="btn-ghost whitespace-nowrap" @click="mostrarCriarCliente = !mostrarCriarCliente">
                {{ mostrarCriarCliente ? 'Cancelar' : '+ Novo Cliente' }}
              </button>
            </div>

            <!-- Criação rápida de cliente -->
            <div v-if="mostrarCriarCliente" class="quick-create">
              <div class="row g-2">
                <div class="col-md-6">
                  <input type="text" class="ledger-input" v-model="novoClienteForm.nome" placeholder="Nome *" />
                </div>
                <div class="col-md-6">
                  <input type="text" class="ledger-input" v-model="novoClienteForm.telefone" placeholder="Telefone" />
                </div>
                <div class="col-md-6">
                  <input type="text" class="ledger-input" v-model="novoClienteForm.nif" placeholder="NIF (opcional)" />
                </div>
                <div class="col-md-6 flex items-center">
                  <button type="button" class="btn-primary w-full" :disabled="salvandoClienteRapido || !novoClienteForm.nome?.trim()"
                    @click="salvarClienteRapido">
                    {{ salvandoClienteRapido ? 'Criando...' : 'Criar e Selecionar' }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="clientesLoadingModal" class="text-center text-stone-500 py-8">Carregando clientes...</div>
            <div v-else-if="clientesListados.length === 0" class="text-center text-stone-500 py-8">Nenhum cliente encontrado.</div>
            <table v-else class="ledger-table w-full">
              <thead>
                <tr>
                  <th class="text-left">Nome</th>
                  <th class="text-left">Telefone</th>
                  <th class="text-left">NIF</th>
                  <th class="text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in clientesListados" :key="c._id">
                  <td class="font-medium text-ink">{{ c.nome }}</td>
                  <td class="text-stone-500">{{ c.telefone || '—' }}</td>
                  <td class="text-stone-500 num">{{ c.nif || '—' }}</td>
                  <td class="text-right">
                    <button type="button" class="btn-ghost" @click="selecionarCliente(c)">Selecionar</button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="ledger-footer" v-if="clientesPaginationModal.totalPages > 1">
              <div>{{ clientesPaginationModal.totalDocs }} clientes</div>
              <nav class="flex gap-1">
                <button class="page-btn" :disabled="clientesPaginationModal.page === 1"
                  @click="mudarPaginaModalCliente(clientesPaginationModal.page - 1)">Anterior</button>
                <button class="page-btn" :disabled="!clientesPaginationModal.hasNextPage"
                  @click="mudarPaginaModalCliente(clientesPaginationModal.page + 1)">Próxima</button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Selecionar Produto -->
    <div class="modal fade" id="selecionarProdutoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content ledger-modal">
          <div class="modal-header">
            <h5 class="modal-title">Selecionar Produto</h5>
            <button type="button" class="btn-close" @click="fecharModal('selecionarProdutoModal')"></button>
          </div>
          <div class="modal-body">
            <div class="relative mb-3">
              <input type="text" v-model="modalProduto.busca" placeholder="Buscar por nome, código ou descrição..."
                class="ledger-input pl-9" />
              <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div v-if="produtosLoadingModal" class="text-center text-stone-500 py-8">Carregando produtos...</div>
            <div v-else-if="produtosListados.length === 0" class="text-center text-stone-500 py-8">Nenhum produto encontrado.</div>
            <table v-else class="ledger-table w-full">
              <thead>
                <tr>
                  <th class="text-left">Produto</th>
                  <th class="text-left">Cor</th>
                  <th class="text-right">Preço</th>
                  <th class="text-right">Estoque</th>
                  <th class="text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in produtosListados" :key="p._id">
                  <td class="font-medium text-ink">{{ p.nome }}</td>
                  <td class="text-stone-500">{{ p.cor || '—' }}</td>
                  <td class="text-right num">{{ formatarMoeda(p.preco) }}</td>
                  <td class="text-right">
                    <span v-if="!p.controlaEstoque" class="text-stone-400 text-sm">Não controla</span>
                    <span v-else class="num">
                      <span class="status-dot-inline" :class="p.quantidade < (Number(form.quantidade) || 1) ? 'dot-pendente' : 'dot-entregue'"></span>
                      {{ p.quantidade }} un.
                    </span>
                  </td>
                  <td class="text-right">
                    <button type="button" class="btn-ghost" :disabled="!podeSelecionarProduto(p)"
                      :title="!podeSelecionarProduto(p) ? `Estoque insuficiente — disponível: ${p.quantidade}` : ''"
                      @click="selecionarProduto(p)">
                      Selecionar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="ledger-footer" v-if="produtosPaginationModal.totalPages > 1">
              <div>{{ produtosPaginationModal.totalDocs }} produtos</div>
              <nav class="flex gap-1">
                <button class="page-btn" :disabled="produtosPaginationModal.page === 1"
                  @click="mudarPaginaModalProduto(produtosPaginationModal.page - 1)">Anterior</button>
                <button class="page-btn" :disabled="!produtosPaginationModal.hasNextPage"
                  @click="mudarPaginaModalProduto(produtosPaginationModal.page + 1)">Próxima</button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detalhes / Status -->
    <div class="modal fade" id="detalhesPedidoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content ledger-modal" v-if="pedidoAtivo">
          <div class="modal-header">
            <h5 class="modal-title">
              Pedido <span class="num">{{ pedidoAtivo.numeroPedido }}</span>
            </h5>
            <button type="button" class="btn-close" @click="fecharModal('detalhesPedidoModal')"></button>
          </div>
          <div class="modal-body">
            <div class="flex items-center justify-between mb-4">
              <span class="status-badge lg" :class="'badge-' + pedidoAtivo.status">
                <span class="status-dot"></span>
                {{ statusLabel(pedidoAtivo.status) }}
              </span>

              <div class="flex gap-2">
                <button v-for="prox in proximosStatus(pedidoAtivo.status)" :key="prox" class="btn-ghost"
                  @click="mudarStatus(pedidoAtivo, prox)">
                  {{ prox === 'cancelado' ? 'Cancelar' : 'Marcar como ' + statusLabel(prox) }}
                </button>
              </div>
            </div>

            <dl class="detalhe-grid">
              <div>
                <dt>Cliente</dt>
                <dd>{{ pedidoAtivo.cliente?.nome || pedidoAtivo.nomeCliente }}</dd>
              </div>
              <div>
                <dt>Contacto</dt>
                <dd>{{ pedidoAtivo.contactoCliente || pedidoAtivo.cliente?.telefone || '—' }}</dd>
              </div>
              <div>
                <dt>Produto/Serviço</dt>
                <dd>{{ pedidoAtivo.produto?.nome || '—' }} / {{ pedidoAtivo.tipoProduto }}</dd>
              </div>
              <div>
                <dt>Quantidade</dt>
                <dd class="num">{{ pedidoAtivo.quantidade }}</dd>
              </div>
              <div>
                <dt>Prazo de entrega</dt>
                <dd>{{ formatarDataCurta(pedidoAtivo.dataEntregaPrevista) }}</dd>
              </div>
              <div>
                <dt>Atendente</dt>
                <dd>{{ pedidoAtivo.atendente?.nomeProprio || '—' }}</dd>
              </div>
              <div class="col-span-2">
                <dt>Especificações</dt>
                <dd>{{ pedidoAtivo.especificacoes }}</dd>
              </div>
            </dl>

            <div class="historico">
              <p class="form-section-title">Histórico</p>
              <ul>
                <li v-for="(h, i) in [...(pedidoAtivo.historicoStatus || [])].reverse()" :key="i">
                  <span class="status-dot-inline" :class="'dot-' + h.status"></span>
                  <strong>{{ statusLabel(h.status) }}</strong>
                  <span class="text-stone-500"> — {{ formatarData(h.data) }}</span>
                  <span v-if="h.usuario?.nomeProprio" class="text-stone-500"> · {{ h.usuario.nomeProprio }}</span>
                  <div v-if="h.observacao" class="text-stone-500 text-sm">{{ h.observacao }}</div>
                </li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="fecharModal('detalhesPedidoModal')">Fechar</button>
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

const STATUS_LABELS = {
  pendente: 'Pendente',
  em_execucao: 'Em Execução',
  pronto: 'Pronto',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

const TRANSICOES = {
  pendente: ['em_execucao', 'cancelado'],
  em_execucao: ['pronto', 'pendente', 'cancelado'],
  pronto: ['entregue', 'em_execucao', 'cancelado'],
  entregue: [],
  cancelado: [],
}

const abas = [
  { valor: '', label: 'Todos' },
  { valor: 'pendente', label: 'Pendente' },
  { valor: 'em_execucao', label: 'Em Execução' },
  { valor: 'pronto', label: 'Pronto' },
  { valor: 'entregue', label: 'Entregue' },
]

// Serviços típicos de uma gráfica — usados no select "Serviço" do Novo Pedido.
const servicosDisponiveis = [
  'Timbragem',
  'Impressão Digital',
  'Impressão Offset',
  'Fotocópias',
  'Encadernação',
  'Plastificação',
  'Design Gráfico',
  'Cartões de Visita',
  'Convites',
  'Banners / Faixas',
  'Flyers / Panfletos',
  'Carimbos',
  'Vinil / Autocolantes',
  'T-shirts Personalizadas',
  'Placas Sinaléticas',
  'Outro',
]

const toISODate = (date) => {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset()) // evita voltar um dia por causa do fuso
  return d.toISOString().slice(0, 10)
}

const calcularPrazoPadrao = () => {
  const data = new Date()
  data.setDate(data.getDate() + 3)
  return toISODate(data)
}

// Conta apenas dias úteis (seg-sex) entre hoje e a data escolhida, para a legenda por baixo do campo.
const diasUteisEntre = (inicio, fimStr) => {
  if (!fimStr) return 0
  let cursor = new Date(inicio)
  cursor.setHours(0, 0, 0, 0)
  const fim = new Date(fimStr + 'T00:00:00')
  if (fim <= cursor) return 0

  let dias = 0
  while (cursor < fim) {
    cursor.setDate(cursor.getDate() + 1)
    const diaSemana = cursor.getDay()
    if (diaSemana !== 0 && diaSemana !== 6) dias++
  }
  return dias
}

const statusLabel = (s) => STATUS_LABELS[s] || s
// Só mostra a transição "de avanço" no botão rápido da tabela; as demais (voltar/cancelar) ficam no modal de detalhes.
const proximosStatus = (status) => TRANSICOES[status] || []

const filtros = ref({ status: '', busca: '', page: 1, limit: 10 })

const pedidos = computed(() => store.getters.pedidosListados || [])
const pagination = computed(() => store.getters.pedidosPagination || {})
const pedidosLoading = computed(() => store.getters.pedidosLoading || false)
const pedidosError = computed(() => store.getters.pedidosError || null)
const resumo = computed(() => store.getters.resumoPedidos)
const clientesListados = computed(() => store.getters.clientesListados || [])
const produtosListados = computed(() => store.getters.produtosListados || [])

const carregarPedidos = async (resetPage = false) => {
  if (resetPage) filtros.value.page = 1
  await store.dispatch('listarPedidos', {
    page: filtros.value.page,
    limit: filtros.value.limit,
    status: filtros.value.status || undefined,
    busca: filtros.value.busca.trim() || undefined,
  })
}

const carregarResumo = () => store.dispatch('carregarResumoPedidos')

watch(() => filtros.value.busca, () => carregarPedidos(true))

const mudarAba = (valor) => {
  filtros.value.status = valor
  carregarPedidos(true)
}

onMounted(async () => {
  await Promise.all([carregarPedidos(), carregarResumo()])
})

const mudarPagina = (n) => {
  if (n < 1 || n > pagination.value.totalPages) return
  filtros.value.page = n
  carregarPedidos()
}

const fecharModal = (modalId) => {
  const el = document.getElementById(modalId)
  const instance = el && Modal.getInstance(el)
  if (instance) instance.hide()
}

// --- Novo pedido ---
const form = ref({
  cliente: '', produto: '', tipoProduto: '', especificacoes: '', quantidade: 1,
  precoUnitario: '', dataEntregaPrevista: '', observacoes: '',
})
const errors = ref({})
const salvando = ref(false)
const clienteSelecionado = ref(null)
const produtoSelecionado = ref(null)

const valorTotal = computed(() => (Number(form.value.precoUnitario) || 0) * (Number(form.value.quantidade) || 0))
const formatarMoeda = (v) => `${(Number(v) || 0).toFixed(2)} Kz`

const prazoLabel = computed(() => {
  if (!form.value.dataEntregaPrevista) return ''
  const dias = diasUteisEntre(new Date(), form.value.dataEntregaPrevista)
  if (dias <= 0) return 'Entrega hoje'
  return `${dias} ${dias === 1 ? 'dia útil' : 'dias úteis'}`
})

const resetForm = () => {
  form.value = {
    cliente: '', produto: '', tipoProduto: '', especificacoes: '', quantidade: 1,
    precoUnitario: '', dataEntregaPrevista: calcularPrazoPadrao(), observacoes: '',
  }
  errors.value = {}
  clienteSelecionado.value = null
  produtoSelecionado.value = null
}

const abrirModalNovo = () => {
  resetForm()
  new Modal(document.getElementById('novoPedidoModal')).show()
}

// --- Seleção de cliente (modal próprio, com pesquisa e paginação) ---
const modalCliente = ref({ busca: '', page: 1, limit: 6 })
const clientesLoadingModal = computed(() => store.getters.clientesLoading || false)
const clientesPaginationModal = computed(() => store.getters.clientesPagination || {})
const mostrarCriarCliente = ref(false)
const novoClienteForm = ref({ nome: '', telefone: '', nif: '' })
const salvandoClienteRapido = ref(false)

const pesquisarClientesModal = (resetPage = false) => {
  if (resetPage) modalCliente.value.page = 1
  return store.dispatch('listClients', {
    page: modalCliente.value.page,
    limit: modalCliente.value.limit,
    busca: modalCliente.value.busca.trim() || undefined,
    ativo: true,
  })
}

watch(() => modalCliente.value.busca, () => pesquisarClientesModal(true))

const abrirModalCliente = () => {
  modalCliente.value = { busca: '', page: 1, limit: 6 }
  mostrarCriarCliente.value = false
  novoClienteForm.value = { nome: '', telefone: '', nif: '' }
  pesquisarClientesModal()
  new Modal(document.getElementById('selecionarClienteModal')).show()
}

const mudarPaginaModalCliente = (n) => {
  if (n < 1) return
  modalCliente.value.page = n
  pesquisarClientesModal()
}

const selecionarCliente = (cliente) => {
  clienteSelecionado.value = cliente
  form.value.cliente = cliente._id
  errors.value.cliente = ''
  fecharModal('selecionarClienteModal')
}

const salvarClienteRapido = async () => {
  if (!novoClienteForm.value.nome?.trim()) return
  salvandoClienteRapido.value = true
  try {
    const res = await store.dispatch('createClient', {
      nome: novoClienteForm.value.nome.trim(),
      telefone: novoClienteForm.value.telefone?.trim() || undefined,
      nif: novoClienteForm.value.nif?.trim() || undefined,
    })
    const clienteCriado = res.cliente || res
    toast('Cliente criado com sucesso!', { type: 'success', autoClose: 2000 })
    selecionarCliente(clienteCriado)
  } catch (err) {
    toast(err.response?.data?.message || 'Erro ao criar cliente', { type: 'error', autoClose: 3000 })
  } finally {
    salvandoClienteRapido.value = false
  }
}

// --- Seleção de produto (modal próprio, com pesquisa, paginação e verificação de estoque) ---
const modalProduto = ref({ busca: '', page: 1, limit: 6 })
const produtosLoadingModal = computed(() => store.getters.produtosLoading || false)
const produtosPaginationModal = computed(() => store.getters.paginationInfo || {})

const pesquisarProdutosModal = (resetPage = false) => {
  if (resetPage) modalProduto.value.page = 1
  return store.dispatch('listProducts', {
    page: modalProduto.value.page,
    limit: modalProduto.value.limit,
    busca: modalProduto.value.busca.trim() || undefined,
    ativo: true,
  })
}

watch(() => modalProduto.value.busca, () => pesquisarProdutosModal(true))

const abrirModalProduto = () => {
  modalProduto.value = { busca: '', page: 1, limit: 6 }
  pesquisarProdutosModal()
  new Modal(document.getElementById('selecionarProdutoModal')).show()
}

const mudarPaginaModalProduto = (n) => {
  if (n < 1) return
  modalProduto.value.page = n
  pesquisarProdutosModal()
}

// Não deixa selecionar um produto cujo estoque disponível é inferior à quantidade pedida.
const podeSelecionarProduto = (produto) => {
  if (!produto.controlaEstoque) return true
  return produto.quantidade >= (Number(form.value.quantidade) || 1)
}

const selecionarProduto = (produto) => {
  if (!podeSelecionarProduto(produto)) return
  produtoSelecionado.value = produto
  form.value.produto = produto._id
  form.value.precoUnitario = produto.preco
  errors.value.produto = ''
  fecharModal('selecionarProdutoModal')
}

const validarFormulario = () => {
  errors.value = {}
  if (!form.value.cliente) errors.value.cliente = 'Selecione o cliente'
  if (!form.value.produto) errors.value.produto = 'Selecione um produto do catálogo'
  if (!form.value.tipoProduto?.trim()) errors.value.tipoProduto = 'Selecione o serviço'
  if (!form.value.especificacoes?.trim()) errors.value.especificacoes = 'Campo obrigatório'
  return Object.keys(errors.value).length === 0
}

const salvarPedido = async () => {
  if (!validarFormulario()) return
  salvando.value = true
  try {
    await store.dispatch('criarPedido', {
      cliente: form.value.cliente,
      produto: form.value.produto || undefined,
      tipoProduto: form.value.tipoProduto.trim(),
      especificacoes: form.value.especificacoes.trim(),
      quantidade: Number(form.value.quantidade) || 1,
      precoUnitario: form.value.precoUnitario !== '' ? Number(form.value.precoUnitario) : undefined,
      dataEntregaPrevista: form.value.dataEntregaPrevista || undefined,
      observacoes: form.value.observacoes?.trim() || undefined,
    })
    toast('Pedido criado com sucesso!', { type: 'success', autoClose: 2500 })
    fecharModal('novoPedidoModal')
    await Promise.all([carregarPedidos(), carregarResumo()])
  } catch (err) {
    toast(err.response?.data?.message || 'Erro ao criar pedido', { type: 'error', autoClose: 3000 })
  } finally {
    salvando.value = false
  }
}

// --- Detalhes / status ---
const pedidoAtivo = ref(null)

const abrirDetalhes = async (pedidoResumido) => {
  try {
    pedidoAtivo.value = await store.dispatch('getPedido', pedidoResumido._id)
    new Modal(document.getElementById('detalhesPedidoModal')).show()
  } catch (err) {
    toast('Não foi possível carregar os detalhes do pedido', { type: 'error', autoClose: 2500 })
  }
}

const mudarStatus = async (pedido, novoStatus) => {
  try {
    pedidoAtivo.value = await store.dispatch('atualizarStatusPedido', { id: pedido._id, status: novoStatus })
    toast(`Pedido marcado como "${statusLabel(novoStatus)}"`, { type: 'success', autoClose: 2500 })
    await Promise.all([carregarPedidos(), carregarResumo()])
  } catch (err) {
    toast(err.response?.data?.message || 'Erro ao atualizar status', { type: 'error', autoClose: 2500 })
  }
}

// Botão rápido na tabela: avança sempre para o PRIMEIRO status da lista de transições (o "avanço natural").
const avancarStatus = (pedido) => {
  const proximo = proximosStatus(pedido.status)[0]
  if (proximo) mudarStatus(pedido, proximo)
}

const formatarData = (d) => new Date(d).toLocaleString('pt-PT')
const formatarDataCurta = (d) => (d ? new Date(d).toLocaleDateString('pt-PT') : '—')
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

.eyebrow {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--rule);
  margin: 0;
}

.ledger-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.75rem;
  color: var(--ink);
  margin-top: 0.15rem;
}

.text-ink { color: var(--ink); }
.text-rule { color: var(--rule); }

.num {
  font-family: 'IBM Plex Mono', monospace;
  font-variant-numeric: tabular-nums;
}

/* Cartões de resumo */
.stat-card {
  position: relative;
  border-radius: 10px;
  padding: 1rem 1.1rem 0.9rem;
  overflow: hidden;
  border: 1px solid var(--paper-line);
  transition: transform 0.15s, box-shadow 0.15s;
}
.stat-card:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
.stat-tab { position: absolute; top: 0; left: 0; width: 100%; height: 4px; }

.stat-blue { background: #eaf1ff; border-color: #c7dbff; }
.stat-blue .stat-tab { background: var(--blue); }
.stat-blue .stat-value { color: #1d4ed8; }

.stat-rose { background: #fff0f1; border-color: #ffd0d4; }
.stat-rose .stat-tab { background: var(--rule); }
.stat-rose .stat-value { color: #be123c; }

.stat-emerald { background: #ecfdf5; border-color: #bdf0d6; }
.stat-emerald .stat-tab { background: var(--ok); }
.stat-emerald .stat-value { color: #047857; }

.stat-amber { background: #fff8e8; border-color: #fbe2a6; }
.stat-amber .stat-tab { background: var(--amber); }
.stat-amber .stat-value { color: #b45309; }

.stat-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-soft); margin-top: 0.4rem; }
.stat-value { font-family: 'IBM Plex Mono', monospace; font-weight: 600; font-size: 1.5rem; color: var(--ink); margin-top: 0.15rem; }

/* Abas */
.tabs-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  border: 1px solid var(--paper-line);
  background: #fff;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ink-soft);
  transition: all 0.15s;
}
.tab-btn.active { background: var(--ink); border-color: var(--ink); color: #fff; }

.tab-count {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  background: rgba(0,0,0,0.08);
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
}
.tab-btn.active .tab-count { background: rgba(255,255,255,0.2); }

.ledger-input {
  width: 100%;
  border: 1px solid var(--paper-line);
  background: var(--paper);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: var(--ink);
  outline: none;
}
.ledger-input:focus { border-color: var(--ink); }
.ledger-input:disabled { background: #f1efe9; color: #6b655c; cursor: not-allowed; }
.input-invalid { border-color: var(--rule) !important; }
.error-text { color: var(--rule); font-size: 0.75rem; margin-top: 0.25rem; }

.selector-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  cursor: pointer;
}
.selector-arrow { color: var(--ink-soft); font-size: 0.8rem; }

.link-clear {
  display: inline-block;
  margin-top: 0.4rem;
  font-size: 0.75rem;
  color: var(--rule);
  text-decoration: underline;
}

.quick-create {
  background: var(--paper);
  border: 1px dashed var(--paper-line);
  border-radius: 8px;
  padding: 0.85rem;
  margin-bottom: 1rem;
}

.search-icon { position: absolute; left: 0.65rem; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--ink-soft); }

.ledger-label {
  display: block;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ink-soft);
  margin-bottom: 0.3rem;
  font-weight: 600;
}

/* Painel/tabela */
.ledger-panel { background: #fff; border: 1px solid var(--paper-line); border-radius: 12px; overflow: hidden; }
.ledger-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.ledger-table thead th {
  text-align: left; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--ink-soft); background: var(--paper); padding: 0.65rem 1rem; border-bottom: 2px solid var(--ink);
}
.ledger-table tbody td { padding: 0.75rem 1rem; border-bottom: 1px dashed var(--paper-line); vertical-align: middle; }
.ledger-table tbody tr:last-child td { border-bottom: none; }
.ledger-table tbody tr td:first-child { border-left: 3px solid var(--rule); }
.row-clickable { cursor: pointer; }
.row-clickable:hover { background: #fbfaf6; }

/* Badges de status */
.status-badge {
  display: inline-flex; align-items: center; gap: 0.4rem;
  font-size: 0.78rem; font-weight: 600; padding: 0.2rem 0.65rem; border-radius: 999px;
}
.status-badge.lg { font-size: 0.9rem; padding: 0.35rem 0.9rem; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }

.badge-pendente { background: #fff0f1; color: var(--rule); }
.badge-em_execucao { background: #eaf1ff; color: var(--blue); }
.badge-pronto { background: #fff8e8; color: var(--amber); }
.badge-entregue { background: #ecfdf5; color: var(--ok); }
.badge-cancelado { background: #f1efe9; color: #8a8478; }

.status-dot-inline { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 0.35rem; }
.dot-pendente { background: var(--rule); }
.dot-em_execucao { background: var(--blue); }
.dot-pronto { background: var(--amber); }
.dot-entregue { background: var(--ok); }
.dot-cancelado { background: #8a8478; }

.btn-icon {
  width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center;
  border-radius: 6px; border: 1px solid var(--paper-line); background: #fff; color: var(--ink-soft);
  margin-left: 0.25rem; font-size: 0.85rem; cursor: pointer; transition: all 0.15s;
}
.btn-icon:hover { border-color: var(--ink); color: var(--ink); }
.btn-icon.btn-ok:hover { border-color: var(--ok); color: var(--ok); }

.ledger-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.85rem 1rem; border-top: 1px solid var(--paper-line); background: var(--paper);
  font-size: 0.8rem; color: var(--ink-soft); flex-wrap: wrap; gap: 1rem;
}
.page-btn {
  min-width: 32px; height: 32px; padding: 0 0.6rem; border-radius: 6px; border: 1px solid var(--paper-line);
  background: #fff; font-size: 0.8rem; font-weight: 600; color: var(--ink-soft); cursor: pointer;
}
.page-btn.active { background: var(--ink); border-color: var(--ink); color: #fff; }
.page-btn:disabled { opacity: 0.45; }

/* Botões */
.btn-primary {
  background: var(--ink); color: #fff; border: 1px solid var(--ink); border-radius: 8px;
  padding: 0.55rem 1.1rem; font-size: 0.85rem; font-weight: 600; cursor: pointer;
}
.btn-primary:disabled { opacity: 0.55; }
.btn-ghost {
  background: transparent; border: 1px solid var(--paper-line); color: var(--ink-soft); border-radius: 8px;
  padding: 0.5rem 0.9rem; font-size: 0.82rem; font-weight: 600; cursor: pointer;
}
.btn-ghost:hover { border-color: var(--ink); color: var(--ink); }

/* Detalhes */
.detalhe-grid {
  display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 1rem 1.5rem; margin-bottom: 1.25rem;
}
.detalhe-grid .col-span-2 { grid-column: 1 / -1; }
.detalhe-grid dt { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-soft); margin-bottom: 0.15rem; }
.detalhe-grid dd { font-size: 0.9rem; color: var(--ink); }

.historico { border-top: 1px dashed var(--paper-line); padding-top: 1rem; }
.form-section-title {
  font-family: 'IBM Plex Mono', monospace; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--rule); margin-bottom: 0.75rem;
}
.historico ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; }
.historico li { font-size: 0.85rem; }

/* Modais */
:deep(.ledger-modal.modal-content) { border-radius: 12px; border: none; box-shadow: 0 20px 40px -8px rgba(32,29,26,0.25); }
:deep(.ledger-modal .modal-header), :deep(.ledger-modal .modal-footer) { border-color: var(--paper-line); padding: 1.1rem 1.4rem; }
:deep(.ledger-modal .modal-title) { font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: var(--ink); }
:deep(.ledger-modal .modal-body) { padding: 1.4rem; max-height: 70vh; overflow-y: auto; }

.spinner {
  width: 28px; height: 28px; border: 3px solid var(--paper-line); border-top-color: var(--ink);
  border-radius: 50%; margin: 0 auto; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>