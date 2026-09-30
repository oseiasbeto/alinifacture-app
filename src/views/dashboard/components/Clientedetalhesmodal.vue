<template>
  <div ref="modalEl" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content cd-scope">
        <div class="modal-header">
          <div>
            <h5 class="modal-title">{{ cliente?.nome }}</h5>
            <div class="cd-sub">
              {{ cliente?.tipo === 'coletivo' ? 'Coletivo' : 'Singular' }}
              <template v-if="cliente?.nif"> · NIF {{ cliente.nif }}</template>
              <template v-if="cliente?.telefone"> · {{ cliente.telefone }}</template>
              <template v-if="cliente?.email"> · {{ cliente.email }}</template>
            </div>
          </div>
          <button type="button" class="btn-close" @click="fechar"></button>
        </div>

        <div class="modal-body">
          <!-- Filtro de período -->
          <div class="cd-toolbar">
            <div class="cd-seg">
              <button v-for="p in PERIODOS" :key="p.v" :class="{ active: periodo === p.v }" @click="mudarPeriodo(p.v)">
                {{ p.l }}
              </button>
            </div>

            <div v-if="periodo !== 'todos'" class="cd-nav">
              <button class="cd-navbtn" @click="deslocar(-1)" title="Período anterior">‹</button>
              <span class="cd-label">{{ rotuloPeriodo }}</span>
              <button class="cd-navbtn" :disabled="!podeAvancar" @click="deslocar(1)" title="Próximo período">›</button>
              <button class="cd-link" @click="irParaHoje">Hoje</button>
            </div>

            <button class="cd-btn ms-auto" :disabled="!dados || exportando" @click="exportarExtrato">
              {{ exportando ? 'A gerar…' : '↓ Extrato PDF' }}
            </button>
          </div>

          <div v-if="loading && !dados" class="cd-empty">Carregando…</div>
          <div v-else-if="erro" class="cd-empty cd-err">{{ erro }}</div>

          <template v-else-if="dados">
            <div :class="{ 'cd-loading': loading }">
              <!-- KPIs do período -->
              <div class="cd-grid">
                <div class="cd-card">
                  <span class="cd-k">Total gasto</span>
                  <span class="cd-v">{{ kz(dados.kpis.valorTotal) }}</span>
                  <span v-if="variacao !== null" class="cd-delta" :class="variacao >= 0 ? 'up' : 'down'">
                    {{ variacao >= 0 ? '▲' : '▼' }} {{ Math.abs(variacao).toFixed(1) }}% vs período anterior
                  </span>
                  <span v-else-if="dados.comparacao" class="cd-delta">Sem compras no período anterior</span>
                </div>
                <div class="cd-card">
                  <span class="cd-k">Pedidos</span>
                  <span class="cd-v">{{ dados.kpis.totalPedidos }}</span>
                  <span class="cd-delta">{{ dados.kpis.quantidadeItens }} itens</span>
                </div>
                <div class="cd-card">
                  <span class="cd-k">Ticket médio</span>
                  <span class="cd-v">{{ kz(dados.kpis.ticketMedio) }}</span>
                  <span class="cd-delta">Maior pedido: {{ kz(dados.kpis.maiorPedido) }}</span>
                </div>
                <div class="cd-card">
                  <span class="cd-k">Última compra</span>
                  <span class="cd-v cd-v-sm">{{ data(dados.geral.ultimaCompra) }}</span>
                  <span class="cd-delta">
                    <template v-if="dados.geral.diasDesdeUltimaCompra !== null">
                      há {{ dados.geral.diasDesdeUltimaCompra }} dia(s)
                    </template>
                    <template v-else>Nunca comprou</template>
                  </span>
                </div>
              </div>

              <!-- Histórico geral + alertas -->
              <div class="cd-strip">
                <span><b>Histórico total:</b> {{ dados.geral.totalPedidos }} pedidos · {{ kz(dados.geral.valorTotal) }}</span>
                <span v-if="dados.geral.primeiraCompra"><b>Cliente desde:</b> {{ data(dados.geral.primeiraCompra) }}</span>
                <span v-if="dados.geral.intervaloMedioDias !== null">
                  <b>Compra em média a cada</b> {{ dados.geral.intervaloMedioDias }} dias
                </span>
                <span v-if="dados.ordensSaquePendentes.quantidade" class="cd-warn">
                  ⚠ {{ dados.ordensSaquePendentes.quantidade }} ordem(ns) de saque pendente(s) —
                  {{ kz(dados.ordensSaquePendentes.valor) }}
                </span>
              </div>

              <!-- Gráfico -->
              <div class="cd-panel">
                <div class="cd-panel-title">Valor gasto por {{ periodo === 'ano' || periodo === 'todos' ? 'mês' : 'dia' }}</div>
                <div v-if="!dados.kpis.totalPedidos" class="cd-empty">Sem compras neste período.</div>
                <div v-else class="cd-bars">
                  <div v-for="b in dados.serie" :key="b.chave" class="cd-bar-col"
                    :title="`${rotuloBarra(b.chave, true)}: ${kz(b.valor)} (${b.pedidos} pedido(s))`">
                    <div class="cd-bar" :style="{ height: altura(b.valor) + '%' }" :class="{ zero: !b.valor }"></div>
                    <span class="cd-bar-l">{{ rotuloBarra(b.chave) }}</span>
                  </div>
                </div>
              </div>

              <!-- Quebras -->
              <div class="cd-two">
                <div class="cd-panel">
                  <div class="cd-panel-title">Por método de pagamento</div>
                  <div v-if="!dados.porMetodo.length" class="cd-empty sm">—</div>
                  <div v-for="m in dados.porMetodo" :key="m.metodo" class="cd-row">
                    <span>{{ m.metodo }} <small>({{ m.pedidos }})</small></span>
                    <span class="num">{{ kz(m.valor) }}</span>
                  </div>
                </div>
                <div class="cd-panel">
                  <div class="cd-panel-title">Produtos / serviços mais comprados</div>
                  <div v-if="!dados.porTipoProduto.length" class="cd-empty sm">—</div>
                  <div v-for="t in dados.porTipoProduto" :key="t.tipo" class="cd-row">
                    <span>{{ t.tipo }} <small>({{ t.pedidos }})</small></span>
                    <span class="num">{{ kz(t.valor) }}</span>
                  </div>
                </div>
              </div>

              <!-- Lista de pedidos -->
              <div class="cd-panel p-0">
                <div class="cd-panel-title px-3 pt-3">Pedidos do período</div>
                <div class="overflow-x-auto">
                  <table class="cd-table">
                    <thead>
                      <tr>
                        <th>Nº Pedido</th><th>Data</th><th>Produto/Serviço</th>
                        <th class="r">Qtd</th><th>Pagamento</th><th>Estado</th><th class="r">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="!dados.pedidos.docs.length">
                        <td colspan="7" class="cd-empty sm">Nenhum pedido.</td>
                      </tr>
                      <tr v-for="p in dados.pedidos.docs" :key="p._id">
                        <td class="num">{{ p.numeroPedido }}</td>
                        <td>{{ data(p.createdAt) }}</td>
                        <td>{{ p.tipoProduto }}</td>
                        <td class="r num">{{ p.quantidade }}</td>
                        <td>
                          {{ p.metodoPagamento }}
                          <small v-if="p.tipoPagamento === 'ordem_saque' && p.ordemSaque?.estado === 'pendente'" class="cd-warn">
                            (por receber)
                          </small>
                        </td>
                        <td>{{ STATUS_LABEL[p.status] || p.status }}</td>
                        <td class="r num">{{ kz(p.valor) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-if="dados.pedidos.totalPages > 1" class="cd-pager">
                  <span>Página {{ dados.pedidos.page }} de {{ dados.pedidos.totalPages }} · {{ dados.pedidos.totalDocs }} pedidos</span>
                  <div>
                    <button class="cd-btn" :disabled="page === 1" @click="page--">Anterior</button>
                    <button class="cd-btn" :disabled="!dados.pedidos.hasNext" @click="page++">Próxima</button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Modal } from 'bootstrap'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useStore } from 'vuex'

const store = useStore()
const buscarCompras = (id, params) => store.dispatch('carregarComprasCliente', { id, ...params })

const PERIODOS = [
  { v: 'semana', l: 'Semana' },
  { v: 'mes', l: 'Mês' },
  { v: 'ano', l: 'Ano' },
  { v: 'todos', l: 'Tudo' },
]
const STATUS_LABEL = {
  pendente: 'Pendente',
  em_execucao: 'Em execução',
  pronto: 'Pronto',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const modalEl = ref(null)
let modal = null

const cliente = ref(null)
const periodo = ref('mes')
const referencia = ref('')
const page = ref(1)
const dados = ref(null)
const loading = ref(false)
const erro = ref('')
const exportando = ref(false)

// ── helpers ──
const pad = (n) => String(n).padStart(2, '0')
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const kz = (v) =>
  `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(v) || 0)}kz`
  
const data = (d) => (d ? new Date(d).toLocaleDateString('pt-PT') : '—')

// ── navegação de período ──
const deslocar = (dir) => {
  const [a, m, d] = referencia.value.split('-').map(Number)
  const dt =
    periodo.value === 'ano' ? new Date(a + dir, m - 1, 1)
    : periodo.value === 'mes' ? new Date(a, m - 1 + dir, 1)
    : new Date(a, m - 1, d + 7 * dir)
  referencia.value = fmt(dt)
}
const irParaHoje = () => (referencia.value = fmt(new Date()))
const mudarPeriodo = (p) => {
  periodo.value = p
  referencia.value = fmt(new Date())
}

const podeAvancar = computed(() => {
  if (!dados.value?.intervalo) return false
  return new Date(dados.value.intervalo.fim) <= new Date()
})

const rotuloPeriodo = computed(() => {
  const [a, m, d] = (referencia.value || fmt(new Date())).split('-').map(Number)
  if (periodo.value === 'ano') return String(a)
  if (periodo.value === 'mes') {
    const s = new Date(a, m - 1, 1).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
  const dow = (new Date(a, m - 1, d).getDay() + 6) % 7
  const ini = new Date(a, m - 1, d - dow)
  const fim = new Date(a, m - 1, d - dow + 6)
  return `${ini.toLocaleDateString('pt-PT')} – ${fim.toLocaleDateString('pt-PT')}`
})

// ── carregamento ──
const carregar = async () => {
  if (!cliente.value) return
  loading.value = true
  erro.value = ''
  try {
    dados.value = await buscarCompras(cliente.value._id, {
      periodo: periodo.value,
      referencia: referencia.value,
      page: page.value,
      limit: 10,
    })
  } catch (e) {
    erro.value = e.response?.data?.message || 'Erro ao carregar as compras do cliente'
  } finally {
    loading.value = false
  }
}

watch([periodo, referencia], () => {
  page.value = 1
  carregar()
})
watch(page, carregar)

// ── gráfico ──
const maxValor = computed(() => Math.max(1, ...(dados.value?.serie || []).map((s) => s.valor)))
const altura = (v) => (v ? Math.max(3, (v / maxValor.value) * 100) : 1)
const rotuloBarra = (chave, completo = false) => {
  if (chave.length === 7) {
    const [a, m] = chave.split('-')
    return completo || periodo.value === 'todos' ? `${MESES[+m - 1]}/${a.slice(2)}` : MESES[+m - 1]
  }
  return completo ? new Date(chave + 'T12:00:00').toLocaleDateString('pt-PT') : chave.slice(8)
}

const variacao = computed(() => {
  const c = dados.value?.comparacao
  if (!c || !c.valor) return null
  return ((dados.value.kpis.valorTotal - c.valor) / c.valor) * 100
})

// ── extrato PDF (todos os pedidos do período) ──
const exportarExtrato = async () => {
  exportando.value = true
  try {
    const full = await buscarCompras(cliente.value._id, {
      periodo: periodo.value,
      referencia: referencia.value,
      page: 1,
      limit: 500,
    })
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text(`Extrato de compras — ${cliente.value.nome}`, 14, 16)
    doc.setFontSize(9)
    doc.setTextColor(120)
    doc.text(`Período: ${periodo.value === 'todos' ? 'Todo o histórico' : rotuloPeriodo.value}`, 14, 22)
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, 14, 27)

    autoTable(doc, {
      startY: 33,
      head: [['Total gasto', 'Pedidos', 'Itens', 'Ticket médio']],
      body: [[kz(full.kpis.valorTotal), full.kpis.totalPedidos, full.kpis.quantidadeItens, kz(full.kpis.ticketMedio)]],
      styles: { fontSize: 9, halign: 'center' },
      headStyles: { fillColor: [32, 29, 26] },
    })

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [['Nº Pedido', 'Data', 'Produto/Serviço', 'Qtd', 'Pagamento', 'Valor']],
      body: full.pedidos.docs.map((p) => [
        p.numeroPedido, data(p.createdAt), p.tipoProduto, p.quantidade, p.metodoPagamento, kz(p.valor),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [32, 29, 26] },
      columnStyles: { 5: { halign: 'right' } },
    })

    doc.save(`extrato-${cliente.value.nome.replace(/\s+/g, '-').toLowerCase()}-${fmt(new Date())}.pdf`)
  } catch (e) {
    erro.value = 'Não foi possível gerar o extrato'
  } finally {
    exportando.value = false
  }
}

// ── API pública do componente ──
const abrir = (c) => {
  cliente.value = c
  dados.value = null
  erro.value = ''
  page.value = 1
  periodo.value = 'mes'
  referencia.value = fmt(new Date())
  carregar()
  modal = Modal.getOrCreateInstance(modalEl.value)
  modal.show()
}
const fechar = () => modal?.hide()

defineExpose({ abrir })
</script>

<style scoped>
.cd-scope {
  --ink: #201d1a; --ink-soft: #4a453f; --paper: #faf8f3; --paper-line: #e7e0d3;
  --rule: #b5433c; --ok: #2f7d53;
  border-radius: 12px; border: none; color: var(--ink);
}
.cd-scope .modal-header { border-color: var(--paper-line); padding: 1.1rem 1.4rem; align-items: flex-start; }
.cd-scope .modal-title { font-weight: 700; }
.cd-scope .modal-body { padding: 1.2rem 1.4rem; background: var(--paper); }
.cd-sub { font-size: .8rem; color: var(--ink-soft); margin-top: .15rem; }

.cd-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; margin-bottom: 1rem; }
.cd-seg { display: inline-flex; border: 1px solid var(--paper-line); border-radius: 999px; background: #fff; overflow: hidden; }
.cd-seg button { border: 0; background: transparent; padding: .4rem .95rem; font-size: .82rem; font-weight: 600; color: var(--ink-soft); }
.cd-seg button.active { background: var(--ink); color: #fff; }
.cd-nav { display: inline-flex; align-items: center; gap: .5rem; }
.cd-navbtn { width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--paper-line); background: #fff; font-size: 1.1rem; line-height: 1; }
.cd-navbtn:disabled { opacity: .35; }
.cd-label { min-width: 150px; text-align: center; font-weight: 600; font-size: .9rem; }
.cd-link { border: 0; background: none; color: var(--rule); font-size: .8rem; font-weight: 600; }
.cd-btn { background: #fff; border: 1px solid var(--paper-line); border-radius: 8px; padding: .4rem .9rem; font-size: .82rem; font-weight: 600; color: var(--ink-soft); margin-left: .35rem; }
.cd-btn:hover:not(:disabled) { border-color: var(--ink); color: var(--ink); }
.cd-btn:disabled { opacity: .45; }

.cd-loading { opacity: .55; transition: opacity .15s; pointer-events: none; }
.cd-empty { padding: 2rem; text-align: center; color: var(--ink-soft); }
.cd-empty.sm { padding: .75rem; font-size: .85rem; }
.cd-err { color: var(--rule); }

.cd-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: .8rem; margin-bottom: .9rem; }
.cd-card { background: #fff; border: 1px solid var(--paper-line); border-top: 4px solid var(--ink); border-radius: 10px; padding: .85rem 1rem; display: flex; flex-direction: column; gap: .2rem; }
.cd-k { font-size: .7rem; text-transform: uppercase; letter-spacing: .05em; color: var(--ink-soft); }
.cd-v { font-family: 'IBM Plex Mono', monospace; font-weight: 600; font-size: 1.3rem; }
.cd-v-sm { font-size: 1.1rem; }
.cd-delta { font-size: .75rem; color: var(--ink-soft); }
.cd-delta.up { color: var(--ok); font-weight: 600; }
.cd-delta.down { color: var(--rule); font-weight: 600; }

.cd-strip { display: flex; flex-wrap: wrap; gap: .4rem 1.4rem; font-size: .82rem; color: var(--ink-soft); background: #fff; border: 1px dashed var(--paper-line); border-radius: 10px; padding: .6rem .9rem; margin-bottom: .9rem; }
.cd-warn { color: var(--rule); font-weight: 600; }

.cd-panel { background: #fff; border: 1px solid var(--paper-line); border-radius: 10px; padding: .9rem 1rem; margin-bottom: .9rem; }
.cd-panel.p-0 { padding: 0; }
.cd-panel-title { font-size: .72rem; text-transform: uppercase; letter-spacing: .05em; color: var(--ink-soft); font-weight: 700; margin-bottom: .6rem; }
.cd-two { display: grid; grid-template-columns: 1fr 1fr; gap: .9rem; }
@media (max-width: 768px) { .cd-two { grid-template-columns: 1fr; } }
.cd-two .cd-panel { margin-bottom: .9rem; }
.cd-row { display: flex; justify-content: space-between; gap: 1rem; padding: .35rem 0; border-bottom: 1px dashed var(--paper-line); font-size: .85rem; }
.cd-row:last-child { border-bottom: 0; }
.cd-row small { color: var(--ink-soft); }
.num { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }

.cd-bars { display: flex; align-items: flex-end; gap: 3px; height: 170px; padding-top: .5rem; overflow-x: auto; }
.cd-bar-col { flex: 1 0 14px; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; min-width: 14px; }
.cd-bar { width: 100%; max-width: 34px; background: var(--ink); border-radius: 3px 3px 0 0; min-height: 1px; }
.cd-bar.zero { background: var(--paper-line); }
.cd-bar-l { font-size: .62rem; color: var(--ink-soft); margin-top: 4px; white-space: nowrap; }

.cd-table { width: 100%; border-collapse: collapse; font-size: .85rem; }
.cd-table th { font-size: .68rem; text-transform: uppercase; letter-spacing: .05em; color: var(--ink-soft); background: var(--paper); padding: .55rem .9rem; border-bottom: 2px solid var(--ink); text-align: left; }
.cd-table td { padding: .55rem .9rem; border-bottom: 1px dashed var(--paper-line); }
.cd-table .r { text-align: right; }
.cd-pager { display: flex; justify-content: space-between; align-items: center; padding: .7rem 1rem; border-top: 1px solid var(--paper-line); font-size: .8rem; color: var(--ink-soft); }
</style>