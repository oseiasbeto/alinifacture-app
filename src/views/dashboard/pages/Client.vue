<!-- Clientes.vue (componente completo, baseado no Produtos.vue) -->
<template>
    <div class="space-y-6">
        <!-- Cabeçalho -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Clientes</h1>
                <p class="text-sm text-gray-500 mt-1">Gerencie seus clientes e contatos</p>
            </div>
            <div class="flex gap-2">
                <button class="btn btn-outline-secondary flex items-center gap-2">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Exportar
                </button>
                <button class="btn btn-primary flex items-center gap-2" @click="abrirModalNovo">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Novo Cliente
                </button>
            </div>
        </div>

        <!-- Filtros -->
        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="relative">
                    <input type="text" v-model="filtros.busca" placeholder="Buscar por nome, email, telefone ou NIF..."
                        class="form-control pl-10" />
                    <div class="absolute left-3 top-2.5">
                        <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <select v-model="filtros.status" class="form-select">
                    <option value="">Todos os status</option>
                    <option value="ativo">Ativos</option>
                    <option value="inativo">Inativos</option>
                </select>
            </div>

            <div v-if="filtrosAtivos" class="mt-3 flex flex-wrap gap-2">
                <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Filtros aplicados
                    <button @click="limparFiltros" class="ml-2 text-blue-600 hover:text-blue-800">
                        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </span>
            </div>
        </div>

        <!-- Tabela / Loading / Error -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div v-if="clientesLoading" class="p-10 text-center text-gray-500">
                <div class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
                <p class="mt-2">Carregando clientes...</p>
            </div>

            <div v-else-if="clientesError" class="p-6 text-center text-red-600">
                {{ clientesError }}
            </div>

            <div v-else-if="clientesListados.length === 0" class="p-10 text-center text-gray-500">
                Nenhum cliente encontrado.
            </div>

            <div v-else>
                <div class="overflow-x-auto">
                    <table class="table table-hover mb-0 w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIF</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endereço
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Cidade/Província</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr v-for="cliente in clientesListados" :key="cliente._id" class="hover:bg-gray-50">
                                <td class="px-6 py-4">
                                    <div class="flex items-center">
                                        <div
                                            class="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-400">
                                            Sem img
                                        </div>
                                        <div class="ml-4">
                                            <div class="text-sm font-medium text-gray-900">{{ cliente.nome }}</div>
                                            <div class="text-sm text-gray-500 line-clamp-1">{{ cliente.observacoes ||
                                                'Sem observações' }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-500">{{ cliente.email || '-' }}</td>
                                <td class="px-6 py-4 text-sm text-gray-500">{{ cliente.telefone || '-' }}</td>
                                <td class="px-6 py-4 text-sm text-gray-500">{{ cliente.nif || '-' }}</td>
                                <td class="px-6 py-4 text-sm text-gray-500">{{ cliente.endereco || '-' }}</td>
                                <td class="px-6 py-4 text-sm text-gray-500">{{ cliente.cidade }} / {{ cliente.provincia
                                }}</td>
                                <td class="px-6 py-4 text-sm text-gray-500 capitalize">{{ cliente.tipo }}</td>
                                <td class="px-6 py-4">
                                    <span class="px-2 py-1 text-xs rounded-full"
                                        :class="cliente.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                                        {{ cliente.ativo ? 'Ativo' : 'Inativo' }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right space-x-2">
                                    <button class="btn btn-sm btn-outline-primary" title="Editar"
                                        @click="editarCliente(cliente)">
                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" title="Excluir"
                                        @click="confirmarExclusao(cliente)">
                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Paginação -->
                <div class="px-6 py-4 border-t bg-gray-50 flex items-center justify-between text-sm text-gray-600">
                    <div>
                        Mostrando {{ (paginationInfo.page - 1) * paginationInfo.limit + 1 }}–
                        {{ Math.min(paginationInfo.page * paginationInfo.limit, paginationInfo.totalDocs) }} de
                        {{ paginationInfo.totalDocs }} clientes
                    </div>

                    <nav class="flex gap-1">
                        <button class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                            :disabled="paginationInfo.page === 1" @click="mudarPagina(paginationInfo.page - 1)">
                            Anterior
                        </button>

                        <button v-for="n in Math.min(7, paginationInfo.totalPages)" :key="n"
                            class="px-3 py-1 border rounded"
                            :class="{ 'bg-blue-600 text-white': paginationInfo.page === n }" @click="mudarPagina(n)">
                            {{ n }}
                        </button>

                        <button class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                            :disabled="!paginationInfo.hasNextPage" @click="mudarPagina(paginationInfo.page + 1)">
                            Próxima
                        </button>
                    </nav>
                </div>
            </div>
        </div>

        <!-- Modal Novo/Editar Cliente -->
        <div class="modal fade" id="novoClienteModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ modoEdicao ? 'Editar Cliente' : 'Novo Cliente' }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                            @click="fecharModal('novoClienteModal')"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="salvarCliente" @keydown.enter.prevent>
                            <div class="row g-3">
                                <div class="col-12">
                                    <label class="form-label">Nome <span class="text-red-500">*</span></label>
                                    <input type="text" class="form-control" v-model="form.nome"
                                        :class="{ 'is-invalid': errors.nome }" :readonly="nomeBloqueado"
                                        :disabled="nomeBloqueado" placeholder="" />
                                    <div class="invalid-feedback" v-if="errors.nome">{{ errors.nome }}</div>
                                    <small v-if="nomeBloqueado" class="text-muted">
                                        Nome preenchido automaticamente a partir do NIF.
                                    </small>
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" v-model="form.email"
                                        :class="{ 'is-invalid': errors.email }" />
                                    <div class="invalid-feedback" v-if="errors.email">{{ errors.email }}</div>
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Telefone</label>
                                    <input type="text" class="form-control" v-model="form.telefone" />
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">NIF</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" v-model="form.nif"
                                            placeholder="Ex: 999999999"
                                            :class="{ 'is-invalid': errors.nif || nifError }" />
                                        <button class="btn btn-outline-secondary" type="button" @click="validarNIF"
                                            :disabled="validandoNIF || !form.nif?.trim()">
                                            <span v-if="validandoNIF" class="spinner-border spinner-border-sm me-2"
                                                role="status"></span>
                                            {{ validandoNIF ? 'Validando...' : 'Validar NIF' }}
                                        </button>
                                    </div>
                                    <div class="invalid-feedback" v-if="errors.nif || nifError">{{
                                        nifError }}</div>
                                    <small v-if="nifSucesso" class="text-success d-block mt-1">
                                        NIF validado com sucesso!
                                    </small>
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Endereço</label>
                                    <input type="text" class="form-control" v-model="form.endereco" />
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Cidade</label>
                                    <input type="text" class="form-control" v-model="form.cidade" />
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Província</label>
                                    <select class="form-select" v-model="form.provincia">
                                        <option value="Luanda">Luanda</option>
                                        <option value="Benguela">Benguela</option>
                                        <!-- ... adicione as outras províncias do enum ... -->
                                    </select>
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Tipo</label>
                                    <select class="form-select" v-model="form.tipo">
                                        <option value="singular">Singular</option>
                                        <option value="coletivo">Coletivo</option>
                                    </select>
                                </div>

                                <div class="col-12">
                                    <label class="form-label">Observações</label>
                                    <textarea class="form-control" rows="3" v-model="form.observacoes"></textarea>
                                </div>

                                <div class="col-12">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" v-model="form.ativo"
                                            id="ativoCheck" />
                                        <label class="form-check-label" for="ativoCheck">Cliente ativo</label>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                            @click="fecharModal('novoClienteModal')">Cancelar</button>
                        <button type="button" class="btn btn-primary" @click="salvarCliente" :disabled="salvando || validandoNIF">
                            <span v-if="salvando" class="spinner-border spinner-border-sm me-2"></span>
                            {{ salvando ? 'Salvando...' : 'Salvar' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Confirmação Exclusão -->
        <div class="modal fade" id="confirmarExclusaoClienteModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirmar Exclusão</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        Tem certeza que deseja excluir o cliente <strong>{{ clienteSelecionado?.nome }}</strong>?
                        <p class="text-danger">Esta ação não pode ser desfeita.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-danger" @click="excluirCliente" :disabled="excluindo">
                            <span v-if="excluindo" class="spinner-border spinner-border-sm me-2" role="status"></span>
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
import axios from 'axios' // certifica-te que tens axios instalado
import { toast } from "vue3-toastify"

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
    cidade: 'Luanda',
    provincia: 'Luanda',
    tipo: 'singular',
    observacoes: '',
    ativo: true
})

const errors = ref({})
const salvando = ref(false)
const excluindo = ref(false)
const modoEdicao = ref(false)
const clienteSelecionado = ref(null)

// Estados para validação de NIF
const nomeBloqueado = ref(false)
const validandoNIF = ref(false)
const nifSucesso = ref(false)
const nifError = ref('')

// Vuex getters (assumindo módulo 'clientes' ou global)
const clientesListados = computed(() => store.getters.clientesListados || [])
const paginationInfo = computed(() => store.getters.clientesPagination || {})
const clientesLoading = computed(() => store.getters.clientesLoading || false)
const clientesError = computed(() => store.getters.clientesError || null)

// Filtros ativos
const filtrosAtivos = computed(() => filtros.value.busca || filtros.value.status)

// Carregar clientes
const carregarClientes = async (resetPage = false) => {
    if (resetPage) filtros.value.page = 1
    await store.dispatch('listClients', {
        page: filtros.value.page,
        limit: filtros.value.limit,
        busca: filtros.value.busca.trim() || undefined,
        ativo: filtros.value.status === 'ativo' ? true : filtros.value.status === 'inativo' ? false : undefined
    })
}

// Função para validar NIF ao clicar no botão
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
        const response = await axios.get(`https://consulta.edgarsingui.ao/consultar/${nif}`)

        if (!response.data.error) {
            // Sucesso: preenche nome e bloqueia
            form.value.nome = response.data.name
            nomeBloqueado.value = true
            nifSucesso.value = true
        } else {
            // Não encontrou
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

// Watch para recarregar ao mudar busca ou status
watch([() => filtros.value.busca, () => filtros.value.status], () => carregarClientes(true))

onMounted(() => carregarClientes())

// Paginação
const mudarPagina = (novaPagina) => {
    if (novaPagina < 1 || novaPagina > paginationInfo.value.totalPages) return
    filtros.value.page = novaPagina
    carregarClientes()
}

// Função fechar modal
const fecharModal = (modalId) => {
    const modalElement = document.getElementById(modalId)
    if (modalElement) {
        Modal.getInstance(modalElement)?.hide()
        resetForm()
    }
}

// Reset form
const resetForm = () => {
    form.value = {
        nome: '',
        email: '',
        telefone: '',
        nif: '',
        endereco: '',
        cidade: 'Luanda',
        provincia: 'Luanda',
        tipo: 'coletivo',
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

// Abrir modal novo
const abrirModalNovo = () => {
    resetForm()
    fecharModal('confirmarExclusaoClienteModal') // garante que outro modal feche
    new Modal(document.getElementById('novoClienteModal')).show()
}

// Editar cliente
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

// Validar formulário
const validarFormulario = () => {
    errors.value = {}

    if (!form.value.nome?.trim()) errors.value.nome = 'Nome obrigatório'
    if (!form.value.nif?.trim()) errors.value.nif = 'NIF obrigatório'
    const nif = form.value.nif?.trim()

    if (!nif || nif.length < 8) {
        errors.value.nif = 'Informe um NIF válido (mínimo 8 caracteres)'
        nifError.value = 'Informe um NIF válido (mínimo 8 caracteres)'
    }

    return Object.keys(errors.value).length === 0
}

// Salvar cliente (create ou update)
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
            await store.dispatch('updateClient', {
                id: clienteSelecionado.value._id,
                payload
            })
            toast('Cliente atualizado com sucesso!', {
                theme: "colored",
                position: "top-right",
                autoClose: 2500,
                type: 'success'
            })
        } else {
            await store.dispatch('createClient', payload)
            toast('Cliente criado com sucesso!', {
                theme: "colored",
                position: "top-right",
                autoClose: 2500,
                type: 'success'
            })
        }

        fecharModal('novoClienteModal')
        carregarClientes()

    } catch (err) {
        toast(err.response?.data?.message || 'Erro ao salvar cliente', {
            theme: "colored",
            position: "top-right",
            autoClose: 2500,
            type: 'error'
        })
    } finally {
        salvando.value = false
    }
}

// Confirmar exclusão
const confirmarExclusao = (cliente) => {
    clienteSelecionado.value = cliente
    new Modal(document.getElementById('confirmarExclusaoClienteModal')).show()
}

// Excluir cliente
const excluirCliente = async () => {
    excluindo.value = true

    try {
        await store.dispatch('deleteClient', clienteSelecionado.value._id)

        fecharModal('confirmarExclusaoClienteModal')
        toast('Cliente excluido com sucesso!', {
            theme: "colored",
            position: "top-right",
            autoClose: 2500,
            type: 'success'
        })
        clienteSelecionado.value = null
        carregarClientes()

    } catch (err) {
        toast(err.response?.data?.message || 'Erro ao excluir cliente', {
            theme: "colored",
            position: "top-right",
            autoClose: 2500,
            type: 'error'
        })
    } finally {
        excluindo.value = false
    }
}

// Limpar filtros
const limparFiltros = () => {
    filtros.value.busca = ''
    filtros.value.status = ''
    carregarClientes(true)
}
</script>

<style scoped>
/* Ajustes para o modal do Bootstrap */
:deep(.modal-content) {
    border-radius: 0.5rem;
}

:deep(.modal-header) {
    border-bottom-color: #e5e7eb;
    padding: 1.25rem 1.5rem;
}

:deep(.modal-body) {
    padding: 1.5rem;
    max-height: 70vh;
    overflow-y: auto;
}

:deep(.modal-footer) {
    border-top-color: #e5e7eb;
    padding: 1.25rem 1.5rem;
}

/* Estilo para a tabela */
.table th {
    border-bottom-width: 1px;
    font-weight: 600;
}

.table td {
    vertical-align: middle;
}

/* Hover suave nos botões */
.btn {
    transition: all 0.2s;
}

.btn-sm {
    padding: 0.25rem 0.5rem;
}

/* Animação para o modal */
.modal.fade .modal-dialog {
    transition: transform 0.2s ease-out;
}

.required {
    color: #e02222;
    font-size: 12px;
    padding-left: 2px;
}

/* Estilo para campos inválidos */
.is-invalid {
    border-color: #dc3545;
    background-image: none;
}

.is-invalid:focus {
    border-color: #dc3545;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

/* Animação do spinner */
.spinner-border {
    width: 1rem;
    height: 1rem;
    border-width: 0.15em;
}
</style>