<template>
  <div class="ledger-scope space-y-6">
    <!-- Cabeçalho -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="ledger-title">Produtos</h1>
        <p class="text-sm text-stone-500 mt-1">Gerencie seu catálogo de produtos e estoque</p>
      </div>
      <div class="flex gap-2 w-full sm:w-auto">
        <button class="btn-ghost flex-1 sm:flex-none" :disabled="produtosListados.length === 0"
          @click="gerarPDFProdutos">
          ↓ Exportar
        </button>
        <button class="btn-primary flex-1 sm:flex-none" @click="abrirModalNovo('novoProdutoModal')">
          + Novo Produto
        </button>
      </div>
    </div>

    <!-- Cartões de resumo -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" v-if="resumo">
      <div class="stat-card stat-blue">
        <span class="stat-tab"></span>
        <p class="stat-label">Total de produtos</p>
        <p class="stat-value">{{ resumo.totalProdutos }}</p>
      </div>
      <div class="stat-card stat-emerald">
        <span class="stat-tab"></span>
        <p class="stat-label">Ativos</p>
        <p class="stat-value">{{ resumo.totalAtivos }}</p>
      </div>
      <div class="stat-card stat-rose">
        <span class="stat-tab"></span>
        <p class="stat-label">Inactivos</p>
        <p class="stat-value">{{ resumo.totalInativos }}</p>
      </div>
      <div class="stat-card stat-amber">
        <span class="stat-tab"></span>
        <p class="stat-label">Novos este mês</p>
        <p class="stat-value">{{ resumo.novosEsteMes }}</p>
      </div>
    </div>

    <!-- Abas de status -->
    <div class="tabs-bar">
      <button v-for="aba in abas" :key="aba.valor" class="tab-btn" :class="{ active: filtros.status === aba.valor }"
        @click="filtros.status = aba.valor">
        {{ aba.label }}
        <span v-if="resumo && resumo[aba.chave] !== undefined" class="tab-count">
          {{ resumo[aba.chave] }}
        </span>
      </button>

      <div class="relative flex-1 min-w-[220px] ml-auto">
        <input type="text" v-model="filtros.busca" placeholder="Buscar por nome, código ou descrição..."
          class="ledger-input pl-9" />
        <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <button v-if="filtrosAtivos" class="toggle-pill active" @click="limparFiltros">
        <span class="dot dot-rule"></span>
        Limpar filtros
      </button>
    </div>

    <!-- Tabela / Loading / Error -->
    <div class="ledger-panel">
      <div v-if="produtosLoading" class="p-10 text-center text-stone-500">
        <div class="spinner"></div>
        <p class="mt-3 text-sm">Carregando produtos...</p>
      </div>

      <div v-else-if="produtosError" class="p-6 text-center text-rule">{{ produtosError }}</div>

      <div v-else-if="produtosListados.length === 0" class="p-10 text-center text-stone-500">
        Nenhum produto encontrado.
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="ledger-table responsive-table w-full">
            <thead>
              <tr>
                <th class="text-left">Produto</th>
                <th class="text-left">Cor</th>
                <th class="text-right">Preço</th>
                <th class="text-left">Custo</th>
                <th class="text-left">Unidade</th>
                <th class="text-right">Estoque</th>
                <th class="text-left">Status</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="produto in produtosListados" :key="produto._id" class="row-clickable"
                @click="abrirDetalhes(produto)">
                <td data-label="Produto">
                  <div class="font-medium text-ink">{{ produto.nome }}</div>
                  <div class="text-sm text-stone-500 line-clamp-1">{{ produto.descricao || 'Sem descrição' }}</div>
                </td>

                <td data-label="Cor">
                  <span v-if="produto.cor" class="cor-tag">
                    <span class="cor-dot" :style="{ background: corParaHex(produto.cor) }"></span>
                    {{ produto.cor }}
                  </span>
                  <span v-else class="text-stone-400">-</span>
                </td>
                <td data-label="Preço" class="text-right num font-semibold text-ink">{{ formatarMoeda(produto.preco) }}
                </td>
                <td data-label="Custo" class="text-right num font-semibold text-ink">{{ formatarMoeda(produto.custo) }}
                </td>
                <td data-label="Unidade" class="text-stone-500 uppercase">{{ produto.unidade }}</td>
                <td data-label="Estoque" class="text-right">
                  <span v-if="!produto.controlaEstoque" class="text-stone-400 text-sm">Não controla</span>
                  <span v-else>
                    <span class="status-dot"
                      :class="produto.quantidade <= produto.estoqueMinimo ? 'dot-rule' : 'dot-ok'"></span>
                    <span class="num">{{ produto.quantidade }} un.</span>
                  </span>
                </td>
                <td data-label="Status">
                  <span class="status-dot" :class="produto.ativo ? 'dot-ok' : 'dot-rule'"></span>
                  {{ produto.ativo ? 'Ativo' : 'Inativo' }}
                </td>
                <td data-label="Ações" class="actions-cell" @click.stop>
                  <button class="btn-icon" title="Editar" @click="editarProduto(produto)">✎</button>
                  <button class="btn-icon btn-rule" title="Excluir" @click="confirmarExclusao(produto)">✕</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginação -->
        <div class="ledger-footer">
          <div>
            Mostrando {{ (paginationInfo.page - 1) * paginationInfo.limit + 1 }}–
            {{ Math.min(paginationInfo.page * paginationInfo.limit, paginationInfo.totalDocs) }} de
            {{ paginationInfo.totalDocs }} produtos
          </div>

          <nav class="flex gap-1 flex-wrap justify-center">
            <button class="page-btn" :disabled="paginationInfo.page === 1"
              @click="mudarPagina(paginationInfo.page - 1)">
              Anterior
            </button>

            <button v-for="n in Math.min(7, paginationInfo.totalPages)" :key="n" class="page-btn"
              :class="{ active: paginationInfo.page === n }" @click="mudarPagina(n)">
              {{ n }}
            </button>

            <button class="page-btn" :disabled="!paginationInfo.hasNextPage"
              @click="mudarPagina(paginationInfo.page + 1)">
              Próxima
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal Novo/Editar Produto -->
    <div class="modal fade" id="novoProdutoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content ledger-modal">
          <div class="modal-header">
            <h5 class="modal-title">{{ modoEdicao ? 'Editar Produto' : 'Novo Produto' }}</h5>
            <button type="button" class="btn-close" @click="fecharModal('novoProdutoModal')"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="salvarProduto" @keydown.enter.prevent>
              <div class="form-section">
                <p class="form-section-title">Informações gerais</p>
                <div class="row g-3">
                  <div class="col-12">
                    <label class="ledger-label">Nome do produto <span class="text-rule">*</span></label>
                    <input type="text" class="ledger-input" v-model="form.nome"
                      :class="{ 'input-invalid': errors.nome }" />
                    <div class="error-text" v-if="errors.nome">{{ errors.nome }}</div>
                  </div>

                  <!-- Cor com sugestões clicáveis -->
                  <div class="col-12">
                    <label class="ledger-label">Cor</label>
                    <input type="text" class="ledger-input" v-model="form.cor"
                      placeholder="Ex: Azul, Branca, Diversa" />
                    <div class="cor-suggestions">
                      <button v-for="c in coresSugeridas" :key="c.nome" type="button" class="cor-chip"
                        :class="{ 'cor-chip-active': form.cor === c.nome }" @click="selecionarCor(c.nome)"
                        :title="c.nome">
                        <span class="cor-chip-swatch" :style="{ background: c.hex }"></span>
                        {{ c.nome }}
                      </button>
                    </div>
                  </div>

                  <div class="col-12">
                    <label class="ledger-label">Descrição</label>
                    <textarea class="ledger-input" rows="3" v-model="form.descricao"></textarea>
                  </div>
                </div>
              </div>

              <div class="form-section">
                <p class="form-section-title">Preço</p>
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="ledger-label">Moeda <span class="text-rule">*</span></label>
                    <select class="ledger-input" v-model="form.moeda" :class="{ 'input-invalid': errors.moeda }">
                      <option value="">Selecione</option>
                      <option value="Kz">Kz (Kwanzas)</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                    <div class="error-text" v-if="errors.moeda">{{ errors.moeda }}</div>
                  </div>

                  <div class="col-md-4">
                    <label class="ledger-label">Preço de venda <span class="text-rule">*</span></label>
                    <div class="ledger-input-group">
                      <span class="ledger-input-prefix">{{ form.moeda || 'Kz' }}</span>
                      <input type="number" step="0.01" min="0" class="ledger-input ledger-input-grouped num"
                        v-model="form.precoVenda" :class="{ 'input-invalid': errors.precoVenda }" />
                    </div>
                    <div class="error-text" v-if="errors.precoVenda">{{ errors.precoVenda }}</div>
                  </div>

                  <div class="col-md-4">
                    <label class="ledger-label">Custo</label>
                    <div class="ledger-input-group">
                      <span class="ledger-input-prefix">{{ form.moeda || 'Kz' }}</span>
                      <input type="number" step="0.01" min="0" class="ledger-input ledger-input-grouped num"
                        v-model="form.custo" :class="{ 'input-invalid': errors.custo }" />
                    </div>
                    <div class="error-text" v-if="errors.custo">{{ errors.custo }}</div>
                  </div>

                  <div class="col-md-6" v-if="!modoEdicao && form.controlaEstoque">
                    <label class="ledger-label">Quantidade inicial</label>
                    <input type="number" min="0" class="ledger-input num" v-model="form.quantidade" />
                  </div>
                </div>
              </div>

              <div class="form-section">
                <p class="form-section-title">Estoque</p>
                <div class="row g-3">
                  <div class="col-12">
                    <label class="switch-label">
                      <input type="checkbox" v-model="form.controlaEstoque" id="controlaEstoqueCheck"
                        class="switch-input" />
                      <span class="switch-track"><span class="switch-thumb"></span></span>
                      Controlar estoque deste produto
                    </label>
                  </div>

                  <div class="col-md-6" v-if="form.controlaEstoque">
                    <label class="ledger-label">Estoque mínimo (alerta de reposição)</label>
                    <input type="number" min="0" class="ledger-input num" v-model="form.estoqueMinimo" />
                  </div>

                  <div class="col-md-6" v-if="form.controlaEstoque && modoEdicao">
                    <label class="ledger-label">Estoque atual</label>
                    <input type="number" class="ledger-input num" :value="produtoSelecionado?.quantidade ?? 0"
                      disabled />
                    <small class="text-stone-500">
                      Para alterar a quantidade, use a área de <router-link to="/estoque">Gestão de
                        Estoque</router-link>.
                    </small>
                  </div>

                  <div class="col-12">
                    <label class="switch-label">
                      <input type="checkbox" v-model="form.ativo" id="ativoCheck" class="switch-input" />
                      <span class="switch-track"><span class="switch-thumb"></span></span>
                      Produto ativo (disponível para venda)
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="fecharModal('novoProdutoModal')">Cancelar</button>
            <button type="button" class="btn-primary" @click="salvarProduto" :disabled="salvando">
              {{ salvando ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Confirmação Exclusão -->
    <div class="modal fade" id="confirmarExclusaoModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content ledger-modal">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar Exclusão</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            Tem certeza que deseja excluir <strong>{{ produtoSelecionado?.nome }}</strong>?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn-primary btn-danger" @click="excluirProduto">Excluir</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, onMounted, watch } from 'vue'
import { Modal } from 'bootstrap'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { toast } from "vue3-toastify"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const store = useStore()
const router = useRouter()
const route = useRoute()

// Clique na linha da tabela -> abre a tela de detalhes do produto
const abrirDetalhes = (produto) => {
  router.push(`/dashboard/produtos/${produto._id}`)
}

// Filtros
const filtros = ref({
  busca: '',
  status: '',
  page: 1,
  limit: 10
})

const abas = [
  { valor: '', label: 'Todos', chave: 'total' },
  { valor: 'ativo', label: 'Ativos', chave: 'totalAtivos' },
  { valor: 'inativo', label: 'Inativos', chave: 'totalInativos' },
]

// Sugestões de cores para preenchimento rápido no formulário
const coresSugeridas = [
  { nome: 'Branca', hex: '#FFFFFF' },
  { nome: 'Preta', hex: '#111827' },
  { nome: 'Cinza', hex: '#9CA3AF' },
  { nome: 'Azul', hex: '#3B82F6' },
  { nome: 'Vermelha', hex: '#EF4444' },
  { nome: 'Verde', hex: '#10B981' },
  { nome: 'Amarela', hex: '#F59E0B' },
  { nome: 'Diversa', hex: 'linear-gradient(135deg,#3B82F6,#EF4444,#F59E0B,#10B981)' }
]

const selecionarCor = (nome) => {
  form.value.cor = nome
}

// Mapa aproximado de nome de cor -> hex, usado apenas para exibir a bolinha na tabela
const corParaHex = (nome) => {
  const encontrada = coresSugeridas.find(
    c => c.nome.toLowerCase() === String(nome).toLowerCase()
  )
  return encontrada ? encontrada.hex : '#CBD5E1'
}

// Formulário
const form = ref({
  nome: '',
  codigoBarras: '',
  tipo: 'produto',
  descricao: '',
  cor: '',
  moeda: 'Kz',
  precoVenda: '',
  custo: '',
  quantidade: 0,
  controlaEstoque: false,
  estoqueMinimo: 0,
  ativo: true
})

const errors = ref({})
const salvando = ref(false)
const excluindo = ref(false)
const modoEdicao = ref(false)
const produtoSelecionado = ref(null)

// Vuex getters
const produtosListados = computed(() => store.getters.produtosListados || [])
const paginationInfo = computed(() => store.getters.paginationInfo || {})
const produtosLoading = computed(() => store.getters.produtosLoading || false)
const produtosError = computed(() => store.getters.produtosError || null)

// Resumo (cartões do topo) — consome GET /produtos/resumo via action carregarResumoProdutos
const resumo = computed(() => store.getters.resumoProdutos || null)

const carregarResumo = async () => {
  try {
    await store.dispatch('carregarResumoProdutos')
  } catch (err) {
    // Falha silenciosa: os cartões de resumo simplesmente não aparecem
  }
}

const formatarMoeda = (v) =>
  `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(v) || 0)}kz`

// Filtros ativos
const filtrosAtivos = computed(() => filtros.value.busca || filtros.value.status)

// Carregar produtos
const carregarProdutos = async (resetPage = false) => {
  if (resetPage) filtros.value.page = 1
  await store.dispatch('listProducts', {
    page: filtros.value.page,
    limit: filtros.value.limit,
    busca: filtros.value.busca.trim() || undefined,
    ativo: filtros.value.status ? (filtros.value.status === 'ativo') : undefined
  })
}

const gerarPDFProdutos = () => {
  const doc = new jsPDF()

  // Cabeçalho
  doc.setFontSize(14)
  doc.text('Relatório de Produtos', 14, 16)

  doc.setFontSize(9)
  doc.setTextColor(120)
  const dataGeracao = new Date().toLocaleString('pt-PT')
  doc.text(`Gerado em: ${dataGeracao}`, 14, 22)

  let filtroTexto = 'Filtros: nenhum'
  const partesFiltro = []
  if (filtros.value.busca?.trim()) partesFiltro.push(`Busca: "${filtros.value.busca.trim()}"`)
  if (filtros.value.status) partesFiltro.push(`Status: ${filtros.value.status === 'ativo' ? 'Ativos' : 'Inativos'}`)
  if (partesFiltro.length) filtroTexto = `Filtros: ${partesFiltro.join(' • ')}`
  doc.text(filtroTexto, 14, 27)

  let cursorY = 34

  // Resumo
  if (resumo.value) {
    doc.setFontSize(11)
    doc.setTextColor(32, 29, 26)
    doc.text('Resumo', 14, cursorY)
    cursorY += 5

    autoTable(doc, {
      startY: cursorY,
      head: [['Total de Produtos', 'Ativos', 'Inactivos', 'Novos este mês']],
      body: [[
        String(resumo.value.totalProdutos ?? '—'),
        String(resumo.value.totalAtivos ?? '—'),
        String(resumo.value.totalInativos ?? '—'),
        String(resumo.value.novosEsteMes ?? '—'),
      ]],
      styles: { fontSize: 9, halign: 'center' },
      headStyles: { fillColor: [32, 29, 26] },
      margin: { left: 14, right: 14 },
    })

    cursorY = doc.lastAutoTable.finalY + 10
  }

  // Lista de produtos
  doc.setFontSize(11)
  doc.setTextColor(32, 29, 26)
  doc.text('Produtos', 14, cursorY)
  cursorY += 5

  const linhas = produtosListados.value.map((p) => [
    p.nome || '—',
    p.codigo || '—',
    p.cor || '—',
    `${Number(p.preco).toFixed(2)} Kz`,
    (p.unidade || '—').toUpperCase(),
    !p.controlaEstoque ? 'Não controla' : `${p.quantidade ?? 0} un.`,
    p.ativo ? 'Ativo' : 'Inativo',
  ])

  autoTable(doc, {
    startY: cursorY,
    head: [['Produto', 'Código', 'Cor', 'Preço', 'Unidade', 'Estoque', 'Status']],
    body: linhas,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [32, 29, 26] },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        data.cell.styles.textColor = data.cell.raw === 'Ativo' ? [47, 125, 83] : [181, 67, 60]
      }
    },
  })

  doc.setFontSize(8)
  doc.setTextColor(150)
  const totalPaginas = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i)
    doc.text(`Página ${i} de ${totalPaginas}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 8)
  }

  doc.save(`produtos-${new Date().toISOString().slice(0, 10)}.pdf`)
}

// Watch para recarregar ao mudar busca ou status
watch([() => filtros.value.busca, () => filtros.value.status], () => carregarProdutos(true))

onMounted(async () => {
  await carregarProdutos()
  carregarResumo()

  // Veio da tela de Detalhes do Produto clicando em "Editar Produto"
  if (route.query.editar) {
    try {
      const produto = await store.dispatch('getProduct', route.query.editar)
      await editarProduto(produto)
    } catch (err) {
      toast('Não foi possível carregar o produto para edição', { type: 'error', autoClose: 2500 })
    } finally {
      router.replace({ path: '/produtos' }) // limpa a query da URL
    }
  }

  const blockCtrlJ = (e) => {
    if (e.ctrlKey && (e.key === 'j' || e.keyCode === 74)) {
      e.preventDefault()
    }
  }
  document.addEventListener('keydown', blockCtrlJ)

  onUnmounted(() => {
    document.removeEventListener('keydown', blockCtrlJ)
  })
})

// Paginação
const mudarPagina = (novaPagina) => {
  if (novaPagina < 1 || novaPagina > paginationInfo.value.totalPages) return
  filtros.value.page = novaPagina
  carregarProdutos()
}

// Modal e formulário
const resetForm = () => {
  form.value = {
    nome: '',
    codigoBarras: '',
    tipo: '',
    descricao: '',
    cor: '',
    moeda: 'Kz',
    quantidade: 0,
    precoVenda: '',
    custo: '',
    controlaEstoque: false,
    estoqueMinimo: 0,
    ativo: true
  }
  errors.value = {}
  modoEdicao.value = false
  produtoSelecionado.value = null
}

const fecharModal = (modalId = 'novoProdutoModal') => {
  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    const modalInstance = Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }
    resetForm();
  }
};

const abrirModalNovo = (modalId) => {
  resetForm()
  new Modal(document.getElementById(modalId)).show()
}

const editarProduto = async (produto) => {
  modoEdicao.value = true
  produtoSelecionado.value = produto

  form.value = {
    nome: produto.nome,
    codigoBarras: produto.codigo || '',
    tipo: produto.unidade === 'servico' ? 'servico' : 'produto',
    descricao: produto.descricao || '',
    cor: produto.cor || '',
    moeda: 'Kz',
    precoVenda: produto.preco,
    custo: produto.custo || 0,
    quantidade: produto.quantidade || 0,
    controlaEstoque: produto.controlaEstoque || false,
    estoqueMinimo: produto.estoqueMinimo || 0,
    ativo: produto.ativo
  }
  new Modal(document.getElementById('novoProdutoModal')).show()
}

const validarFormulario = () => {
  errors.value = {}

  if (!form.value.nome?.trim()) errors.value.nome = 'Nome obrigatório'
  if (!form.value.moeda) errors.value.moeda = 'Moeda obrigatória'
  if (!form.value.precoVenda || form.value.precoVenda <= 0) {
    errors.value.precoVenda = 'Preço de venda deve ser maior que zero'
  }

  return Object.keys(errors.value).length === 0
}

const salvarProduto = async () => {
  if (!validarFormulario()) return;

  salvando.value = true;

  try {
    const payload = {
      nome: form.value.nome.trim(),
      codigo: form.value.codigoBarras?.trim() || undefined,
      descricao: form.value.descricao?.trim() || undefined,
      cor: form.value.cor?.trim() || undefined,
      custo: form.value.custo || 0,
      preco: Number(form.value.precoVenda),
      unidade: form.value.tipo === 'servico' ? 'servico' : 'un',
      tributavel: true,
      ativo: form.value.ativo,
      controlaEstoque: form.value.controlaEstoque,
      quantidade: form.value.controlaEstoque ? Number(form.value.quantidade) || 0 : 0,
      estoqueMinimo: form.value.controlaEstoque ? Number(form.value.estoqueMinimo) || 0 : 0,
    };

    if (modoEdicao.value && produtoSelecionado.value?._id) {
      await store.dispatch('updateProduct', {
        id: produtoSelecionado.value._id,
        payload
      });
      toast('Produto atualizado com sucesso!', {
        position: "top-right",
        autoClose: 2500,
        type: 'success'
      })
    } else {
      await store.dispatch('createProduct', payload);
      toast('Produto criado com sucesso!', {
        position: "top-right",
        autoClose: 2500,
        type: 'success'
      })
    }
    resetForm();
    carregarProdutos();
    carregarResumo();

  } catch (err) {
    toast('Erro ao salvar produto!', {

      position: "top-right",
      autoClose: 2500,
      type: 'erro'
    })
  } finally {
    fecharModal("novoProdutoModal")
    salvando.value = false;
  }
};

const confirmarExclusao = (produto) => {
  produtoSelecionado.value = produto
  new Modal(document.getElementById('confirmarExclusaoModal')).show()
}

const excluirProduto = async () => {
  if (!produtoSelecionado.value?._id) return;

  excluindo.value = true;

  try {
    await store.dispatch('deleteProduct', produtoSelecionado.value._id);

    fecharModal('confirmarExclusaoModal')
    toast('Produto excluído com sucesso!', {

      position: "top-right",
      autoClose: 2500,
      type: 'success'
    })
    produtoSelecionado.value = null;
    carregarProdutos();
    carregarResumo();

  } catch (err) {
    toast('Erro ao excluir produto!', {

      position: "top-right",
      autoClose: 2500,
      type: 'error'
    })
  } finally {
    excluindo.value = false;
  }
}

const limparFiltros = () => {
  filtros.value.busca = ''
  filtros.value.status = ''
}

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

.text-ink {
  color: var(--ink);
}

.text-rule {
  color: var(--rule);
}

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

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

.stat-tab {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
}

.stat-blue {
  background: #eaf1ff;
  border-color: #c7dbff;
}

.stat-blue .stat-tab {
  background: #2563eb;
}

.stat-blue .stat-value {
  color: #1d4ed8;
}

.stat-rose {
  background: #fff0f1;
  border-color: #ffd0d4;
}

.stat-rose .stat-tab {
  background: #e11d48;
}

.stat-rose .stat-value {
  color: #be123c;
}

.stat-emerald {
  background: #ecfdf5;
  border-color: #bdf0d6;
}

.stat-emerald .stat-tab {
  background: #059669;
}

.stat-emerald .stat-value {
  color: #047857;
}

.stat-amber {
  background: #fff8e8;
  border-color: #fbe2a6;
}

.stat-amber .stat-tab {
  background: #d97706;
}

.stat-amber .stat-value {
  color: #b45309;
}

.stat-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ink-soft);
  margin-top: 0.4rem;
}

.stat-value {
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 600;
  font-size: 1.5rem;
  color: var(--ink);
  margin-top: 0.15rem;
}

/* Botões */
.btn-primary {
  background: var(--ink);
  color: #fff;
  border: 1px solid var(--ink);
  border-radius: 8px;
  padding: 0.55rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.88;
}

.btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-primary.btn-danger {
  background: var(--rule);
  border-color: var(--rule);
}

.btn-ghost {
  background: #fff;
  border: 1px solid var(--paper-line);
  color: var(--ink-soft);
  border-radius: 8px;
  padding: 0.55rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.btn-ghost:hover {
  border-color: var(--ink);
  color: var(--ink);
}

/* Filtros */
.filtros-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.select-narrow {
  max-width: 220px;
}

.ledger-input {
  width: 100%;
  border: 1px solid var(--paper-line);
  background: var(--paper);
  border-radius: 8px;
  padding: 0.55rem 0.8rem;
  font-size: 0.875rem;
  color: var(--ink);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.ledger-input:focus {
  border-color: var(--ink);
}

.ledger-input:disabled {
  background: #f1efe9;
  color: #9a938a;
}

.input-invalid {
  border-color: var(--rule) !important;
}

.error-text {
  color: var(--rule);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.search-icon {
  position: absolute;
  left: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--ink-soft);
}

.ledger-label {
  display: block;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ink-soft);
  margin-bottom: 0.3rem;
  font-weight: 600;
}

.filtro-ativo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #eef4ff;
  border: 1px solid #c7d9f6;
  color: #2a4b8d;
  font-size: 0.85rem;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  width: fit-content;
}

.filtro-ativo button {
  color: #1d4e89;
  font-weight: 600;
  text-decoration: underline;
}

/* Grupo de input com prefixo (moeda) */
.ledger-input-group {
  display: flex;
  border: 1px solid var(--paper-line);
  border-radius: 8px;
  overflow: hidden;
  background: var(--paper);
}

.ledger-input-group:focus-within {
  border-color: var(--ink);
}

.ledger-input-prefix {
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  background: #f1efe9;
  color: var(--ink-soft);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.8rem;
  font-weight: 600;
  border-right: 1px solid var(--paper-line);
}

.ledger-input-grouped {
  border: none;
  border-radius: 0;
  background: var(--paper);
}

/* Seções do formulário */
.form-section {
  padding-bottom: 1.25rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px dashed var(--paper-line);
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.form-section-title {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--rule);
  margin-bottom: 0.85rem;
}

/* Sugestões de cor */
.cor-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.6rem;
}

.cor-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.65rem 0.3rem 0.4rem;
  border-radius: 999px;
  border: 1px solid var(--paper-line);
  background: #fff;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ink-soft);
  cursor: pointer;
  transition: all 0.15s ease;
}

.cor-chip:hover {
  border-color: var(--ink);
  background: var(--paper);
}

.cor-chip-active {
  border-color: var(--ink);
  background: var(--ink);
  color: #fff;
  font-weight: 700;
}

.cor-chip-swatch {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}

.cor-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.875rem;
  color: var(--ink-soft);
}

.cor-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}

/* Switch estilizado */
.switch-label {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ink-soft);
  cursor: pointer;
}

.switch-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-track {
  position: relative;
  width: 38px;
  height: 22px;
  background: #d8d1c3;
  border-radius: 999px;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.switch-input:checked+.switch-track {
  background: var(--ink);
}

.switch-input:checked+.switch-track .switch-thumb {
  transform: translateX(16px);
}

.switch-input:focus-visible+.switch-track {
  box-shadow: 0 0 0 3px rgba(32, 29, 26, 0.2);
}

/* Painel/tabela em estilo caderno pautado */
.ledger-panel {
  background: #fff;
  border: 1px solid var(--paper-line);
  border-radius: 12px;
  overflow: hidden;
}

.ledger-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.ledger-table thead th {
  text-align: left;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
  background: var(--paper);
  padding: 0.65rem 1rem;
  border-bottom: 2px solid var(--ink);
  white-space: nowrap;
}

.ledger-table tbody td {
  padding: 0.75rem 1rem;
  border-bottom: 1px dashed var(--paper-line);
  vertical-align: middle;
}

.ledger-table tbody tr:last-child td {
  border-bottom: none;
}

.ledger-table tbody tr td:first-child {
  border-left: 3px solid var(--rule);
}

.row-clickable {
  cursor: pointer;
  transition: background 0.12s ease;
}

.row-clickable:hover {
  background: #fbfaf6;
}

.actions-cell {
  text-align: right;
  white-space: nowrap;
}

.status-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 0.4rem;
}

.dot-rule {
  background: var(--rule);
}

.dot-ok {
  background: var(--ok);
}

.dot-muted {
  background: #b6afa2;
}

/* Botões de ação (ícone) */
.btn-icon {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid var(--paper-line);
  background: #fff;
  color: var(--ink-soft);
  margin-left: 0.25rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-icon:hover {
  border-color: var(--ink);
  color: var(--ink);
}

.btn-icon.btn-rule:hover {
  border-color: var(--rule);
  color: var(--rule);
}

/* Loader */
.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--paper-line);
  border-top-color: var(--ink);
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Paginação */
.ledger-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border-top: 1px solid var(--paper-line);
  background: var(--paper);
  font-size: 0.8rem;
  color: var(--ink-soft);
  gap: 1rem;
  flex-wrap: wrap;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--paper-line);
  background: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ink-soft);
  cursor: pointer;
  transition: all 0.15s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--ink);
  color: var(--ink);
}

.page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

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

.tab-btn.active {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
}

.tab-count {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  background: rgba(0, 0, 0, 0.08);
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
}

.tab-btn.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
}


.page-btn.active {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
}

/* Modais */
:deep(.ledger-modal.modal-content) {
  border-radius: 12px;
  border: none;
  box-shadow: 0 20px 40px -8px rgba(32, 29, 26, 0.25);
}

:deep(.ledger-modal .modal-header),
:deep(.ledger-modal .modal-footer) {
  border-color: var(--paper-line);
  padding: 1.1rem 1.4rem;
}

:deep(.ledger-modal .modal-title) {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: var(--ink);
}

:deep(.ledger-modal .modal-body) {
  padding: 1.4rem;
  max-height: 70vh;
  overflow-y: auto;
}

.modal.fade .modal-dialog {
  transition: transform 0.2s ease-out;
}

.toggle-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--paper-line);
  background: var(--paper);
  border-radius: 999px;
  padding: 0.4rem 0.85rem;
  font-size: 0.82rem;
  color: var(--ink-soft);
  transition: all 0.15s;
}

.toggle-pill.active {
  border-color: var(--rule);
  color: var(--rule);
  background: #fdf1f0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot-rule {
  background: var(--rule);
}

.dot-ok {
  background: var(--ok);
}

/* Tabela responsiva (empilha em cartões no mobile) */
@media (max-width: 767px) {
  .ledger-table {
    min-width: 0;
  }

  .ledger-table thead {
    display: none;
  }

  .ledger-table,
  .ledger-table tbody,
  .ledger-table tr,
  .ledger-table td {
    display: block;
    width: 100%;
  }

  .ledger-table tbody tr {
    border: 1px solid var(--paper-line);
    border-left: 3px solid var(--rule);
    border-radius: 10px;
    margin: 0.75rem;
    padding: 0.25rem 0;
  }

  .ledger-table tbody td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.6rem 1rem;
    border-bottom: 1px dashed var(--paper-line);
    text-align: right;
  }

  .ledger-table tbody tr td:first-child {
    border-left: none;
  }

  .ledger-table tbody tr td:last-child {
    border-bottom: none;
  }

  .ledger-table tbody td::before {
    content: attr(data-label);
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--ink-soft);
    text-align: left;
  }

  .actions-cell {
    justify-content: flex-end !important;
  }

  .ledger-footer {
    justify-content: center;
    text-align: center;
  }
}
</style>