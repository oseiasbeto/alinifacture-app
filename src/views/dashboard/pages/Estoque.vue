<template>
  <div class="ledger-scope space-y-6">
    <!-- Cabeçalho -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="ledger-title">Gestão de Estoque</h1>
        <p class="text-sm text-stone-500 mt-1">Níveis, entradas, saídas e ajustes de cada produto</p>
      </div>
      <button class="btn-ghost flex-1 sm:flex-none" :disabled="niveis.length === 0" @click="gerarPDFNiveis">
        ↓ Exportar
      </button>
    </div>

    <div v-if="produtoIdFiltro" class="filtro-ativo">
      <span>Mostrando apenas o produto selecionado nos detalhes.</span>
      <button @click="limparFiltroProduto">Ver todos</button>
    </div>

    <!-- Cartões de resumo -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="stat-card stat-blue">
        <span class="stat-tab"></span>
        <p class="stat-label">Produtos controlados</p>
        <p class="stat-value">{{ resumo?.totalControlados ?? '—' }}</p>
      </div>
      <div class="stat-card stat-rose">
        <span class="stat-tab"></span>
        <p class="stat-label">Estoque baixo</p>
        <p class="stat-value" :class="{ 'text-rule': (resumo?.totalBaixoEstoque || 0) > 0 }">
          {{ resumo?.totalBaixoEstoque ?? '—' }}
        </p>
      </div>
      <div class="stat-card stat-emerald">
        <span class="stat-tab"></span>
        <p class="stat-label">Unidades em estoque</p>
        <p class="stat-value">{{ resumo?.totalUnidades ?? '—' }}</p>
      </div>
      <div class="stat-card stat-amber">
        <span class="stat-tab"></span>
        <p class="stat-label">Valor potencial de venda</p>
        <p class="stat-value stat-money">{{ formatarMoeda(resumo?.valorTotalVenda) }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filtros-bar">
      <div class="relative flex-1 min-w-[220px]">
        <input type="text" v-model="filtros.busca" placeholder="Buscar produto..." class="ledger-input pl-9" />
        <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <button class="toggle-pill" :class="{ active: filtros.baixoEstoque }"
        @click="filtros.baixoEstoque = !filtros.baixoEstoque">
        <span class="dot" :class="filtros.baixoEstoque ? 'dot-rule' : 'dot-muted'"></span>
        Apenas estoque baixo
      </button>
    </div>

    <!-- Tabela / Loading / Error -->
    <div class="ledger-panel">
      <div v-if="niveisLoading" class="p-10 text-center text-stone-500">
        <div class="spinner"></div>
        <p class="mt-3 text-sm">Carregando estoque...</p>
      </div>

      <div v-else-if="niveisError" class="p-6 text-center text-rule">{{ niveisError }}</div>

      <div v-else-if="niveis.length === 0" class="p-10 text-center text-stone-500">
        Nenhum produto com controlo de estoque encontrado.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="ledger-table">
          <thead>
            <tr>
              <th class="text-left">Produto</th>
              <th class="text-left">Cor</th>
              <th class="text-right">Preço</th>
              <th class="text-right">Estoque</th>
              <th class="text-right">Mínimo</th>
              <th class="text-left">Status</th>
              <th class="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="produto in niveis" :key="produto._id">
              <td class="font-medium text-ink">{{ produto.nome }}</td>
              <td class="text-stone-500">{{ produto.cor || '—' }}</td>
              <td class="text-right num">{{ formatarMoeda(produto.preco) }}</td>
              <td class="text-right num">{{ produto.quantidade }}</td>
              <td class="text-right num text-stone-500">{{ produto.estoqueMinimo }}</td>
              <td>
                <span class="status-dot"
                  :class="produto.quantidade <= produto.estoqueMinimo ? 'dot-rule' : 'dot-ok'"></span>
                {{ produto.quantidade <= produto.estoqueMinimo ? 'Baixo' : 'Normal' }} </td>
              <td class="text-right whitespace-nowrap">
                <button class="btn-icon btn-ok" title="Entrada" @click="abrirMovimento(produto, 'entrada')">↑</button>
                <button class="btn-icon btn-rule" title="Saída" @click="abrirMovimento(produto, 'saida')">↓</button>
                <button class="btn-icon" title="Ajustar" @click="abrirMovimento(produto, 'ajuste')">✎</button>
                <button class="btn-icon" title="Histórico" @click="verHistorico(produto)">≡</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="ledger-footer" v-if="paginationNiveis?.totalPages >= 1">
        <div>
          Mostrando {{ (paginationNiveis.page - 1) * paginationNiveis.limit + 1 }}–
          {{ Math.min(paginationNiveis.page * paginationNiveis.limit, paginationNiveis.totalDocs) }} de
          {{ paginationNiveis.totalDocs }} produtos
        </div>
        <nav class="flex gap-1">
          <button class="page-btn" :disabled="paginationNiveis.page === 1"
            @click="mudarPagina(paginationNiveis.page - 1)">Anterior</button>
          <button v-for="n in Math.min(7, paginationNiveis.totalPages || 0)" :key="n" class="page-btn"
            :class="{ active: paginationNiveis.page === n }" @click="mudarPagina(n)">{{ n }}</button>
          <button class="page-btn" :disabled="!paginationNiveis.hasNextPage"
            @click="mudarPagina(paginationNiveis.page + 1)">Próxima</button>
        </nav>
      </div>
    </div>

    <!-- Modal Movimento -->
    <div class="modal fade" id="movimentoEstoqueModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content ledger-modal">
          <div class="modal-header">
            <h5 class="modal-title">
              <span class="badge-tipo" :class="'badge-' + tipoMovimento">{{ iconeMovimento }}</span>
              {{ tituloMovimento }}
            </h5>
            <button type="button" class="btn-close" @click="fecharModal('movimentoEstoqueModal')"></button>
          </div>
          <div class="modal-body">
            <p class="mb-4 text-sm">
              Produto: <strong>{{ produtoAtivo?.nome }}</strong>
              <span class="text-stone-500"> — estoque atual: <span class="num">{{ produtoAtivo?.quantidade
                  }}</span></span>
            </p>

            <div class="mb-3">
              <label class="ledger-label">
                {{ tipoMovimento === 'ajuste' ? 'Nova quantidade em estoque' : 'Quantidade' }}
              </label>
              <input type="number" min="0" class="ledger-input num" v-model="movimentoForm.quantidade" />
            </div>

            <div class="mb-3">
              <label class="ledger-label">Motivo</label>
              <input type="text" class="ledger-input" v-model="movimentoForm.motivo"
                :placeholder="tipoMovimento === 'entrada' ? 'Ex: Compra a fornecedor' : tipoMovimento === 'saida' ? 'Ex: Venda, perda/dano' : 'Ex: Correção de inventário'" />
            </div>

            <div class="mb-1">
              <label class="ledger-label">Observação</label>
              <textarea class="ledger-input" rows="2" v-model="movimentoForm.observacao"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="fecharModal('movimentoEstoqueModal')">Cancelar</button>
            <button type="button" class="btn-primary" :disabled="salvandoMovimento" @click="salvarMovimento">
              {{ salvandoMovimento ? 'Salvando...' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Histórico -->
    <div class="modal fade" id="historicoEstoqueModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content ledger-modal">
          <div class="modal-header">
            <h5 class="modal-title">Histórico — {{ produtoAtivo?.nome }}</h5>
            <button type="button" class="btn-close" @click="fecharModal('historicoEstoqueModal')"></button>
          </div>
          <div class="modal-body">

            <!-- Filtro de datas -->
            <div class="historico-filtros">
              <div class="preset-pills">
                <button class="pill-btn" :class="{ active: presetHistorico === 'hoje' }"
                  @click="aplicarPresetHistorico('hoje')">Hoje</button>
                <button class="pill-btn" :class="{ active: presetHistorico === 'semana' }"
                  @click="aplicarPresetHistorico('semana')">Esta semana</button>
                <button class="pill-btn" :class="{ active: presetHistorico === 'mes' }"
                  @click="aplicarPresetHistorico('mes')">Este mês</button>
                <button class="pill-btn" :class="{ active: presetHistorico === 'ano' }"
                  @click="aplicarPresetHistorico('ano')">Este ano</button>
                <button class="pill-btn" :class="{ active: presetHistorico === 'tudo' }"
                  @click="aplicarPresetHistorico('tudo')">Tudo</button>
              </div>

              <div class="date-range">
                <input type="date" class="ledger-input" v-model="historicoFiltros.dataInicio"
                  @change="presetHistorico = 'custom'" />
                <span class="text-stone-400 text-sm">até</span>
                <input type="date" class="ledger-input" v-model="historicoFiltros.dataFim"
                  @change="presetHistorico = 'custom'" />
              </div>

              <button class="btn-ghost btn-pdf" :disabled="movimentos.length === 0" @click="gerarPDFHistorico">
                ⭳ Gerar PDF
              </button>
            </div>

            <div v-if="movimentosLoading" class="text-center text-stone-500 py-6">Carregando...</div>
            <div v-else-if="movimentos.length === 0" class="text-center text-stone-500 py-6">
              Sem movimentações registadas neste período.
            </div>
            <table v-else class="ledger-table">
              <thead>
                <tr>
                  <th class="text-left">Data</th>
                  <th class="text-left">Tipo</th>
                  <th class="text-right">Qtd</th>
                  <th class="text-right">Antes → Depois</th>
                  <th class="text-left">Motivo</th>
                  <th class="text-left">Registado por</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="mov in movimentos" :key="mov._id">
                  <td class="text-stone-500 whitespace-nowrap">{{ formatarData(mov.createdAt) }}</td>
                  <td>
                    <span class="badge-tipo" :class="'badge-' + mov.tipo">{{ iconePorTipo(mov.tipo) }}</span>
                    {{ mov.tipo }}
                  </td>
                  <td class="text-right num">{{ mov.quantidade }}</td>
                  <td class="text-right num text-stone-500">{{ mov.quantidadeAnterior }} → {{ mov.quantidadeAtual }}
                  </td>
                  <td class="text-stone-500 truncate max-w-[120px]">{{ mov.motivo || '—' }}</td>
                  <td class="text-stone-500 truncate max-w-[120px]">{{ mov.usuario?.nomeProprio || 'Sistema' }}</td>
                </tr>
              </tbody>
            </table>
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
import { useRoute } from 'vue-router'
import { toast } from 'vue3-toastify'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const store = useStore()
const route = useRoute()

const filtros = ref({ busca: '', baixoEstoque: false, page: 1, limit: 10 })
const produtoIdFiltro = ref(route.query.produtoId || null)

const niveis = computed(() => store.getters.niveisEstoque || [])
const paginationNiveis = computed(() => store.getters.paginationNiveis || {})
const niveisLoading = computed(() => store.getters.niveisLoading || false)
const niveisError = computed(() => store.getters.niveisError || null)

const resumo = computed(() => store.getters.resumoEstoque)

const movimentos = computed(() => store.getters.movimentosEstoque || [])
const movimentosLoading = computed(() => store.getters.movimentosLoading || false)

const produtoAtivo = ref(null)
const tipoMovimento = ref('entrada') // 'entrada' | 'saida' | 'ajuste'
const movimentoForm = ref({ quantidade: '', motivo: '', observacao: '' })
const salvandoMovimento = ref(false)

const tituloMovimento = computed(() => ({
  entrada: 'Registar Entrada de Estoque',
  saida: 'Registar Saída de Estoque',
  ajuste: 'Ajustar Estoque',
}[tipoMovimento.value]))

const iconePorTipo = (tipo) => ({ entrada: '↑', saida: '↓', ajuste: '✎' }[tipo] || '•')
const iconeMovimento = computed(() => iconePorTipo(tipoMovimento.value))

const formatarMoeda = (v) =>
  `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(v) || 0)}kz`
  
const formatarData = (data) => new Date(data).toLocaleString('pt-PT')

const carregarNiveis = async (resetPage = false) => {
  if (resetPage) filtros.value.page = 1
  await store.dispatch('listarNiveisEstoque', {
    page: filtros.value.page,
    limit: filtros.value.limit,
    busca: filtros.value.busca.trim() || undefined,
    baixoEstoque: filtros.value.baixoEstoque || undefined,
    produtoId: produtoIdFiltro.value || undefined,
  })
}

const limparFiltroProduto = () => {
  produtoIdFiltro.value = null
  carregarNiveis(true)
}

watch([() => filtros.value.busca, () => filtros.value.baixoEstoque], () => carregarNiveis(true))

onMounted(async () => {
  await Promise.all([carregarNiveis(), store.dispatch('carregarResumoEstoque')])
})

const mudarPagina = (novaPagina) => {
  if (novaPagina < 1 || novaPagina > paginationNiveis.value.totalPages) return
  filtros.value.page = novaPagina
  carregarNiveis()
}

const fecharModal = (modalId) => {
  const el = document.getElementById(modalId)
  const instance = el && Modal.getInstance(el)
  if (instance) instance.hide()
}

const abrirMovimento = (produto, tipo) => {
  produtoAtivo.value = produto
  tipoMovimento.value = tipo
  movimentoForm.value = {
    quantidade: tipo === 'ajuste' ? produto.quantidade : '',
    motivo: '',
    observacao: '',
  }
  new Modal(document.getElementById('movimentoEstoqueModal')).show()
}

const salvarMovimento = async () => {
  if (movimentoForm.value.quantidade === '' || movimentoForm.value.quantidade < 0) {
    toast('Informe uma quantidade válida', { type: 'warning', autoClose: 2500 })
    return
  }

  salvandoMovimento.value = true
  try {
    const payload = {
      produtoId: produtoAtivo.value._id,
      quantidade: Number(movimentoForm.value.quantidade),
      motivo: movimentoForm.value.motivo?.trim() || undefined,
      observacao: movimentoForm.value.observacao?.trim() || undefined,
    }

    const acao = {
      entrada: 'registrarEntradaEstoque',
      saida: 'registrarSaidaEstoque',
      ajuste: 'ajustarEstoque',
    }[tipoMovimento.value]

    await store.dispatch(acao, payload)

    toast('Movimento registado com sucesso!', { type: 'success', autoClose: 2500 })
    fecharModal('movimentoEstoqueModal')
    await Promise.all([carregarNiveis(), store.dispatch('carregarResumoEstoque')])
  } catch (err) {
    toast(err.response?.data?.message || 'Erro ao registar movimento', { type: 'error', autoClose: 2500 })
  } finally {
    salvandoMovimento.value = false
  }
}

// --- Histórico: filtros de data + PDF ---
const presetHistorico = ref('mes')
const historicoFiltros = ref({ dataInicio: '', dataFim: '' })

const toISODate = (date) => date.toISOString().slice(0, 10)

const aplicarPresetHistorico = (preset) => {
  presetHistorico.value = preset
  const hoje = new Date()
  let inicio = ''
  let fim = toISODate(hoje)

  if (preset === 'hoje') {
    inicio = toISODate(hoje)
  } else if (preset === 'semana') {
    const diaSemana = hoje.getDay() === 0 ? 7 : hoje.getDay() // segunda como início da semana
    const seg = new Date(hoje)
    seg.setDate(hoje.getDate() - (diaSemana - 1))
    inicio = toISODate(seg)
  } else if (preset === 'mes') {
    inicio = toISODate(new Date(hoje.getFullYear(), hoje.getMonth(), 1))
  } else if (preset === 'ano') {
    inicio = toISODate(new Date(hoje.getFullYear(), 0, 1))
  } else if (preset === 'tudo') {
    inicio = ''
    fim = ''
  }

  historicoFiltros.value = { dataInicio: inicio, dataFim: fim }
}

const carregarMovimentos = async () => {
  if (!produtoAtivo.value) return
  await store.dispatch('listarMovimentosEstoque', {
    produto: produtoAtivo.value._id,
    page: 1,
    limit: 20,
    dataInicio: historicoFiltros.value.dataInicio || undefined,
    dataFim: historicoFiltros.value.dataFim || undefined,
  })
}

watch(historicoFiltros, carregarMovimentos, { deep: true })

const verHistorico = async (produto) => {
  produtoAtivo.value = produto
  new Modal(document.getElementById('historicoEstoqueModal')).show()
  aplicarPresetHistorico('mes') // dispara carregarMovimentos automaticamente via watch
}

const gerarPDFHistorico = () => {
  const doc = new jsPDF()

  doc.setFontSize(14)
  doc.text(`Histórico de Estoque — ${produtoAtivo.value?.nome || ''}`, 14, 16)

  doc.setFontSize(10)
  const periodo = historicoFiltros.value.dataInicio || historicoFiltros.value.dataFim
    ? `Período: ${historicoFiltros.value.dataInicio || '...'} até ${historicoFiltros.value.dataFim || '...'}`
    : 'Período: todos os registos'
  doc.text(periodo, 14, 22)

  const linhas = movimentos.value.map((mov) => [
    formatarData(mov.createdAt),
    mov.tipo,
    String(mov.quantidade),
    `${mov.quantidadeAnterior} → ${mov.quantidadeAtual}`,
    mov.motivo || '—',
    mov.usuario?.nomeProprio || 'Sistema',
  ])

  autoTable(doc, {
    startY: 28,
    head: [['Data', 'Tipo', 'Qtd', 'Antes → Depois', 'Motivo', 'Registado por']],
    body: linhas,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [32, 29, 26] },
  })

  const nomeArquivo = `historico-estoque-${(produtoAtivo.value?.nome || 'produto').replace(/\s+/g, '-').toLowerCase()}.pdf`
  doc.save(nomeArquivo)
}

const gerarPDFNiveis = () => {
  const doc = new jsPDF()

  // Cabeçalho
  doc.setFontSize(14)
  doc.text('Relatório de Estoque', 14, 16)

  doc.setFontSize(9)
  doc.setTextColor(120)
  const dataGeracao = new Date().toLocaleString('pt-PT')
  doc.text(`Gerado em: ${dataGeracao}`, 14, 22)

  let filtroTexto = 'Filtros: nenhum'
  const partesFiltro = []
  if (filtros.value.busca?.trim()) partesFiltro.push(`Busca: "${filtros.value.busca.trim()}"`)
  if (filtros.value.baixoEstoque) partesFiltro.push('Apenas estoque baixo')
  if (produtoIdFiltro.value) partesFiltro.push('Produto específico selecionado')
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
      head: [['Produtos Controlados', 'Estoque Baixo', 'Unidades em Estoque', 'Valor Potencial de Venda']],
      body: [[
        String(resumo.value.totalControlados ?? '—'),
        String(resumo.value.totalBaixoEstoque ?? '—'),
        String(resumo.value.totalUnidades ?? '—'),
        formatarMoeda(resumo.value.valorTotalVenda),
      ]],
      styles: { fontSize: 9, halign: 'center' },
      headStyles: { fillColor: [32, 29, 26] },
      margin: { left: 14, right: 14 },
    })

    cursorY = doc.lastAutoTable.finalY + 10
  }

  // Lista de produtos/níveis
  doc.setFontSize(11)
  doc.setTextColor(32, 29, 26)
  doc.text('Níveis de Estoque', 14, cursorY)
  cursorY += 5

  const linhas = niveis.value.map((p) => [
    p.nome || '—',
    p.cor || '—',
    formatarMoeda(p.preco),
    String(p.quantidade),
    String(p.estoqueMinimo),
    p.quantidade <= p.estoqueMinimo ? 'Baixo' : 'Normal',
  ])

  autoTable(doc, {
    startY: cursorY,
    head: [['Produto', 'Cor', 'Preço', 'Estoque', 'Mínimo', 'Status']],
    body: linhas,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [32, 29, 26] },
    margin: { left: 14, right: 14 },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        data.cell.styles.textColor = data.cell.raw === 'Baixo' ? [181, 67, 60] : [47, 125, 83]
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

  doc.save(`estoque-${new Date().toISOString().slice(0, 10)}.pdf`)
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

.bg-ink {
  background: var(--ink);
}

.bg-rule {
  background: var(--rule);
}

.bg-ok {
  background: var(--ok);
}

.num {
  font-family: 'IBM Plex Mono', monospace;
  font-variant-numeric: tabular-nums;
}

.stat-money {
  font-size: 1.1rem;
}

/* Cartões de resumo, estilo ficha/index-card, com cor viva própria */
.stat-card {
  position: relative;
  background: var(--paper);
  border: 1px solid var(--paper-line);
  border-radius: 10px;
  padding: 1rem 1.1rem 0.9rem;
  overflow: hidden;
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

/* Filtros */
.filtro-ativo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #eef4ff;
  border: 1px solid #c7d9f6;
  color: #2a4b8d;
  font-size: 0.85rem;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
}

.filtro-ativo button {
  color: #1d4e89;
  font-weight: 600;
  text-decoration: underline;
}

.filtros-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.ledger-input {
  width: 100%;
  border: 1px solid var(--paper-line);
  background: var(--paper);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: var(--ink);
  outline: none;
  transition: border-color 0.15s;
}

.ledger-input:focus {
  border-color: var(--ink);
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

.dot-muted {
  background: #b6afa2;
}

.dot-ok {
  background: var(--ok);
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
}

.ledger-table tbody td {
  padding: 0.65rem 1rem;
  border-bottom: 1px dashed var(--paper-line);
  vertical-align: middle;
}

.ledger-table tbody tr {
  position: relative;
}

.ledger-table tbody tr td:first-child {
  border-left: 3px solid var(--rule);
}

.ledger-table tbody tr:hover {
  background: #fbfaf6;
}

.status-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 0.4rem;
}

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
  transition: all 0.15s;
}

.btn-icon:hover {
  border-color: var(--ink);
  color: var(--ink);
}

.btn-icon.btn-ok:hover {
  border-color: var(--ok);
  color: var(--ok);
}

.btn-icon.btn-rule:hover {
  border-color: var(--rule);
  color: var(--rule);
}

.ledger-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--paper-line);
  background: var(--paper);
  font-size: 0.8rem;
  color: var(--ink-soft);
}

.page-btn {
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--paper-line);
  border-radius: 6px;
  background: #fff;
  font-size: 0.8rem;
}

.page-btn.active {
  background: var(--ink);
  color: #fff;
  border-color: var(--ink);
}

.page-btn:disabled {
  opacity: 0.4;
}

/* Botões */
.btn-primary {
  background: var(--ink);
  color: #fff;
  border-radius: 8px;
  padding: 0.5rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.btn-primary:disabled {
  opacity: 0.6;
}

.btn-ghost {
  background: #fff;
  border: 1px solid var(--paper-line);
  color: var(--ink-soft);
  font-weight: 600;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.btn-ghost:hover {
  border-color: var(--ink);
  color: var(--ink);
}

/* Modais */
.ledger-modal {
  border-radius: 12px;
  border: none;
}

.ledger-modal .modal-header,
.ledger-modal .modal-footer {
  border-color: var(--paper-line);
  padding: 1.1rem 1.4rem;
}

.ledger-modal .modal-body {
  padding: 1.4rem;
}

.ledger-modal .modal-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge-tipo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 0.75rem;
  color: #fff;
}

.badge-entrada {
  background: var(--ok);
}

.badge-saida {
  background: var(--rule);
}

.badge-ajuste {
  background: var(--amber);
}

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

/* Filtro de datas do histórico */
.historico-filtros {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
  padding-bottom: 0.9rem;
  border-bottom: 1px dashed var(--paper-line);
}

.preset-pills {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.pill-btn {
  font-size: 0.75rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  border: 1px solid var(--paper-line);
  background: var(--paper);
  color: var(--ink-soft);
}

.pill-btn.active {
  background: var(--ink);
  color: #fff;
  border-color: var(--ink);
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.date-range .ledger-input {
  width: auto;
  padding: 0.35rem 0.55rem;
  font-size: 0.8rem;
}

.btn-pdf {
  margin-left: auto;
  font-size: 0.8rem;
  padding: 0.4rem 0.9rem;
}
</style>