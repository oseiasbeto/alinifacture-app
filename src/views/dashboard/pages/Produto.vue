<template>
  <div class="ledger-scope space-y-6">
    <div v-if="loading" class="p-10 text-center text-stone-500">
      <div class="spinner"></div>
      <p class="mt-3 text-sm">Carregando produto...</p>
    </div>

    <div v-else-if="error" class="ledger-panel error-card">
      <p class="text-rule font-medium">{{ error }}</p>
      <div class="mt-4">
        <router-link to="/dashboard/produtos" class="btn-ghost">Voltar à lista</router-link>
      </div>
    </div>

    <div v-else-if="produto" class="space-y-6">
      <!-- Cabeçalho -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button class="back-link" @click="router.push('/dashboard/produtos')">
            ← Voltar aos produtos
          </button>
          <div class="flex items-center gap-3 mt-1.5 flex-wrap">
            <h1 class="ledger-title">{{ produto.nome }}</h1>
            <span class="status-tag">
              <span class="status-dot" :class="produto.ativo ? 'dot-ok' : 'dot-rule'"></span>
              {{ produto.ativo ? 'Ativo' : 'Inativo' }}
            </span>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <button class="btn-secondary" @click="abrirModalEditar">
            Editar Produto
          </button>
          <button class="btn-danger-outline" @click="apagarProduto" :disabled="apagando">
            <span v-if="apagando" class="btn-spinner"></span>
            <span v-else>Apagar Produto</span>
          </button>
        </div>
      </div>

      <!-- Dados gerais -->
      <div class="ledger-panel info-card">
        <h2 class="eyebrow">Dados do Produto</h2>
        <dl class="info-grid">
          <div class="info-item">
            <dt>Código</dt>
            <dd>{{ produto.codigo || '-' }}</dd>
          </div>
          <div class="info-item">
            <dt>Cor</dt>
            <dd>
              <span v-if="produto.cor" class="cor-tag">
                <span class="cor-dot" :style="{ background: corParaHex(produto.cor) }"></span>
                {{ produto.cor }}
              </span>
              <span v-else>-</span>
            </dd>
          </div>
          <div class="info-item">
            <dt>Tipo</dt>
            <dd class="uppercase">{{ produto.unidade === 'servico' ? 'Serviço' : 'Produto' }}</dd>
          </div>
          <div class="info-item">
            <dt>Preço de venda</dt>
            <dd class="num font-semibold text-ink">{{ produto?.preco.toFixed(2) }} Kz</dd>
          </div>
          <div class="info-item">
            <dt>Custo</dt>
            <dd class="num">{{ formatarMoeda(produto?.custo) }}</dd>
          </div>
          <div class="info-item">
            <dt>Tributável</dt>
            <dd>{{ produto?.tributavel ? 'Sim' : 'Não' }}</dd>
          </div>
          <div class="info-item info-item-full">
            <dt>Descrição</dt>
            <dd>{{ produto?.descricao || 'Sem descrição' }}</dd>
          </div>
        </dl>
      </div>

      <!-- Estoque -->
      <div class="ledger-panel info-card">
        <h2 class="eyebrow">Estoque</h2>
        <div v-if="!produto.controlaEstoque" class="text-sm text-stone-500">
          Este produto não tem controlo de estoque ativado.
        </div>
        <dl v-else class="info-grid info-grid-3">
          <div class="info-item">
            <dt>Estoque atual</dt>
            <dd class="num text-lg font-bold" :class="produto?.quantidade <= produto?.estoqueMinimo ? 'text-rule' : 'text-ok'">
              {{ produto?.quantidade }} un.
            </dd>
          </div>
          <div class="info-item">
            <dt>Estoque mínimo</dt>
            <dd class="num">{{ produto?.estoqueMinimo }} un.</dd>
          </div>
          <div class="info-item">
            <dt>Status</dt>
            <dd>
              <span class="status-tag">
                <span class="status-dot" :class="produto?.quantidade <= produto?.estoqueMinimo ? 'dot-rule' : 'dot-ok'"></span>
                {{ produto?.quantidade <= produto?.estoqueMinimo ? 'Estoque baixo' : 'Normal' }}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Modal Editar Produto (mesmo modelo da tela de Produtos) -->
    <div class="modal fade" id="editarProdutoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content ledger-modal">
          <div class="modal-header">
            <h5 class="modal-title">Editar Produto</h5>
            <button type="button" class="btn-close" @click="fecharModalEditar"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="salvarEdicao" @keydown.enter.prevent>
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
                </div>
              </div>

              <div class="form-section">
                <p class="form-section-title">Estoque</p>
                <div class="row g-3">
                  <div class="col-12">
                    <label class="switch-label">
                      <input type="checkbox" v-model="form.controlaEstoque" class="switch-input" />
                      <span class="switch-track"><span class="switch-thumb"></span></span>
                      Controlar estoque deste produto
                    </label>
                  </div>

                  <div class="col-md-6" v-if="form.controlaEstoque">
                    <label class="ledger-label">Estoque mínimo (alerta de reposição)</label>
                    <input type="number" min="0" class="ledger-input num" v-model="form.estoqueMinimo" />
                  </div>

                  <div class="col-md-6" v-if="form.controlaEstoque">
                    <label class="ledger-label">Estoque atual</label>
                    <input type="number" class="ledger-input num" :value="produto?.quantidade ?? 0" disabled />
                    <small class="text-stone-500">
                      Para alterar a quantidade, use a área de <router-link to="/estoque">Gestão de Estoque</router-link>.
                    </small>
                  </div>

                  <div class="col-12">
                    <label class="switch-label">
                      <input type="checkbox" v-model="form.ativo" class="switch-input" />
                      <span class="switch-track"><span class="switch-thumb"></span></span>
                      Produto ativo (disponível para venda)
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="fecharModalEditar">Cancelar</button>
            <button type="button" class="btn-primary" @click="salvarEdicao" :disabled="salvando">
              {{ salvando ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Confirmação Exclusão -->
    <div class="modal fade" id="confirmarExclusaoDetalheModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content ledger-modal">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar Exclusão</h5>
            <button type="button" class="btn-close" @click="fecharModalExclusao"></button>
          </div>
          <div class="modal-body">
            Tem certeza que deseja excluir <strong>{{ produto?.nome }}</strong>? Esta ação não pode ser desfeita.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="fecharModalExclusao">Cancelar</button>
            <button type="button" class="btn-primary btn-danger" @click="confirmarExclusao" :disabled="apagando">
              {{ apagando ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Modal } from 'bootstrap'
import { toast } from 'vue3-toastify'

const route = useRoute()
const router = useRouter()
const store = useStore()
const loading = ref(true)
const error = ref(null)
const apagando = ref(false)
const salvando = ref(false)

const produto = computed(() => store.getters.produtoDetalhado)

const carregarProduto = async () => {
  loading.value = true
  error.value = null
  try {
    await store.dispatch('getProduct', route.params.id)
  } catch (err) {
    error.value = err.response?.data?.message || 'Não foi possível carregar este produto.'
  } finally {
    loading.value = false
  }
}

onMounted(carregarProduto)

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

// Mapa aproximado de nome de cor -> hex, usado apenas para exibir a bolinha
const corParaHex = (nome) => {
  const encontrada = coresSugeridas.find(
    c => c.nome.toLowerCase() === String(nome).toLowerCase()
  )
  return encontrada ? encontrada.hex : '#CBD5E1'
}

// Formulário de edição
const form = ref({
  nome: '',
  codigoBarras: '',
  tipo: '',
  descricao: '',
  cor: '',
  moeda: 'Kz',
  precoVenda: '',
  custo: '',
  controlaEstoque: false,
  estoqueMinimo: 0,
  ativo: true
})

const errors = ref({})

// Editar produto agora abre modal na própria tela de detalhes,
// seguindo o mesmo modelo usado na tela de Produtos
const abrirModalEditar = () => {
  if (!produto.value) return

  errors.value = {}
  form.value = {
    nome: produto.value.nome,
    codigoBarras: produto.value.codigo || '',
    tipo: produto.value.unidade === 'servico' ? 'servico' : 'produto',
    descricao: produto.value.descricao || '',
    cor: produto.value.cor || '',
    moeda: 'Kz',
    precoVenda: produto.value.preco,
    custo: produto.value.custo || 0,
    controlaEstoque: produto.value.controlaEstoque || false,
    estoqueMinimo: produto.value.estoqueMinimo || 0,
    ativo: produto.value.ativo
  }
  new Modal(document.getElementById('editarProdutoModal')).show()
}

const fecharModalEditar = () => {
  const el = document.getElementById('editarProdutoModal')
  const instance = el && Modal.getInstance(el)
  if (instance) instance.hide()
}

const formatarMoeda = (v) =>
  `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(v) || 0)}kz`

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

const salvarEdicao = async () => {
  if (!validarFormulario()) return
  if (!produto.value?._id) return

  salvando.value = true
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
      estoqueMinimo: form.value.controlaEstoque ? Number(form.value.estoqueMinimo) || 0 : 0,
    }

    await store.dispatch('updateProduct', {
      id: produto.value._id,
      payload
    })

    toast('Produto atualizado com sucesso!', {
      theme: 'colored',
      position: 'top-right',
      autoClose: 2500,
      type: 'success'
    })

    fecharModalEditar()
    await carregarProduto()
  } catch (err) {
    toast('Erro ao salvar produto!', {
      theme: 'colored',
      position: 'top-right',
      autoClose: 2500,
      type: 'error'
    })
  } finally {
    salvando.value = false
  }
}

// Ver estoque leva para a gestão de estoque já filtrada neste produto
const verEstoque = () => {
  if (!produto.value.controlaEstoque) return
  router.push({ path: '/estoque', query: { produtoId: produto.value._id } })
}

const apagarProduto = () => {
  new Modal(document.getElementById('confirmarExclusaoDetalheModal')).show()
}

const fecharModalExclusao = () => {
  const el = document.getElementById('confirmarExclusaoDetalheModal')
  const instance = el && Modal.getInstance(el)
  if (instance) instance.hide()
}

const confirmarExclusao = async () => {
  apagando.value = true
  try {
    await store.dispatch('deleteProduct', produto.value._id)
    toast('Produto excluído com sucesso!', { type: 'success', autoClose: 2500 })
    fecharModalExclusao()
    router.push('/dashboard/produtos')
  } catch (err) {
    toast('Erro ao excluir produto!', { type: 'error', autoClose: 2500 })
  } finally {
    apagando.value = false
  }
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
  margin: 0 0 1.25rem;
}

.ledger-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.75rem;
  color: var(--ink);
}

.text-ink { color: var(--ink); }
.text-rule { color: var(--rule); }
.text-ok { color: var(--ok); }

.num {
  font-family: 'IBM Plex Mono', monospace;
  font-variant-numeric: tabular-nums;
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
@keyframes spin { to { transform: rotate(360deg); } }

.ledger-panel {
  background: #fff;
  border: 1px solid var(--paper-line);
  border-radius: 12px;
}

.error-card {
  padding: 3rem 1.5rem;
  text-align: center;
}

/* Voltar */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--rule);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: opacity 0.15s ease;
}
.back-link:hover { opacity: 0.75; }

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
.btn-primary:hover:not(:disabled) { opacity: 0.88; }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
.btn-primary.btn-danger { background: var(--rule); border-color: var(--rule); }

.btn-ghost {
  background: transparent;
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
.btn-ghost:hover:not(:disabled) { border-color: var(--ink); color: var(--ink); }
.btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-secondary {
  background: var(--paper);
  border: 1px solid var(--paper-line);
  color: var(--ink);
  border-radius: 8px;
  padding: 0.55rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-secondary:hover:not(:disabled) { border-color: var(--ink); }

.btn-danger-outline {
  background: #fff;
  border: 1px solid #f0c9c6;
  color: var(--rule);
  border-radius: 8px;
  padding: 0.55rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.btn-danger-outline:hover:not(:disabled) { background: #fdf1f0; border-color: var(--rule); }
.btn-danger-outline:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(181, 67, 60, 0.25);
  border-top-color: var(--rule);
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.7s linear infinite;
}

/* Cartões de informação */
.info-card { padding: 1.5rem; }

.info-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1.25rem 1.5rem;
}

@media (min-width: 640px) {
  .info-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .info-grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (min-width: 1024px) {
  .info-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

.info-item dt {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ink-soft);
  margin-bottom: 0.3rem;
}

.info-item dd {
  font-size: 0.9rem;
  color: var(--ink);
}

.info-item-full { grid-column: 1 / -1; }

/* Cor */
.cor-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.cor-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}

/* Status */
.status-tag {
  display: inline-flex;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ink-soft);
}

.status-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 0.4rem;
}
.dot-rule { background: var(--rule); }
.dot-ok { background: var(--ok); }

/* Inputs (modal de edição) */
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
.ledger-input:focus { border-color: var(--ink); }
.ledger-input:disabled { background: #f1efe9; color: #9a938a; }

.input-invalid { border-color: var(--rule) !important; }

.error-text {
  color: var(--rule);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.ledger-input-group {
  display: flex;
  border: 1px solid var(--paper-line);
  border-radius: 8px;
  overflow: hidden;
  background: var(--paper);
}
.ledger-input-group:focus-within { border-color: var(--ink); }

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

.ledger-label {
  display: block;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ink-soft);
  margin-bottom: 0.3rem;
  font-weight: 600;
}

/* Seções do formulário */
.form-section {
  padding-bottom: 1.25rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px dashed var(--paper-line);
}
.form-section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

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
.cor-chip:hover { border-color: var(--ink); background: var(--paper); }

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

.switch-input:checked + .switch-track { background: var(--ink); }
.switch-input:checked + .switch-track .switch-thumb { transform: translateX(16px); }
.switch-input:focus-visible + .switch-track { box-shadow: 0 0 0 3px rgba(32, 29, 26, 0.2); }

/* Modal */
:deep(.ledger-modal.modal-content) {
  border-radius: 12px;
  border: none;
  box-shadow: 0 20px 40px -8px rgba(32, 29, 26, 0.25);
}
:deep(.ledger-modal .modal-header),
:deep(.ledger-modal .modal-footer) { border-color: var(--paper-line); padding: 1.1rem 1.4rem; }
:deep(.ledger-modal .modal-title) {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: var(--ink);
}
:deep(.ledger-modal .modal-body) { padding: 1.4rem; max-height: 70vh; overflow-y: auto; }

.modal.fade .modal-dialog { transition: transform 0.2s ease-out; }
</style>