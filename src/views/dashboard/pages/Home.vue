<template>
  <div class="ledger-scope space-y-6">
    <!-- Cabeçalho -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="ledger-title">Dashboard</h1>
        <p class="text-sm text-stone-500 mt-1">Ganhos, despesas e o estado geral da gráfica</p>
      </div>
    </div>

    <!-- Filtro de período -->
    <div class="periodo-bar">
      <div class="preset-pills">
        <button class="pill-btn" :class="{ active: preset === 'hoje' }" @click="aplicarPreset('hoje')">Hoje</button>
        <button class="pill-btn" :class="{ active: preset === 'semana' }" @click="aplicarPreset('semana')">Esta semana</button>
        <button class="pill-btn" :class="{ active: preset === 'mes' }" @click="aplicarPreset('mes')">Este mês</button>
        <button class="pill-btn" :class="{ active: preset === 'ano' }" @click="aplicarPreset('ano')">Este ano</button>
      </div>
      <div class="date-range">
        <input type="date" class="ledger-input" v-model="filtros.dataInicio" @change="preset = 'custom'; carregar()" />
        <span class="text-stone-400 text-sm">até</span>
        <input type="date" class="ledger-input" v-model="filtros.dataFim" @change="preset = 'custom'; carregar()" />
      </div>
    </div>

    <div v-if="loadingDashboard" class="p-10 text-center text-stone-500">
      <div class="spinner"></div>
      <p class="mt-3 text-sm">Calculando dashboard...</p>
    </div>

    <div v-else-if="errorDashboard" class="p-6 text-center text-rule">{{ errorDashboard }}</div>

    <template v-else-if="dashboard">
      <!-- Cartões de resumo -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="stat-card stat-emerald">
          <span class="stat-tab"></span>
          <p class="stat-label">Receitas</p>
          <p class="stat-value">{{ formatarMoeda(dashboard.receitas) }}</p>
        </div>
        <div class="stat-card stat-rose">
          <span class="stat-tab"></span>
          <p class="stat-label">Despesas</p>
          <p class="stat-value">{{ formatarMoeda(dashboard.despesas) }}</p>
        </div>
        <div class="stat-card" :class="dashboard.lucro >= 0 ? 'stat-blue' : 'stat-rose'">
          <span class="stat-tab"></span>
          <p class="stat-label">Lucro</p>
          <p class="stat-value">{{ formatarMoeda(dashboard.lucro) }}</p>
        </div>
        <div class="stat-card stat-amber">
          <span class="stat-tab"></span>
          <p class="stat-label">Pedidos no período</p>
          <p class="stat-value">{{ dashboard?.pedidos?.total }}</p>
        </div>
      </div>

      <!-- Gráfico: Receitas x Despesas -->
      <div class="ledger-panel p-5">
        <p class="form-section-title">Receitas x Despesas por dia</p>
        <div class="chart-wrap">
          <canvas ref="canvasReceitasDespesas"></canvas>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Gráfico: Pedidos por status -->
        <div class="ledger-panel p-5">
          <p class="form-section-title">Pedidos por status</p>
          <div class="chart-wrap chart-wrap-sm">
            <canvas ref="canvasPedidosStatus"></canvas>
          </div>
        </div>

        <!-- Top produtos vendidos -->
        <div class="ledger-panel p-5">
          <p class="form-section-title">Top 5 produtos vendidos</p>
          <div v-if="dashboard?.topProdutos?.length === 0" class="text-stone-500 text-sm py-6 text-center">
            Nenhuma venda registada neste período.
          </div>
          <ul v-else class="top-produtos">
            <li v-for="(p, i) in dashboard?.topProdutos" :key="i">
              <div class="flex justify-between items-baseline mb-1">
                <span class="text-sm font-medium text-ink">{{ p.nome }}</span>
                <span class="num text-sm">{{ formatarMoeda(p.valor) }}</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: percentualBarra(p.valor) + '%' }"></div>
              </div>
              <span class="text-xs text-stone-500 num">{{ p.quantidade }} unidades vendidas</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Estoque -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="stat-card stat-blue">
          <span class="stat-tab"></span>
          <p class="stat-label">Valor em estoque (ao custo)</p>
          <p class="stat-value">{{ formatarMoeda(dashboard?.estoque?.valorEmEstoque) }}</p>
        </div>
        <div class="stat-card stat-rose">
          <span class="stat-tab"></span>
          <p class="stat-label">Produtos com estoque baixo</p>
          <p class="stat-value">{{ dashboard?.estoque?.totalBaixoEstoque }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useStore } from 'vuex'
import Chart from 'chart.js/auto'

const store = useStore()

const dashboard = computed(() => store.getters.dashboard)
const loadingDashboard = computed(() => store.getters.loadingDashboard || false)
const errorDashboard = computed(() => store.getters.errorDashboard || null)

const toISODate = (date) => {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

const preset = ref('mes')
const filtros = ref({ dataInicio: '', dataFim: '' })

const aplicarPreset = (p) => {
  preset.value = p
  const hoje = new Date()
  let inicio

  if (p === 'hoje') {
    inicio = new Date(hoje)
  } else if (p === 'semana') {
    const diaSemana = hoje.getDay() === 0 ? 7 : hoje.getDay()
    inicio = new Date(hoje)
    inicio.setDate(hoje.getDate() - (diaSemana - 1))
  } else if (p === 'mes') {
    inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  } else if (p === 'ano') {
    inicio = new Date(hoje.getFullYear(), 0, 1)
  }

  filtros.value = { dataInicio: toISODate(inicio), dataFim: toISODate(hoje) }
  carregar()
}

const carregar = () => store.dispatch('carregarDashboard', filtros.value)

const formatarMoeda = (v) => `${(Number(v) || 0).toFixed(2)} Kz`

const maiorValorTopProdutos = computed(() => {
  if (!dashboard.value?.topProdutos?.length) return 1
  return Math.max(...dashboard.value.topProdutos.map((p) => p.valor)) || 1
})
const percentualBarra = (valor) => Math.max(6, Math.round((valor / maiorValorTopProdutos.value) * 100))

// --- Gráficos (Chart.js) ---
const canvasReceitasDespesas = ref(null)
const canvasPedidosStatus = ref(null)
let chartReceitasDespesas = null
let chartPedidosStatus = null

const CORES = { ok: '#2f7d53', rule: '#b5433c', blue: '#2563eb', amber: '#b8860b', muted: '#8a8478' }

const desenharGraficos = () => {
  if (!dashboard.value) return

  // Receitas x Despesas
  if (chartReceitasDespesas) chartReceitasDespesas.destroy()
  if (canvasReceitasDespesas.value) {
    const labels = dashboard.value.serieDiaria.map((d) => d.data.slice(5).split('-').reverse().join('/'))
    chartReceitasDespesas = new Chart(canvasReceitasDespesas.value, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Receitas',
            data: dashboard.value.serieDiaria.map((d) => d.receitas),
            borderColor: CORES.ok,
            backgroundColor: 'rgba(47,125,83,0.12)',
            tension: 0.25,
            fill: true,
          },
          {
            label: 'Despesas',
            data: dashboard.value.serieDiaria.map((d) => d.despesas),
            borderColor: CORES.rule,
            backgroundColor: 'rgba(181,67,60,0.1)',
            tension: 0.25,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: true } },
      },
    })
  }

  // Pedidos por status
  if (chartPedidosStatus) chartPedidosStatus.destroy()
  if (canvasPedidosStatus.value) {
    const status = dashboard.value.pedidos.porStatus
    chartPedidosStatus = new Chart(canvasPedidosStatus.value, {
      type: 'bar',
      data: {
        labels: ['Pendente', 'Em Execução', 'Pronto', 'Entregue', 'Cancelado'],
        datasets: [{
          data: [status.pendente, status.em_execucao, status.pronto, status.entregue, status.cancelado],
          backgroundColor: [CORES.rule, CORES.blue, CORES.amber, CORES.ok, CORES.muted],
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    })
  }
}

watch(dashboard, () => nextTick(desenharGraficos))

onMounted(() => aplicarPreset('mes'))

onBeforeUnmount(() => {
  if (chartReceitasDespesas) chartReceitasDespesas.destroy()
  if (chartPedidosStatus) chartPedidosStatus.destroy()
})
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

.eyebrow { font-family: 'IBM Plex Mono', monospace; font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--rule); margin: 0; }
.ledger-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.75rem; color: var(--ink); margin-top: 0.15rem; }
.text-ink { color: var(--ink); }
.text-rule { color: var(--rule); }
.num { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }

/* Filtro de período */
.periodo-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; justify-content: space-between; }
.preset-pills { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.pill-btn { font-size: 0.78rem; padding: 0.35rem 0.8rem; border-radius: 999px; border: 1px solid var(--paper-line); background: #fff; color: var(--ink-soft); font-weight: 600; }
.pill-btn.active { background: var(--ink); color: #fff; border-color: var(--ink); }
.date-range { display: flex; align-items: center; gap: 0.4rem; }
.date-range .ledger-input { width: auto; padding: 0.4rem 0.6rem; font-size: 0.8rem; }

.ledger-input { border: 1px solid var(--paper-line); background: #fff; border-radius: 8px; padding: 0.5rem 0.75rem; font-size: 0.875rem; color: var(--ink); outline: none; }
.ledger-input:focus { border-color: var(--ink); }

/* Cartões de resumo */
.stat-card { position: relative; border-radius: 10px; padding: 1rem 1.1rem 0.9rem; overflow: hidden; border: 1px solid var(--paper-line); transition: transform 0.15s, box-shadow 0.15s; }
.stat-card:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
.stat-tab { position: absolute; top: 0; left: 0; width: 100%; height: 4px; }

.stat-blue { background: #eaf1ff; border-color: #c7dbff; } .stat-blue .stat-tab { background: var(--blue); } .stat-blue .stat-value { color: #1d4ed8; }
.stat-rose { background: #fff0f1; border-color: #ffd0d4; } .stat-rose .stat-tab { background: var(--rule); } .stat-rose .stat-value { color: #be123c; }
.stat-emerald { background: #ecfdf5; border-color: #bdf0d6; } .stat-emerald .stat-tab { background: var(--ok); } .stat-emerald .stat-value { color: #047857; }
.stat-amber { background: #fff8e8; border-color: #fbe2a6; } .stat-amber .stat-tab { background: var(--amber); } .stat-amber .stat-value { color: #b45309; }

.stat-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-soft); margin-top: 0.4rem; }
.stat-value { font-family: 'IBM Plex Mono', monospace; font-weight: 600; font-size: 1.35rem; color: var(--ink); margin-top: 0.15rem; }

/* Painéis e gráficos */
.ledger-panel { background: #fff; border: 1px solid var(--paper-line); border-radius: 12px; }
.form-section-title { font-family: 'IBM Plex Mono', monospace; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--rule); margin-bottom: 0.9rem; }
.chart-wrap { position: relative; height: 280px; }
.chart-wrap-sm { height: 220px; }

/* Top produtos */
.top-produtos { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.9rem; }
.bar-track { background: var(--paper); border-radius: 999px; height: 8px; overflow: hidden; margin-bottom: 0.25rem; }
.bar-fill { background: var(--ink); height: 100%; border-radius: 999px; transition: width 0.3s ease; }

.spinner { width: 28px; height: 28px; border: 3px solid var(--paper-line); border-top-color: var(--ink); border-radius: 50%; margin: 0 auto; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>