<template>
  <div class="ledger-scope space-y-6">
    <!-- Cabeçalho -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="ledger-title">Clientes</h1>
        <p class="text-sm text-stone-500 mt-1">Gerencie seus clientes e contactos</p>
      </div>
      <div class="flex gap-2">
        <button @click="gerarPDFClientes" class="btn-ghost">↓ Exportar</button>
        <button class="btn-primary" @click="abrirModalNovo">+ Novo Cliente</button>
      </div>
    </div>

    <!-- Cartões de resumo -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" v-if="resumo">
      <div class="stat-card stat-blue">
        <span class="stat-tab"></span>
        <p class="stat-label">Total de clientes</p>
        <p class="stat-value">{{ resumo.totalClientes }}</p>
      </div>
      <div class="stat-card stat-emerald">
        <span class="stat-tab"></span>
        <p class="stat-label">Ativos</p>
        <p class="stat-value">{{ resumo.totalAtivos }}</p>
      </div>
      <div class="stat-card stat-rose">
        <span class="stat-tab"></span>
        <p class="stat-label">Inativos</p>
        <p class="stat-value">{{ resumo.totalInativos }}</p>
      </div>
      <div class="stat-card stat-amber">
        <span class="stat-tab"></span>
        <p class="stat-label">Novos este mês</p>
        <p class="stat-value">{{ resumo.novosEsteMes }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filtros-bar">
      <div class="relative flex-1 min-w-[240px]">
        <input type="text" v-model="filtros.busca" placeholder="Buscar por nome, email, telefone ou NIF..."
          class="ledger-input pl-9" />
        <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <select v-model="filtros.status" class="ledger-input w-auto">
        <option value="">Todos os status</option>
        <option value="ativo">Ativos</option>
        <option value="inativo">Inativos</option>
      </select>

      <button v-if="filtrosAtivos" class="toggle-pill active" @click="limparFiltros">
        <span class="dot dot-rule"></span>
        Limpar filtros
      </button>
    </div>

    <!-- Tabela / Loading / Error -->
    <div class="ledger-panel">
      <div v-if="clientesLoading" class="p-10 text-center text-stone-500">
        <div class="spinner"></div>
        <p class="mt-3 text-sm">Carregando clientes...</p>
      </div>

      <div v-else-if="clientesError" class="p-6 text-center text-rule">{{ clientesError }}</div>

      <div v-else-if="clientesListados.length === 0" class="p-10 text-center text-stone-500">
        Nenhum cliente encontrado.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="ledger-table">
          <thead>
            <tr>
              <th class="text-left">Cliente</th>
              <th class="text-left">Email</th>
              <th class="text-left">Telefone</th>
              <th class="text-left">NIF</th>
              <th class="text-left">Endereço</th>
              <th class="text-left">Cidade/Província</th>
              <th class="text-left">Tipo</th>
              <th class="text-left">Status</th>
              <th class="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cliente in clientesListados" :key="cliente._id">
              <td>
                <div class="font-medium text-ink">{{ cliente.nome }}</div>
                <div class="text-xs text-stone-500 truncate max-w-[180px]">{{ cliente.observacoes || 'Sem observações' }}</div>
              </td>
              <td class="text-stone-500">{{ cliente.email || '—' }}</td>
              <td class="text-stone-500 num">{{ cliente.telefone || '—' }}</td>
              <td class="text-stone-500 num">{{ cliente.nif || '—' }}</td>
              <td class="text-stone-500">{{ cliente.endereco || '—' }}</td>
              <td class="text-stone-500">{{ cliente.cidade }} / {{ cliente.provincia }}</td>
              <td class="text-stone-500 capitalize">{{ cliente.tipo }}</td>
              <td>
                <span class="status-dot" :class="cliente.ativo ? 'dot-ok' : 'dot-rule'"></span>
                {{ cliente.ativo ? 'Ativo' : 'Inativo' }}
              </td>
              <td class="text-right whitespace-nowrap">
                <button class="btn-icon" title="Editar" @click="editarCliente(cliente)">✎</button>
                <button class="btn-icon btn-rule" title="Excluir" @click="confirmarExclusao(cliente)">🗑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="ledger-footer">
        <div>
          Mostrando {{ (paginationInfo.page - 1) * paginationInfo.limit + 1 }}–
          {{ Math.min(paginationInfo.page * paginationInfo.limit, paginationInfo.totalDocs) }} de
          {{ paginationInfo.totalDocs }} clientes
        </div>
        <nav class="flex gap-1">
          <button class="page-btn" :disabled="paginationInfo.page === 1"
            @click="mudarPagina(paginationInfo.page - 1)">Anterior</button>
          <button v-for="n in Math.min(7, paginationInfo.totalPages)" :key="n" class="page-btn"
            :class="{ active: paginationInfo.page === n }" @click="mudarPagina(n)">{{ n }}</button>
          <button class="page-btn" :disabled="!paginationInfo.hasNextPage"
            @click="mudarPagina(paginationInfo.page + 1)">Próxima</button>
        </nav>
      </div>
    </div>

    <!-- Modal Novo/Editar Cliente -->
    <div class="modal fade" id="novoClienteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content ledger-modal">
          <div class="modal-header">
            <h5 class="modal-title">{{ modoEdicao ? 'Editar Cliente' : 'Novo Cliente' }}</h5>
            <button type="button" class="btn-close" @click="fecharModal('novoClienteModal')"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="salvarCliente" @keydown.enter.prevent>
              <div class="row g-3">
                <div class="col-12">
                  <label class="ledger-label">Nome <span class="text-rule">*</span></label>
                  <input type="text" class="ledger-input" v-model="form.nome" :class="{ 'input-invalid': errors.nome }"
                    :readonly="nomeBloqueado" :disabled="nomeBloqueado" />
                  <div class="error-text" v-if="errors.nome">{{ errors.nome }}</div>
                  <small v-if="nomeBloqueado" class="text-stone-500">
                    Nome preenchido automaticamente a partir do NIF.
                  </small>
                </div>

                <div class="col-md-6">
                  <label class="ledger-label">Email</label>
                  <input type="email" class="ledger-input" v-model="form.email" :class="{ 'input-invalid': errors.email }" />
                  <div class="error-text" v-if="errors.email">{{ errors.email }}</div>
                </div>

                <div class="col-md-6">
                  <label class="ledger-label">Telefone</label>
                  <input type="text" class="ledger-input" v-model="form.telefone" />
                </div>

                <div class="col-md-6">
                  <label class="ledger-label">NIF <span class="text-stone-400 normal-case">(opcional)</span></label>
                  <div class="nif-group">
                    <input type="text" class="ledger-input" v-model="form.nif" placeholder="Ex: 999999999"
                      :class="{ 'input-invalid': nifError }" />
                    <button class="btn-ghost" type="button" @click="validarNIF"
                      :disabled="validandoNIF || !form.nif?.trim()">
                      {{ validandoNIF ? 'Validando...' : 'Validar NIF' }}
                    </button>
                  </div>
                  <div class="error-text" v-if="nifError">{{ nifError }}</div>
                  <small v-if="nifSucesso" class="text-ok d-block mt-1">NIF validado com sucesso!</small>
                </div>

                <div class="col-md-6">
                  <label class="ledger-label">Endereço</label>
                  <input type="text" class="ledger-input" v-model="form.endereco" />
                </div>

                <div class="col-md-6">
                  <label class="ledger-label">Cidade</label>
                  <input type="text" class="ledger-input" v-model="form.cidade" />
                </div>

                <div class="col-md-6">
                  <label class="ledger-label">Província</label>
                  <select class="ledger-input" v-model="form.provincia">
                    <option value="Lunda-sul">Lunda-sul</option>
                    <!-- ... adicione as outras províncias do enum ... -->
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="ledger-label">Tipo</label>
                  <select class="ledger-input" v-model="form.tipo">
                    <option value="singular">Singular</option>
                    <option value="coletivo">Coletivo</option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="ledger-label">Observações</label>
                  <textarea class="ledger-input" rows="3" v-model="form.observacoes"></textarea>
                </div>

                <div class="col-12">
                  <label class="switch-label">
                    <input type="checkbox" v-model="form.ativo" class="switch-input" />
                    <span class="switch-track"><span class="switch-thumb"></span></span>
                    Cliente ativo
                  </label>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="fecharModal('novoClienteModal')">Cancelar</button>
            <button type="button" class="btn-primary" @click="salvarCliente" :disabled="salvando || validandoNIF">
              {{ salvando ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Confirmação Exclusão -->
    <div class="modal fade" id="confirmarExclusaoClienteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content ledger-modal">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar Exclusão</h5>
            <button type="button" class="btn-close" @click="fecharModal('confirmarExclusaoClienteModal')"></button>
          </div>
          <div class="modal-body">
            Tem certeza que deseja excluir o cliente <strong>{{ clienteSelecionado?.nome }}</strong>?
            <p class="text-rule mt-2 mb-0">Esta ação não pode ser desfeita.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="fecharModal('confirmarExclusaoClienteModal')">Cancelar</button>
            <button type="button" class="btn-danger" @click="excluirCliente" :disabled="excluindo">
              {{ excluindo ? 'Excluindo...' : 'Confirmar Exclusão' }}
            </button>
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
import axios from 'axios'
import { toast } from "vue3-toastify"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const store = useStore()

// Filtros
const filtros = ref({
  busca: '',
  status: '',
  page: 1,
  limit: 10
})

// Formulário
const form = ref({
  nome: '',
  email: '',
  telefone: '',
  nif: '',
  endereco: '',
  cidade: 'Saurimo',
  provincia: 'Lunda-sul',
  tipo: 'singular',
  observacoes: '',
  ativo: true
})

const errors = ref({})
const salvando = ref(false)
const excluindo = ref(false)
const modoEdicao = ref(false)
const clienteSelecionado = ref(null)

// Estados para validação de NIF (opcional)
const nomeBloqueado = ref(false)
const validandoNIF = ref(false)
const nifSucesso = ref(false)
const nifError = ref('')

// Vuex getters
const clientesListados = computed(() => store.getters.clientesListados || [])
const paginationInfo = computed(() => store.getters.clientesPagination || {})
const clientesLoading = computed(() => store.getters.clientesLoading || false)
const clientesError = computed(() => store.getters.clientesError || null)

const filtrosAtivos = computed(() => filtros.value.busca || filtros.value.status)

const resumo = computed(() => store.getters.resumoClientes || null)

const carregarResumo = async () => {
  try {
    await store.dispatch('carregarResumoClientes')
  } catch (err) {
    // Falha silenciosa: os cartões de resumo simplesmente não aparecem
  }
}

const carregarClientes = async (resetPage = false) => {
  if (resetPage) filtros.value.page = 1
  await store.dispatch('listClients', {
    page: filtros.value.page,
    limit: filtros.value.limit,
    busca: filtros.value.busca.trim() || undefined,
    ativo: filtros.value.status === 'ativo' ? true : filtros.value.status === 'inativo' ? false : undefined
  })
}

// Validação de NIF — apenas um atalho opcional para pré-preencher o nome.
// NÃO é obrigatória para guardar o cliente.
const validarNIF = async () => {
  const nif = form.value.nif?.trim()

  if (!nif || nif.length < 8) {
    nifError.value = 'Informe um NIF válido (mínimo 8 caracteres)'
    return
  }

  validandoNIF.value = true
  nifSucesso.value = false
  nifError.value = ''
  nomeBloqueado.value = false

  try {
    const response = await axios.get(`https://consulta.edgarsingui.ao/consultar/${nif}${form.value.tipo == 'coletivo' ? '/nif' : ''}`)

    if (!response.data.error) {
      form.value.nome = response.data.name
      nomeBloqueado.value = true
      nifSucesso.value = true
    } else {
      nifError.value = 'NIF não encontrado na base externa.'
      nomeBloqueado.value = false
    }
  } catch (error) {
    console.error('Erro na validação de NIF:', error)
    nifError.value = 'Erro ao consultar o NIF. Verifique a conexão ou tente novamente.'
    nomeBloqueado.value = false
  } finally {
    validandoNIF.value = false
  }
}

watch([() => filtros.value.busca, () => filtros.value.status], () => carregarClientes(true))

onMounted(() => {
  carregarClientes()
  carregarResumo()
})

const mudarPagina = (novaPagina) => {
  if (novaPagina < 1 || novaPagina > paginationInfo.value.totalPages) return
  filtros.value.page = novaPagina
  carregarClientes()
}

const fecharModal = (modalId) => {
  const modalElement = document.getElementById(modalId)
  if (modalElement) {
    Modal.getInstance(modalElement)?.hide()
    if (modalId === 'novoClienteModal') resetForm()
  }
}

const resetForm = () => {
  form.value = {
    nome: '',
    email: '',
    telefone: '',
    nif: '',
    endereco: '',
    cidade: 'Saurimo',
    provincia: 'Lunda-sul',
    tipo: 'singular',
    observacoes: '',
    ativo: true
  }
  errors.value = {}
  modoEdicao.value = false
  clienteSelecionado.value = null
  nomeBloqueado.value = false
  validandoNIF.value = false
  nifSucesso.value = false
  nifError.value = ''
}

const abrirModalNovo = () => {
  resetForm()
  new Modal(document.getElementById('novoClienteModal')).show()
}

const editarCliente = (cliente) => {
  modoEdicao.value = true
  clienteSelecionado.value = cliente

  form.value = {
    nome: cliente.nome,
    email: cliente.email || '',
    telefone: cliente.telefone || '',
    nif: cliente.nif || '',
    endereco: cliente.endereco || '',
    cidade: cliente.cidade || 'Luanda',
    provincia: cliente.provincia || 'Luanda',
    tipo: cliente.tipo || 'coletivo',
    observacoes: cliente.observacoes || '',
    ativo: cliente.ativo
  }

  new Modal(document.getElementById('novoClienteModal')).show()
}

// NIF deixou de ser obrigatório — só o Nome é exigido no formulário.
const validarFormulario = () => {
  errors.value = {}

  if (!form.value.nome?.trim()) errors.value.nome = 'Nome obrigatório'
  if (form.value.email?.trim() && !/^\S+@\S+\.\S+$/.test(form.value.email.trim())) {
    errors.value.email = 'Email inválido'
  }

  return Object.keys(errors.value).length === 0
}

const salvarCliente = async () => {
  if (!validarFormulario()) return

  salvando.value = true

  try {
    const payload = {
      nome: form.value.nome.trim(),
      email: form.value.email?.trim() || undefined,
      telefone: form.value.telefone || undefined,
      nif: form.value.nif?.trim() || undefined,
      endereco: form.value.endereco?.trim() || undefined,
      cidade: form.value.cidade,
      provincia: form.value.provincia,
      tipo: form.value.tipo,
      observacoes: form.value.observacoes?.trim() || undefined,
      ativo: form.value.ativo
    }

    if (modoEdicao.value && clienteSelecionado.value?._id) {
      await store.dispatch('updateClient', { id: clienteSelecionado.value._id, payload })
      toast('Cliente atualizado com sucesso!', { position: "top-right", autoClose: 2500, type: 'success' })
    } else {
      await store.dispatch('createClient', payload)
      toast('Cliente criado com sucesso!', { position: "top-right", autoClose: 2500, type: 'success' })
    }

    fecharModal('novoClienteModal')
    carregarClientes()
    carregarResumo()

  } catch (err) {
    toast(err.response?.data?.message || 'Erro ao salvar cliente', { position: "top-right", autoClose: 2500, type: 'error' })
  } finally {
    salvando.value = false
  }
}

const confirmarExclusao = (cliente) => {
  clienteSelecionado.value = cliente
  new Modal(document.getElementById('confirmarExclusaoClienteModal')).show()
}

const excluirCliente = async () => {
  excluindo.value = true

  try {
    await store.dispatch('deleteClient', clienteSelecionado.value._id)
    fecharModal('confirmarExclusaoClienteModal')
    toast('Cliente excluido com sucesso!', { position: "top-right", autoClose: 2500, type: 'success' })
    clienteSelecionado.value = null
    carregarClientes()
    carregarResumo()
  } catch (err) {
    toast(err.response?.data?.message || 'Erro ao excluir cliente', { position: "top-right", autoClose: 2500, type: 'error' })
  } finally {
    excluindo.value = false
  }
}

const limparFiltros = () => {
  filtros.value.busca = ''
  filtros.value.status = ''
  carregarClientes(true)
}

const gerarPDFClientes = () => {
  const doc = new jsPDF()

  // Cabeçalho
  doc.setFontSize(14)
  doc.text('Relatório de Clientes', 14, 16)

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
      head: [['Total de Clientes', 'Ativos', 'Inativos', 'Novos este mês']],
      body: [[
        String(resumo.value.totalClientes ?? '—'),
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

  // Lista de clientes
  doc.setFontSize(11)
  doc.setTextColor(32, 29, 26)
  doc.text('Clientes', 14, cursorY)
  cursorY += 5

  const linhas = clientesListados.value.map((c) => [
    c.nome || '—',
    c.email || '—',
    c.telefone || '—',
    c.nif || '—',
    `${c.cidade || '—'} / ${c.provincia || '—'}`,
    c.tipo === 'coletivo' ? 'Coletivo' : 'Singular',
    c.ativo ? 'Ativo' : 'Inativo',
  ])

  autoTable(doc, {
    startY: cursorY,
    head: [['Nome', 'Email', 'Telefone', 'NIF', 'Cidade/Província', 'Tipo', 'Status']],
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

  doc.save(`clientes-${new Date().toISOString().slice(0, 10)}.pdf`)
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

.text-ink { color: var(--ink); }
.text-rule { color: var(--rule); }
.text-ok { color: var(--ok); }

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
.stat-blue .stat-tab { background: #2563eb; }
.stat-blue .stat-value { color: #1d4ed8; }

.stat-rose { background: #fff0f1; border-color: #ffd0d4; }
.stat-rose .stat-tab { background: #e11d48; }
.stat-rose .stat-value { color: #be123c; }

.stat-emerald { background: #ecfdf5; border-color: #bdf0d6; }
.stat-emerald .stat-tab { background: #059669; }
.stat-emerald .stat-value { color: #047857; }

.stat-amber { background: #fff8e8; border-color: #fbe2a6; }
.stat-amber .stat-tab { background: #d97706; }
.stat-amber .stat-value { color: #b45309; }

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
.ledger-input:focus { border-color: var(--ink); }
.ledger-input.input-invalid { border-color: var(--rule); }

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

.error-text {
  color: var(--rule);
  font-size: 0.75rem;
  margin-top: 0.25rem;
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

.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot-rule { background: var(--rule); }
.dot-ok { background: var(--ok); }

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

.ledger-table tbody tr td:first-child {
  border-left: 3px solid var(--rule);
}

.ledger-table tbody tr:hover { background: #fbfaf6; }

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
.btn-icon:hover { border-color: var(--ink); color: var(--ink); }
.btn-icon.btn-rule:hover { border-color: var(--rule); color: var(--rule); }

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
.page-btn.active { background: var(--ink); color: #fff; border-color: var(--ink); }
.page-btn:disabled { opacity: 0.4; }

/* Botões */
.btn-primary {
  background: var(--ink);
  color: #fff;
  border-radius: 8px;
  padding: 0.5rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
}
.btn-primary:disabled { opacity: 0.6; }

.btn-danger {
  background: var(--rule);
  color: #fff;
  border-radius: 8px;
  padding: 0.5rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
}
.btn-danger:disabled { opacity: 0.6; }

.btn-ghost {
  background: #fff;
  border: 1px solid var(--paper-line);
  font-weight: 600;
  color: var(--ink-soft);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}
.btn-ghost:hover { border-color: var(--ink); color: var(--ink); }
.btn-ghost:disabled { opacity: 0.5; }

.nif-group {
  display: flex;
  gap: 0.5rem;
}
.nif-group .ledger-input { flex: 1; }
.nif-group .btn-ghost { white-space: nowrap; }

/* Switch estilizado */
.switch-label {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.875rem;
  color: var(--ink-soft);
  cursor: pointer;
}
.switch-input { position: absolute; opacity: 0; width: 0; height: 0; }
.switch-track {
  position: relative;
  width: 38px;
  height: 22px;
  background: #cbd5e1;
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
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.switch-input:checked + .switch-track { background: var(--ink); }
.switch-input:checked + .switch-track .switch-thumb { transform: translateX(16px); }

/* Modais */
.ledger-modal { border-radius: 12px; border: none; }
.ledger-modal .modal-header,
.ledger-modal .modal-footer { border-color: var(--paper-line); padding: 1.1rem 1.4rem; }
.ledger-modal .modal-body { padding: 1.4rem; max-height: 70vh; overflow-y: auto; }
.ledger-modal .modal-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
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
@keyframes spin { to { transform: rotate(360deg); } }
</style>