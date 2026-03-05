<template>
  <div class="space-y-6">
    <!-- Cabeçalho -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Produtos</h1>
        <p class="text-sm text-gray-500 mt-1">Gerencie seu catálogo de produtos e estoque</p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-primary flex items-center gap-2" @click="abrirModalNovo('novoProdutoModal')">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Novo Produto
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="relative">
          <input type="text" v-model="filtros.busca" placeholder="Buscar por nome, código ou descrição..."
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
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Filtros aplicados
          <button @click="limparFiltros" class="ml-2 text-blue-600 hover:text-blue-800">
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      </div>
    </div>

    <!-- Tabela / Loading / Error -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="produtosLoading" class="p-10 text-center text-gray-500">
        <div class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
        <p class="mt-2">Carregando produtos...</p>
      </div>

      <div v-else-if="produtosError" class="p-6 text-center text-red-600">
        {{ produtosError }}
      </div>

      <div v-else-if="produtosListados.length === 0" class="p-10 text-center text-gray-500">
        Nenhum produto encontrado.
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="table table-hover mb-0 w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="produto in produtosListados" :key="produto._id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="flex items-center">

                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ produto.nome }}</div>
                      <div class="text-sm text-gray-500 line-clamp-1">{{ produto.descricao || 'Sem descrição' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ produto.codigo || '-' }}</td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">
                  {{ produto.preco.toFixed(2) }} Kz
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 uppercase">{{ produto.unidade }}</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 text-xs rounded-full"
                    :class="produto.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ produto.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right space-x-2">
                  <button class="btn btn-sm btn-outline-primary" title="Editar" @click="editarProduto(produto)">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" title="Excluir" @click="confirmarExclusao(produto)">
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
            {{ paginationInfo.totalDocs }} produtos
          </div>

          <nav class="flex gap-1">
            <button class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
              :disabled="paginationInfo.page === 1" @click="mudarPagina(paginationInfo.page - 1)">
              Anterior
            </button>

            <button v-for="n in Math.min(7, paginationInfo.totalPages)" :key="n" class="px-3 py-1 border rounded"
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

    <!-- Modal Novo/Editar Produto -->
    <div class="modal fade" id="novoProdutoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ modoEdicao ? 'Editar Produto' : 'Novo Produto' }}</h5>
            <button type="button" class="btn-close" @click="fecharModal('novoProdutoModal')"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="salvarProduto" @keydown.enter.prevent>
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Nome do produto <span class="text-red-500">*</span></label>
                  <input type="text" class="form-control" v-model="form.nome" :class="{ 'is-invalid': errors.nome }" />
                  <div class="invalid-feedback" v-if="errors.nome">{{ errors.nome }}</div>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Código de barras</label>
                  <input type="text" class="form-control" v-model="form.codigoBarras" autofocus />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Tipo <span class="text-red-500">*</span></label>
                  <select class="form-select" v-model="form.tipo" :class="{ 'is-invalid': errors.tipo }">
                    <option value="">Selecione</option>
                    <option value="produto">Produto</option>
                    <option value="servico">Serviço</option>
                  </select>
                  <div class="invalid-feedback" v-if="errors.tipo">{{ errors.tipo }}</div>
                </div>

                <div class="col-12">
                  <label class="form-label">Descrição</label>
                  <textarea class="form-control" rows="3" v-model="form.descricao"></textarea>
                </div>

                <div class="col-md-4">
                  <label class="form-label">Moeda <span class="text-red-500">*</span></label>
                  <select class="form-select" v-model="form.moeda" :class="{ 'is-invalid': errors.moeda }">
                    <option value="">Selecione</option>
                    <option value="Kz">Kz (Kwanzas)</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                  <div class="invalid-feedback" v-if="errors.moeda">{{ errors.moeda }}</div>
                </div>

                <div class="col-md-4">
                  <label class="form-label">Preço de venda <span class="text-red-500">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text">{{ form.moeda || 'Kz' }}</span>
                    <input type="number" step="0.01" min="0" class="form-control" v-model="form.precoVenda"
                      :class="{ 'is-invalid': errors.precoVenda }" />
                  </div>
                  <div class="invalid-feedback" v-if="errors.precoVenda">{{ errors.precoVenda }}</div>
                </div>

                <div class="col-md-4">
                  <label class="form-label">Custo</label>
                  <div class="input-group">
                    <span class="input-group-text">{{ form.moeda || 'Kz' }}</span>
                    <input type="number" step="0.01" min="0" class="form-control" v-model="form.custo"
                      :class="{ 'is-invalid': errors.custo }" />
                  </div>
                  <div class="invalid-feedback" v-if="errors.custo">{{ errors.custo }}</div>
                </div>

                <div class="col-12">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" v-model="form.ativo" id="ativoCheck" />
                    <label class="form-check-label" for="ativoCheck">Produto ativo (disponível para venda)</label>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="fecharModal('novoProdutoModal')">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="salvarProduto" :disabled="salvando">
              <span v-if="salvando" class="spinner-border spinner-border-sm me-2"></span>
              {{ salvando ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Confirmação Exclusão (ainda placeholder - implemente quando tiver delete) -->
    <div class="modal fade" id="confirmarExclusaoModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar Exclusão</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            Tem certeza que deseja excluir <strong>{{ produtoSelecionado?.nome }}</strong>?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-danger" @click="excluirProduto">Excluir</button>
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
  codigoBarras: '',
  tipo: '',
  descricao: '',
  moeda: 'Kz',
  precoVenda: '',
  custo: '',
  quantidade: '',
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

// Watch para recarregar ao mudar busca ou status
watch([() => filtros.value.busca, () => filtros.value.status], () => carregarProdutos(true))

onMounted(() => {
  carregarProdutos()

  const blockCtrlJ = (e) => {
    if (e.ctrlKey && (e.key === 'j' || e.keyCode === 74)) {
      e.preventDefault()
    }
  }
  document.addEventListener('keydown', blockCtrlJ)

  // Limpa ao destruir componente
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
    moeda: 'Kz',
    precoVenda: '',
    custo: '',
    quantidade: '',
    ativo: true
  }
  errors.value = {}
  modoEdicao.value = false
  produtoSelecionado.value = null
}

// Função para fechar o modal de forma segura
const fecharModal = (modalId = 'novoProdutoModal') => {
  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    const modalInstance = Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }
    // Limpa o form sempre que fechar
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
    moeda: 'Kz',
    precoVenda: produto.preco,
    custo: 0, // ajuste se tiver campo custo no backend
    quantidade: 0,
    ativo: produto.ativo
  }
  new Modal(document.getElementById('novoProdutoModal')).show()
}

const validarFormulario = () => {
  errors.value = {}

  if (!form.value.nome?.trim()) errors.value.nome = 'Nome obrigatório'
  if (!form.value.tipo) errors.value.tipo = 'Tipo obrigatório'
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
      preco: Number(form.value.precoVenda),
      unidade: form.value.tipo === 'servico' ? 'servico' : 'un',
      tributavel: true,
      ativo: form.value.ativo
    };


    if (modoEdicao.value && produtoSelecionado.value?._id) {
      // Edição
      await store.dispatch('updateProduct', {
        id: produtoSelecionado.value._id,
        payload
      });
      toast('Produto atualizado com sucesso!', {
        theme: "colored",
        position: "top-right",
        autoClose: 2500,
        type: 'success'
      })
    } else {
      // Criação
      await store.dispatch('createProduct', payload);
      toast('Produto criado com sucesso!', {
        theme: "colored",
        position: "top-right",
        autoClose: 2500,
        type: 'success'
      })
    }
    resetForm();
    carregarProdutos(); // recarrega a lista

  } catch (err) {
    toast('Erro ao salvar produto!', {
      theme: "colored",
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
      theme: "colored",
      position: "top-right",
      autoClose: 2500,
      type: 'success'
    })
    produtoSelecionado.value = null;
    carregarProdutos(); // recarrega após exclusão

  } catch (err) {
    toast('Erro ao excluir produto!', {
      theme: "colored",
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