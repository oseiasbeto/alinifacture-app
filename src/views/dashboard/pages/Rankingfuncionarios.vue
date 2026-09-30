<template>
  <div class="ledger-scope space-y-6">
    <!-- Cabeçalho -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="ledger-title">Classificação de Funcionários</h1>
        <p class="text-sm text-stone-500 mt-1">{{ papelAtual.subtitulo }} — base para atribuição de bónus</p>
      </div>
      <router-link to="/dashboard/utilizadores" class="btn-ghost">← Utilizadores</router-link>
    </div>

    <!-- Papel a ranquear -->
    <div class="tabs-bar">
      <button v-for="p in papeis" :key="p.valor" class="tab-btn" :class="{ active: papel === p.valor }"
        @click="mudarPapel(p.valor)">
        {{ p.label }}
      </button>
    </div>

    <!-- Período -->
    <div class="periodo-bar">
      <div class="preset-pills">
        <button class="pill-btn" :class="{ active: preset === 'semana' }" @click="aplicarPreset('semana')">Esta semana</button>
        <button class="pill-btn" :class="{ active: preset === 'mes' }" @click="aplicarPreset('mes')">Este mês</button>
        <button class="pill-btn" :class="{ active: preset === 'ano' }" @click="aplicarPreset('ano')">Este ano</button>
      </div>
      <div class="date-range">
        <input type="date" class="ledger-input" v-model="filtros.dataInicio" :max="filtros.dataFim || undefined"
          @change="aplicarPeriodoManual" />
        <span class="text-stone-400 text-sm">até</span>
        <input type="date" class="ledger-input" v-model="filtros.dataFim" :min="filtros.dataInicio || undefined"
          @change="aplicarPeriodoManual" />
      </div>
    </div>

    <div v-if="erro" class="erro-box" role="alert">
      <span>{{ erro }}</span>
      <button v-if="!periodoInvalido" class="btn-ghost" @click="carregar">Tentar de novo</button>
    </div>

    <div v-if="loading" class="p-10 text-center text-stone-500">
      <div class="spinner"></div>
      <p class="mt-3 text-sm">Calculando classificação...</p>
    </div>

    <div v-else-if="!erro && ranking.length === 0" class="ledger-panel p-10 text-center text-stone-500">
      {{ papelAtual.vazio }}
    </div>

    <template v-else-if="!erro">
      <!-- Resumo da equipa -->
      <div class="resumo">
        <div class="resumo-item">
          <p class="resumo-valor num">{{ resumo.funcionarios }}</p>
          <p class="resumo-label">funcionários com atividade</p>
        </div>
        <div class="resumo-item">
          <p class="resumo-valor num">{{ resumo.totalPedidos }}</p>
          <p class="resumo-label">{{ papelAtual.metrica }} no total</p>
        </div>
        <div class="resumo-item">
          <p class="resumo-valor num">{{ resumo.media }}</p>
          <p class="resumo-label">média por funcionário</p>
        </div>
        <div class="resumo-item">
          <p class="resumo-valor num">{{ formatarMoeda(resumo.valorTotal) }}</p>
          <p class="resumo-label">valor gerado</p>
        </div>
      </div>

      <!-- Critérios de bónus -->
      <section class="bonus-panel" aria-label="Critérios de bónus">
        <div class="bonus-controlos">
          <label class="campo">
            <span>Premiar os primeiros</span>
            <select class="ledger-input" v-model.number="nPremiados">
              <option v-for="n in opcoesPremiados" :key="n" :value="n">{{ n }}</option>
            </select>
          </label>
          <label class="campo">
            <span>Mínimo de {{ papelAtual.metrica }}</span>
            <input type="number" min="0" class="ledger-input campo-numero" v-model.number="minimoPedidos" />
          </label>
        </div>
        <div class="bonus-resultado">
          <p class="bonus-contagem">
            <strong class="num">{{ elegiveis.length }}</strong>
            {{ elegiveis.length === 1 ? 'funcionário elegível' : 'funcionários elegíveis' }} a bónus
          </p>
          <p v-if="empateNoCorte" class="aviso-empate">
            Há empate na linha de corte: {{ elegiveis.length }} pessoas ficaram elegíveis para {{ nPremiados }} prémios.
            Decidam se o bónus é partilhado ou se aplicam outro critério.
          </p>
          <p v-else-if="elegiveis.length === 0" class="aviso-empate">
            Ninguém cumpre os critérios neste período. Reduzam o mínimo ou alarguem o período.
          </p>
          <button class="btn-ghost" @click="exportarCsv">Exportar classificação (CSV)</button>
        </div>
      </section>

      <!-- Pódio -->
      <div class="podio" :key="animKey">
        <div v-for="(item, i) in podio" :key="item.utilizador._id" class="podio-col" :class="'lugar-' + (i + 1)">
          <div class="podio-card" :class="{ 'card-elegivel': item.estado === 'elegivel' }">
            <svg v-if="i === 0" class="coroa" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8z" fill="currentColor" />
            </svg>
            <span class="podio-posicao">{{ item.posicao }}º</span>
            <p class="podio-nome">{{ nomeCompleto(item) }}</p>
            <span class="cargo-badge" :class="'badge-' + item.utilizador.cargo">{{ cargoLabel(item.utilizador.cargo) }}</span>
            <div class="podio-stats">
              <div>
                <p class="podio-stat-value num">{{ animar(item.totalPedidos) }}</p>
                <p class="podio-stat-label">{{ papelAtual.metrica }}</p>
              </div>
              <div>
                <p class="podio-stat-value num">{{ formatarMoeda(item.valorTotal * progresso) }}</p>
                <p class="podio-stat-label">valor gerado</p>
              </div>
            </div>
            <p class="podio-tendencia" :class="classeTendencia(item)">{{ textoTendencia(item) }}</p>
            <span v-if="item.estado !== 'fora'" class="estado-badge" :class="'estado-' + estadoClasse(item)">
              {{ estadoLabel(item) }}
            </span>
          </div>
          <div class="podio-degrau"><span>{{ item.posicao }}º</span></div>
        </div>
      </div>

      <!-- Tabela completa -->
      <div class="ledger-panel">
        <div class="tabela-ferramentas">
          <input type="search" class="ledger-input busca" v-model.trim="busca" placeholder="Procurar funcionário..."
            aria-label="Procurar funcionário" />
          <label class="campo campo-linha">
            <span>Mostrar</span>
            <select class="ledger-input" v-model.number="porPagina">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </label>
        </div>

        <div class="tabela-scroll">
          <table class="ledger-table w-full">
            <thead>
              <tr>
                <th class="text-left">Pos.</th>
                <th class="text-left">Funcionário</th>
                <th class="text-left col-pedidos">{{ papelAtual.colunaTotal }}</th>
                <th class="text-right">% da equipa</th>
                <th class="text-right">Valor gerado</th>
                <th class="text-right">vs período anterior</th>
                <th class="text-left">Bónus</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in linhasPagina" :key="item.utilizador._id"
                :class="{ 'linha-elegivel': item.estado === 'elegivel', 'linha-inativa': item.estado === 'inativo' }">
                <td class="num">
                  <span class="medalha" :class="item.posicao <= 3 ? 'medalha-' + item.posicao : 'medalha-nenhuma'">
                    {{ item.posicao }}º
                  </span>
                </td>
                <td>
                  <p class="font-medium text-ink">{{ nomeCompleto(item) }}</p>
                  <span class="cargo-badge" :class="'badge-' + item.utilizador.cargo">{{ cargoLabel(item.utilizador.cargo) }}</span>
                </td>
                <td class="col-pedidos">
                  <div class="barra-linha">
                    <span class="num barra-numero">{{ item.totalPedidos }}</span>
                    <div class="barra"><span :style="{ width: larguraBarra(item) + '%' }"></span></div>
                  </div>
                </td>
                <td class="text-right num">{{ percentagem(item) }}%</td>
                <td class="text-right num">{{ formatarMoeda(item.valorTotal) }}</td>
                <td class="text-right num">
                  <span :class="classeTendencia(item)">{{ textoTendencia(item) }}</span>
                </td>
                <td>
                  <span v-if="item.estado !== 'fora'" class="estado-badge" :class="'estado-' + estadoClasse(item)">
                    {{ estadoLabel(item) }}
                  </span>
                  <span v-else class="text-stone-400">—</span>
                </td>
              </tr>
              <tr v-if="linhasPagina.length === 0">
                <td colspan="7" class="text-center text-stone-500 py-6">Nenhum funcionário encontrado para "{{ busca }}".</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="paginacao" v-if="linhasFiltradas.length > 0">
          <p class="text-sm text-stone-500">
            A mostrar {{ primeiroDaPagina }}–{{ ultimoDaPagina }} de {{ linhasFiltradas.length }}
          </p>
          <div class="pager">
            <button class="btn-ghost" :disabled="pagina <= 1" @click="pagina--">Anterior</button>
            <span class="text-sm text-stone-500">Página {{ pagina }} de {{ totalPaginas }}</span>
            <button class="btn-ghost" :disabled="pagina >= totalPaginas" @click="pagina++">Seguinte</button>
          </div>
        </div>
      </div>

      <p class="nota-criterio">
        {{ papelAtual.criterio }} Em caso de números iguais, os funcionários partilham a mesma posição.
        A evolução compara com {{ periodoAnteriorTexto }}.
      </p>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// O que cada aba conta (tem de coincidir com o backend):
// producao -> pedidos que o funcionário marcou como "entregue"
// designer -> pedidos que o funcionário marcou como "pronto"
// caixa    -> pedidos que o funcionário registou (criou)
const papeis = [
  {
    valor: 'producao',
    label: 'Produção',
    subtitulo: 'Quem mais entregou pedidos no período',
    criterio: 'Conta os pedidos que cada funcionário marcou como entregues no período.',
    metrica: 'pedidos entregues',
    colunaTotal: 'Pedidos entregues',
    vazio: 'Nenhum pedido foi marcado como entregue neste período.',
  },
  {
    valor: 'designer',
    label: 'Designers',
    subtitulo: 'Quem mais concluiu designs no período',
    criterio: 'Conta os pedidos que cada designer marcou como prontos no período.',
    metrica: 'pedidos prontos',
    colunaTotal: 'Pedidos prontos',
    vazio: 'Nenhum pedido foi marcado como pronto neste período.',
  },
  {
    valor: 'caixa',
    label: 'Atendimento',
    subtitulo: 'Quem mais atendeu pedidos no período',
    criterio: 'Conta os pedidos que cada funcionário registou no período, sem os cancelados.',
    metrica: 'pedidos atendidos',
    colunaTotal: 'Pedidos atendidos',
    vazio: 'Nenhum pedido foi registado neste período.',
  },
]
const papel = ref('producao')
const papelAtual = computed(() => papeis.find((p) => p.valor === papel.value) || papeis[0])

const cargos = [
  { valor: 'administrador', label: 'Administrador' },
  { valor: 'gerente', label: 'Gerente' },
  { valor: 'caixa', label: 'Caixa' },
  { valor: 'designer', label: 'Designer' },
  { valor: 'producao', label: 'Produção' },
  { valor: 'estoquista', label: 'Estoquista' },
  { valor: 'visualizador', label: 'Visualizador' },
]
const cargoLabel = (v) => cargos.find((c) => c.valor === v)?.label || v
const nomeCompleto = (item) => `${item.utilizador.nomeProprio || ''} ${item.utilizador.apelido || ''}`.trim()

/* ---------- Critérios de bónus (guardados neste navegador) ---------- */
const CHAVE_CONFIG = 'ranking-bonus-config'
const lerConfig = () => {
  try { return JSON.parse(localStorage.getItem(CHAVE_CONFIG)) || {} } catch { return {} }
}
const configGuardada = lerConfig()
const opcoesPremiados = [1, 2, 3, 5, 10]
const nPremiados = ref(Number(configGuardada.nPremiados) || 3)
const minimoPedidos = ref(Number(configGuardada.minimoPedidos) || 0)

watch([nPremiados, minimoPedidos], () => {
  try {
    localStorage.setItem(CHAVE_CONFIG, JSON.stringify({ nPremiados: nPremiados.value, minimoPedidos: minimoPedidos.value }))
  } catch { /* sem armazenamento disponível: ignora */ }
})

/* ---------- Período ---------- */
const toISODate = (date) => {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

const preset = ref('mes')
const filtros = ref({ dataInicio: '', dataFim: '' })

const ranking = ref([])
const periodoAnterior = ref(null)
const loading = ref(false)
const erro = ref('')

const periodoInvalido = computed(
  () => !!filtros.value.dataInicio && !!filtros.value.dataFim && filtros.value.dataInicio > filtros.value.dataFim
)

const formatarData = (iso) => (iso ? iso.split('-').reverse().join('/') : '')
const periodoAnteriorTexto = computed(() =>
  periodoAnterior.value
    ? `o período anterior (${formatarData(periodoAnterior.value.dataInicio)} a ${formatarData(periodoAnterior.value.dataFim)})`
    : 'o período anterior'
)

/* ---------- Animação: um único momento ao carregar ---------- */
const progresso = ref(1)
const animKey = ref(0)
let rafId = 0

const iniciarAnimacao = () => {
  cancelAnimationFrame(rafId)
  animKey.value++ // volta a montar o pódio para repetir a subida dos degraus
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    progresso.value = 1
    return
  }
  progresso.value = 0
  const inicio = performance.now()
  const duracao = 1000
  const passo = (agora) => {
    const t = Math.min((agora - inicio) / duracao, 1)
    progresso.value = 1 - Math.pow(1 - t, 3)
    if (t < 1) rafId = requestAnimationFrame(passo)
  }
  rafId = requestAnimationFrame(passo)
}
onBeforeUnmount(() => cancelAnimationFrame(rafId))

const animar = (v) => Math.round((Number(v) || 0) * progresso.value)

/* ---------- Dados derivados ---------- */
// Elegibilidade: só conta quem está ativo e cumpre o mínimo. As posições dos candidatos
// são recontadas entre si (com empates), para um inativo não "ocupar" um prémio.
const linhas = computed(() => {
  const minimo = Number(minimoPedidos.value) || 0
  const limite = Number(nPremiados.value) || 1
  let contados = 0
  let posCandidato = 0
  let ultimo = null

  const lista = ranking.value.map((item) => {
    const inativo = item.utilizador.ativo === false
    const abaixo = item.totalPedidos < minimo
    let estado = 'fora'
    let posElegivel = null

    if (inativo) estado = 'inativo'
    else if (abaixo) estado = 'abaixo'
    else {
      contados++
      if (!ultimo || ultimo.totalPedidos !== item.totalPedidos || ultimo.valorTotal !== item.valorTotal) {
        posCandidato = contados
      }
      ultimo = item
      posElegivel = posCandidato
      if (posCandidato <= limite) estado = 'elegivel'
    }
    return { ...item, estado, posElegivel, empate: false }
  })

  // Se há mais elegíveis do que prémios, o último grupo está empatado na linha de corte.
  const elegiveisLista = lista.filter((l) => l.estado === 'elegivel')
  if (elegiveisLista.length > limite) {
    const ultimaPos = Math.max(...elegiveisLista.map((l) => l.posElegivel))
    elegiveisLista.forEach((l) => { if (l.posElegivel === ultimaPos) l.empate = true })
  }
  return lista
})

const elegiveis = computed(() => linhas.value.filter((l) => l.estado === 'elegivel'))
const empateNoCorte = computed(() => elegiveis.value.length > (Number(nPremiados.value) || 1))

const resumo = computed(() => {
  const totalPedidos = ranking.value.reduce((s, r) => s + r.totalPedidos, 0)
  const valorTotal = ranking.value.reduce((s, r) => s + (r.valorTotal || 0), 0)
  const funcionarios = ranking.value.length
  return {
    funcionarios,
    totalPedidos,
    valorTotal,
    media: funcionarios ? (totalPedidos / funcionarios).toFixed(1) : '0',
  }
})

const maxPedidos = computed(() => Math.max(1, ...ranking.value.map((r) => r.totalPedidos)))
const larguraBarra = (item) => (item.totalPedidos / maxPedidos.value) * 100 * progresso.value
const percentagem = (item) => (resumo.value.totalPedidos ? ((item.totalPedidos / resumo.value.totalPedidos) * 100).toFixed(1) : '0.0')

const podio = computed(() => linhas.value.slice(0, 3))

/* ---------- Evolução vs período anterior ---------- */
const textoTendencia = (item) => {
  if (!item.anterior) return 'novo'
  const diff = item.totalPedidos - item.anterior.totalPedidos
  if (diff > 0) return `▲ +${diff}`
  if (diff < 0) return `▼ ${diff}`
  return '= igual'
}
const classeTendencia = (item) => {
  if (!item.anterior) return 'tend-novo'
  const diff = item.totalPedidos - item.anterior.totalPedidos
  return diff > 0 ? 'tend-sobe' : diff < 0 ? 'tend-desce' : 'tend-igual'
}

/* ---------- Estado de bónus ---------- */
const estadoLabel = (item) => {
  if (item.estado === 'elegivel') return item.empate ? 'Elegível · empate' : 'Elegível'
  if (item.estado === 'abaixo') return 'Abaixo do mínimo'
  if (item.estado === 'inativo') return 'Inativo'
  return ''
}
const estadoClasse = (item) => (item.estado === 'elegivel' && item.empate ? 'empate' : item.estado)

/* ---------- Pesquisa e paginação (50+ funcionários) ---------- */
const busca = ref('')
const porPagina = ref(20)
const pagina = ref(1)

const normalizar = (s) => (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const linhasFiltradas = computed(() => {
  const termo = normalizar(busca.value)
  if (!termo) return linhas.value
  return linhas.value.filter((l) => normalizar(nomeCompleto(l)).includes(termo))
})

const totalPaginas = computed(() => Math.max(1, Math.ceil(linhasFiltradas.value.length / porPagina.value)))
const linhasPagina = computed(() => {
  const inicio = (pagina.value - 1) * porPagina.value
  return linhasFiltradas.value.slice(inicio, inicio + porPagina.value)
})
const primeiroDaPagina = computed(() => (linhasFiltradas.value.length ? (pagina.value - 1) * porPagina.value + 1 : 0))
const ultimoDaPagina = computed(() => Math.min(pagina.value * porPagina.value, linhasFiltradas.value.length))

watch([busca, porPagina], () => { pagina.value = 1 })

/* ---------- Carregar ---------- */
let ultimoPedido = 0 // ignora respostas lentas de pedidos antigos

const carregar = async () => {
  if (periodoInvalido.value) {
    erro.value = 'A data de início não pode ser posterior à data de fim.'
    ranking.value = []
    return
  }

  const idPedido = ++ultimoPedido
  loading.value = true
  erro.value = ''

  try {
    const resultado = await store.dispatch('carregarRanking', {
      papel: papel.value,
      dataInicio: filtros.value.dataInicio || undefined,
      dataFim: filtros.value.dataFim || undefined,
    })
    if (idPedido !== ultimoPedido) return
    ranking.value = resultado?.ranking || []
    periodoAnterior.value = resultado?.periodoAnterior || null
    pagina.value = 1
    iniciarAnimacao()
  } catch (e) {
    if (idPedido !== ultimoPedido) return
    ranking.value = []
    erro.value = e?.response?.data?.message || 'Não foi possível carregar a classificação.'
  } finally {
    if (idPedido === ultimoPedido) loading.value = false
  }
}

const aplicarPreset = (p) => {
  preset.value = p
  const hoje = new Date()
  let inicio

  if (p === 'semana') {
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

const aplicarPeriodoManual = () => {
  preset.value = 'custom'
  carregar()
}

const mudarPapel = (p) => {
  if (p === papel.value) return
  papel.value = p
  busca.value = ''
  carregar()
}

const formatarMoeda = (v) =>
  `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(v) || 0)}kz`

/* ---------- Exportar CSV (abre bem no Excel) ---------- */
const exportarCsv = () => {
  const cabecalho = ['Posição', 'Funcionário', 'Cargo', papelAtual.value.colunaTotal, 'Valor gerado (Kz)', 'Bónus']
  const corpo = linhas.value.map((l) => [
    l.posicao,
    nomeCompleto(l),
    cargoLabel(l.utilizador.cargo),
    l.totalPedidos,
    (Number(l.valorTotal) || 0).toFixed(2),
    estadoLabel(l) || '—',
  ])
  const csv = '\uFEFF' + [cabecalho, ...corpo]
    .map((linha) => linha.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `classificacao-${papel.value}-${filtros.value.dataInicio}-${filtros.value.dataFim}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => aplicarPreset('mes'))
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
  --ok-bg: #ecfdf5;
  --amber: #b8860b;
  --blue: #2563eb;
  --violet: #7c3aed;
  --gold: #b8860b;
  --silver: #8a8478;
  --bronze: #a5642f;
  font-family: 'Inter', system-ui, sans-serif;
}

.ledger-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.75rem; color: var(--ink); }
.text-ink { color: var(--ink); }
.num { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }

/* Abas */
.tabs-bar { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.tab-btn { padding: 0.45rem 0.9rem; border-radius: 999px; border: 1px solid var(--paper-line); background: #fff; font-size: 0.82rem; font-weight: 600; color: var(--ink-soft); cursor: pointer; }
.tab-btn.active { background: var(--ink); border-color: var(--ink); color: #fff; }
.tab-btn:focus-visible, .pill-btn:focus-visible, .btn-ghost:focus-visible { outline: 2px solid var(--blue); outline-offset: 2px; }

/* Período */
.periodo-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; justify-content: space-between; }
.preset-pills { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.pill-btn { font-size: 0.78rem; padding: 0.35rem 0.8rem; border-radius: 999px; border: 1px solid var(--paper-line); background: #fff; color: var(--ink-soft); font-weight: 600; cursor: pointer; }
.pill-btn.active { background: var(--ink); color: #fff; border-color: var(--ink); }
.date-range { display: flex; align-items: center; gap: 0.4rem; }
.date-range .ledger-input { width: auto; padding: 0.35rem 0.55rem; font-size: 0.8rem; }

.ledger-input { border: 1px solid var(--paper-line); background: var(--paper); border-radius: 8px; padding: 0.5rem 0.75rem; font-size: 0.875rem; color: var(--ink); outline: none; }
.ledger-input:focus { border-color: var(--ink); }

.btn-ghost { background: transparent; border: 1px solid var(--paper-line); color: var(--ink-soft); border-radius: 8px; padding: 0.5rem 0.9rem; font-size: 0.82rem; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; }
.btn-ghost:hover:not(:disabled) { border-color: var(--ink); color: var(--ink); }
.btn-ghost:disabled { opacity: 0.45; cursor: not-allowed; }

.erro-box { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; background: #fff0f1; border: 1px solid #f3c4c7; color: var(--rule); font-size: 0.85rem; padding: 0.7rem 0.9rem; border-radius: 8px; }

/* Resumo da equipa */
.resumo { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; }
.resumo-item { background: #fff; border: 1px solid var(--paper-line); border-radius: 10px; padding: 0.8rem 1rem; }
.resumo-valor { font-size: 1.3rem; font-weight: 600; color: var(--ink); }
.resumo-label { font-size: 0.74rem; color: var(--ink-soft); margin-top: 0.15rem; }

/* Critérios de bónus */
.bonus-panel { display: flex; flex-wrap: wrap; gap: 1rem 2rem; justify-content: space-between; align-items: flex-end; background: var(--paper); border: 1px solid var(--paper-line); border-left: 4px solid var(--ok); border-radius: 10px; padding: 1rem 1.1rem; }
.bonus-controlos { display: flex; gap: 1rem; flex-wrap: wrap; }
.campo { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.75rem; font-weight: 600; color: var(--ink-soft); }
.campo-linha { flex-direction: row; align-items: center; gap: 0.5rem; }
.campo-numero { width: 6.5rem; }
.bonus-resultado { display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-start; max-width: 34rem; }
.bonus-contagem { font-size: 0.9rem; color: var(--ink); }
.bonus-contagem strong { font-size: 1.2rem; color: var(--ok); }
.aviso-empate { font-size: 0.8rem; color: #8a5a00; background: #fff8e8; border: 1px solid #f0d9a0; border-radius: 8px; padding: 0.5rem 0.7rem; }

/* Pódio: degraus sobem uma vez ao carregar */
.podio { display: flex; justify-content: center; align-items: flex-end; gap: 1rem; padding-top: 0.5rem; }
.podio-col { flex: 1 1 0; max-width: 270px; display: flex; flex-direction: column; }
.lugar-1 { order: 2; }
.lugar-2 { order: 1; }
.lugar-3 { order: 3; }

.podio-card { background: #fff; border: 1px solid var(--paper-line); border-radius: 12px 12px 0 0; border-bottom: none; padding: 1.1rem 1rem 1rem; text-align: center; position: relative; }
.podio-card.card-elegivel { box-shadow: inset 0 0 0 2px var(--ok); border-color: var(--ok); }
.coroa { color: var(--gold); margin: 0 auto 0.15rem; display: block; }
.podio-posicao { display: none; width: 30px; height: 30px; border-radius: 50%; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: #fff; margin-bottom: 0.4rem; }
.lugar-1 .podio-posicao { background: var(--gold); }
.lugar-2 .podio-posicao { background: var(--silver); }
.lugar-3 .podio-posicao { background: var(--bronze); }
.podio-nome { font-weight: 700; color: var(--ink); font-size: 0.95rem; margin: 0.2rem 0 0.45rem; }
.podio-stats { display: flex; justify-content: center; gap: 1.4rem; margin-top: 0.8rem; padding-top: 0.8rem; border-top: 1px dashed var(--paper-line); }
.podio-stat-value { font-weight: 600; font-size: 1.05rem; color: var(--ink); }
.podio-stat-label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ink-soft); margin-top: 0.1rem; }
.podio-tendencia { font-size: 0.75rem; margin-top: 0.6rem; font-weight: 600; }

.podio-degrau { display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.6rem; border-radius: 0 0 4px 4px; transform-origin: bottom; animation: erguer 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
.lugar-1 .podio-degrau { height: 96px; background: var(--gold); animation-delay: 0.15s; }
.lugar-2 .podio-degrau { height: 68px; background: var(--silver); animation-delay: 0.05s; }
.lugar-3 .podio-degrau { height: 48px; background: var(--bronze); animation-delay: 0.25s; }
@keyframes erguer { from { transform: scaleY(0); } to { transform: scaleY(1); } }

/* Tendência e estados */
.tend-sobe { color: var(--ok); font-weight: 600; }
.tend-desce { color: var(--rule); font-weight: 600; }
.tend-igual, .tend-novo { color: var(--ink-soft); }
.estado-badge { display: inline-block; font-size: 0.72rem; font-weight: 600; padding: 0.18rem 0.6rem; border-radius: 999px; margin-top: 0.5rem; }
.ledger-table .estado-badge { margin-top: 0; }
.estado-elegivel { background: var(--ok-bg); color: var(--ok); border: 1px solid #b7e4c7; }
.estado-empate { background: #fff8e8; color: #8a5a00; border: 1px solid #f0d9a0; }
.estado-abaixo { background: #f1efe9; color: var(--ink-soft); }
.estado-inativo { background: #f3f3f3; color: #777; text-decoration: line-through; }

/* Tabela */
.ledger-panel { background: #fff; border: 1px solid var(--paper-line); border-radius: 12px; overflow: hidden; }
.tabela-ferramentas { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: space-between; align-items: center; padding: 0.8rem 1rem; border-bottom: 1px solid var(--paper-line); }
.busca { flex: 1 1 220px; max-width: 320px; }
.tabela-scroll { overflow-x: auto; }
.ledger-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; min-width: 760px; }
.ledger-table thead th { text-align: left; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-soft); background: var(--paper); padding: 0.65rem 1rem; border-bottom: 2px solid var(--ink); }
.ledger-table tbody td { padding: 0.65rem 1rem; border-bottom: 1px dashed var(--paper-line); vertical-align: middle; }
.ledger-table tbody tr:last-child td { border-bottom: none; }
.ledger-table tbody tr td:first-child { border-left: 3px solid transparent; }
.linha-elegivel { background: #f6fcf8; }
.linha-elegivel td:first-child { border-left-color: var(--ok) !important; }
.linha-inativa { opacity: 0.6; }

.medalha { display: inline-flex; align-items: center; justify-content: center; min-width: 34px; height: 26px; padding: 0 0.4rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; }
.medalha-1 { background: var(--gold); color: #fff; }
.medalha-2 { background: var(--silver); color: #fff; }
.medalha-3 { background: var(--bronze); color: #fff; }
.medalha-nenhuma { color: var(--ink-soft); }

.col-pedidos { min-width: 180px; }
.barra-linha { display: flex; align-items: center; gap: 0.6rem; }
.barra-numero { width: 2.2rem; text-align: right; font-weight: 600; }
.barra { flex: 1; height: 8px; background: var(--paper-line); border-radius: 999px; overflow: hidden; }
.barra > span { display: block; height: 100%; background: var(--ink); border-radius: 999px; }
.linha-elegivel .barra > span { background: var(--ok); }

.paginacao { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: space-between; align-items: center; padding: 0.8rem 1rem; border-top: 1px solid var(--paper-line); background: var(--paper); }
.pager { display: flex; align-items: center; gap: 0.75rem; }

.nota-criterio { font-size: 0.78rem; color: var(--ink-soft); }

.cargo-badge { display: inline-block; font-size: 0.72rem; font-weight: 600; padding: 0.18rem 0.6rem; border-radius: 999px; }
.badge-administrador, .badge-gerente { background: #fff0f1; color: var(--rule); }
.badge-caixa { background: #ecfdf5; color: var(--ok); }
.badge-designer { background: #fff8e8; color: var(--amber); }
.badge-producao { background: #f3e8ff; color: var(--violet); }
.badge-estoquista { background: #f1efe9; color: var(--ink-soft); }
.badge-visualizador { background: #eaf1ff; color: var(--blue); }

.spinner { width: 28px; height: 28px; border: 3px solid var(--paper-line); border-top-color: var(--ink); border-radius: 50%; margin: 0 auto; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Telemóvel: pódio em coluna, sem degraus */
@media (max-width: 639px) {
  .podio { flex-direction: column; align-items: stretch; }
  .podio-col { max-width: none; order: 0 !important; }
  .podio-card { border-radius: 12px; border-bottom: 1px solid var(--paper-line); }
  .podio-degrau { display: none; }
  .podio-posicao { display: inline-flex; }
}

@media (prefers-reduced-motion: reduce) {
  .podio-degrau { animation: none; }
  .spinner { animation-duration: 2.4s; }
}
</style>