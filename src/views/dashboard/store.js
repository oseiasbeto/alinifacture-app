import api from '../../api'

export default {
    state: {
        dashboard: null,
        loadingDashboard: false,
        errorDashboard: null,
        // Se quiseres guardar os produtos e paginação no state (opcional, mas recomendado para reatividade)
        produtos: [],
        produto: null, // Para detalhes de um único produto 
        pagination: {
            page: 1,
            limit: 10,
            totalDocs: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false
        },
        loadingProdutos: false,
        loadingClientes: false,
        resumoProdutos: null,
        errorProdutos: null,
        errorClientes: null,
        clientes: [],
        niveisEstoque: [],
        paginationEstoqueNiveis: {},
        niveisEstoqueLoading: false,
        niveisEstoqueError: null,

        resumoEstoque: null,
        resumoEstoqueLoading: false,
        resumoClientes: null,

        movimentosEstoque: [],
        paginationEstoqueMovimentos: {},
        movimentosEstoqueLoading: false,
        movimentosEstoqueError: null,

        pedidos: [],
        paginationPedidos: { page: 1, limit: 10, totalDocs: 0, totalPages: 0, hasNextPage: false, hasPrevPagePedidos: false },
        loadingPedidos: false,
        errorPedidos: null,
        resumoPedidos: null,

        utilizadores: [],
        paginationUtilizadores: { page: 1, limit: 10, totalDocs: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
        loadingUtilizadores: false,
        errorUtilizadores: null,
        resumoUtilizadores: null,
    },
    mutations: {
        SET_DASHBOARD(state, data) { state.dashboard = data },
        SET_LOADING_DASHBOARD(state, v) { state.loadingDashboard = v },
        SET_ERROR_DASHBOARD(state, e) { state.errorDashboard = e },
        SET_PRODUTOS(state, { docs, pagination }) {
            state.produtos = docs
            state.pagination = pagination
        },
        SET_PRODUTO(state, produto) {
            state.produto = produto
        },
        SET_RESUMO_PRODUTOS(state, resumo) {
            state.resumoProdutos = resumo
        },
        SET_LOADING_PRODUTOS(state, loading) {
            state.loadingProdutos = loading
        },
        SET_ERROR_PRODUTOS(state, error) {
            state.errorProdutos = error
        },
        SET_CLIENTES(state, { data, pagination }) {
            state.clientes = data || []
            state.pagination = pagination || {}
        },
        SET_LOADING_CLIENTES(state, loading) {
            state.loadingClientes = loading
        },
        SET_ERROR_CLIENTES(state, error) {
            state.errorClientes = error
        },
        SET_RESUMO_CLIENTES(state, resumo) {
            state.resumoClientes = resumo
        },
        // Mutations para o estoque
        SET_NIVEIS_ESTOQUE_LOADING(state, val) { state.niveisEstoqueLoading = val },
        SET_NIVEIS_ESTOQUE(state, { niveis, pagination }) {
            console.log(pagination)
            state.niveisEstoque = niveis
            state.paginationEstoqueNiveis = pagination
        },
        SET_NIVEIS_ESTOQUE_ERROR(state, err) { state.niveisEstoqueError = err },

        SET_RESUMO_ESTOQUE_LOADING(state, val) { state.resumoEstoqueLoading = val },
        SET_RESUMO_ESTOQUE(state, resumo) { state.resumoEstoque = resumo },

        SET_MOVIMENTOS_ESTOQUE_LOADING(state, val) { state.movimentosEstoqueLoading = val },
        SET_MOVIMENTOS_ESTOQUE(state, { movimentos, pagination }) {
            state.movimentosEstoque = movimentos
            state.paginationEstoqueMovimentos = pagination
        },
        SET_MOVIMENTOS_ESTOQUE_ERROR(state, err) { state.movimentosEstoqueError = err },

        SET_PEDIDOS(state, { docs, pagination }) {
            state.pedidos = docs
            state.paginationPedidos = pagination
        },
        SET_LOADING_PEDIDOS(state, loading) {
            state.loadingPedidos = loading
        },
        SET_ERROR_PEDIDOS(state, error) {
            state.errorPedidos = error
        },
        SET_RESUMO_PEDIDOS(state, resumo) {
            state.resumoPedidos = resumo
        },
        SET_UTILIZADORES(state, { docs, pagination }) {
            state.utilizadores = docs
            state.paginationUtilizadores = pagination
        },
        SET_LOADING_UTILIZADORES(state, v) { state.loadingUtilizadores = v },
        SET_ERROR_UTILIZADORES(state, e) { state.errorUtilizadores = e },
        SET_RESUMO_UTILIZADORES(state, resumo) { state.resumoUtilizadores = resumo },
    },
    actions: {
        async carregarDashboard({ commit }, { dataInicio, dataFim } = {}) {
            commit('SET_LOADING_DASHBOARD', true)
            commit('SET_ERROR_DASHBOARD', null)
            try {
                const res = await api.get('/financeiro/resumo/dashboard', { params: { dataInicio, dataFim } })

                console.log('Dashboard data:', res.data?.dashboard) // Log para debug
                commit('SET_DASHBOARD', res.data?.dashboard)
                return res.data
            } catch (err) {
                commit('SET_ERROR_DASHBOARD', err.response?.data?.message || 'Erro ao carregar dashboard')
                throw err
            } finally {
                commit('SET_LOADING_DASHBOARD', false)
            }
        },
        // Action existente (create)
        async createProduct({ commit }, payload) {
            try {
                // payload esperado: { nome, codigo, descricao, preco, unidade?, tributavel?, ativo? }
                const res = await api.post("/produtos", payload);
                return res.data; // Retorna os dados do produto criado
            } catch (err) {
                console.error('Erro ao registar produto:', err.message);
                throw err; // Propaga erro para o componente
            }
        },

        // Nova action: listar produtos com paginação e filtros
        async listProducts({ commit }, params = {}) {
            commit('SET_LOADING_PRODUTOS', true);
            commit('SET_ERROR_PRODUTOS', null);

            try {
                // Parâmetros comuns: page, limit, busca, ativo, precoMin, precoMax, etc.
                const queryParams = new URLSearchParams();

                if (params.page) queryParams.append('page', params.page);
                if (params.limit) queryParams.append('limit', params.limit);
                if (params.busca) queryParams.append('busca', params.busca);
                if (params.ativo !== undefined) queryParams.append('ativo', params.ativo);
                if (params.precoMin) queryParams.append('precoMin', params.precoMin);
                if (params.precoMax) queryParams.append('precoMax', params.precoMax);

                // Faz a requisição GET com query string
                const res = await api.get(`/produtos?${queryParams.toString()}`);

                // Atualiza o state com os dados paginados
                commit('SET_PRODUTOS', {
                    docs: res.data.data || res.data.docs || [], // ajusta conforme teu backend retorna
                    pagination: {
                        page: res.data.pagination?.page || 1,
                        limit: res.data.pagination?.limit || 10,
                        totalDocs: res.data.pagination?.totalDocs || 0,
                        totalPages: res.data.pagination?.totalPages || 0,
                        hasNextPage: res.data.pagination?.hasNextPage || false,
                        hasPrevPage: res.data.pagination?.hasPrevPage || false
                    }
                });

                return res.data; // Retorna tudo para o componente usar se precisar

            } catch (err) {
                console.error('Erro ao listar produtos:', err.message);
                commit('SET_ERROR_PRODUTOS', err.response?.data?.message || 'Erro ao carregar produtos');
                throw err; // Propaga para componente mostrar alerta
            } finally {
                commit('SET_LOADING_PRODUTOS', false);
            }
        },

        async carregarResumoProdutos({ commit }) {
            try {
                const res = await api.get('/produtos/resumo')
                const resumo = res.data.resumo
                commit('SET_RESUMO_PRODUTOS', resumo)
            } catch (err) {
                console.error('Erro ao carregar resumo de clientes:', err.message)
                throw err
            }
        },

        // NOVA action: buscar um único produto por id (usada na tela de detalhes)
        async getProduct({ commit }, id) {
            try {
                const res = await api.get(`/produtos/${id}`);

                commit('SET_PRODUTO', res.data.produto); // Atualiza o state com o produto buscado 
                return res.data.produto || res.data;
            } catch (err) {
                console.error('Erro ao buscar produto:', err.message);
                throw err;
            }
        },

        async updateProduct({ commit }, { id, payload }) {
            try {
                const res = await api.put(`/produtos/${id}`, payload);
                return res.data;
            } catch (err) {
                console.error('Erro ao atualizar produto:', err.message);
                throw err;
            }
        },

        async deleteProduct({ commit }, id) {
            try {
                const res = await api.delete(`/produtos/${id}`);
                return res.data;
            } catch (err) {
                console.error('Erro ao deletar produto:', err.message);
                throw err;
            }
        },
        async createClient({ commit }, payload) {
            try {
                const res = await api.post('/clientes', payload)
                return res.data
            } catch (err) {
                console.error('Erro ao criar cliente:', err.message)
                throw err
            }
        },

        async listClients({ commit }, params = {}) {
            commit('SET_LOADING_CLIENTES', true)
            commit('SET_ERROR_CLIENTES', null)

            try {
                const queryParams = new URLSearchParams()

                if (params.page) queryParams.append('page', params.page)
                if (params.limit) queryParams.append('limit', params.limit)
                if (params.busca) queryParams.append('busca', params.busca)
                if (params.ativo !== undefined) queryParams.append('ativo', params.ativo)

                const res = await api.get(`/clientes?${queryParams.toString()}`)

                commit('SET_CLIENTES', {
                    data: res.data.data || [],
                    pagination: res.data.pagination || {}
                })

                return res.data
            } catch (err) {
                commit('SET_ERROR_CLIENTES', err.response?.data?.message || 'Erro ao carregar clientes')
                throw err
            } finally {
                commit('SET_LOADING_CLIENTES', false)
            }
        },

        async updateClient({ commit }, { id, payload }) {
            try {
                const res = await api.put(`/clientes/${id}`, payload)
                return res.data
            } catch (err) {
                console.error('Erro ao atualizar cliente:', err.message)
                throw err
            }
        },

        async deleteClient({ commit }, id) {
            try {
                const res = await api.delete(`/clientes/${id}`)
                return res.data
            } catch (err) {
                console.error('Erro ao deletar cliente:', err.message)
                throw err
            }
        },

        async carregarResumoClientes({ commit }) {
            try {
                const res = await api.get('/clientes/resumo')
                const resumo = res.data.resumo
                commit('SET_RESUMO_CLIENTES', resumo)
            } catch (err) {
                console.error('Erro ao carregar resumo de clientes:', err.message)
                throw err
            }
        },

        async listarNiveisEstoque({ commit }, { page = 1, limit = 10, busca, baixoEstoque, produtoId } = {}) {
            commit('SET_NIVEIS_ESTOQUE_LOADING', true)
            commit('SET_NIVEIS_ESTOQUE_ERROR', null)
            try {
                const { data } = await api.get('/estoque/niveis', {
                    params: { page, limit, busca, baixoEstoque, produtoId },
                })

                console.log(data)
                commit('SET_NIVEIS_ESTOQUE', { niveis: data.niveis, pagination: data.pagination })
            } catch (err) {
                commit('SET_NIVEIS_ESTOQUE_ERROR', err.response?.data?.message || 'Erro ao carregar estoque')
                throw err
            } finally {
                commit('SET_NIVEIS_ESTOQUE_LOADING', false)
            }
        },

        async carregarResumoEstoque({ commit }) {
            commit('SET_RESUMO_ESTOQUE_LOADING', true)
            try {
                const { data } = await api.get('/estoque/resumo')
                commit('SET_RESUMO_ESTOQUE', data.resumo)
                return data.resumo
            } finally {
                commit('SET_RESUMO_ESTOQUE_LOADING', false)
            }
        },

        async listarMovimentosEstoque({ commit }, { page = 1, limit = 10, produto, dataInicio, dataFim } = {}) {
            commit('SET_MOVIMENTOS_ESTOQUE_LOADING', true)
            commit('SET_MOVIMENTOS_ESTOQUE_ERROR', null)
            try {
                const { data } = await api.get('/estoque/movimentos', {
                    params: { page, limit, produto, dataInicio, dataFim }
                })
                commit('SET_MOVIMENTOS_ESTOQUE', { movimentos: data.movimentos, pagination: data.pagination })
            } catch (err) {
                commit('SET_MOVIMENTOS_ESTOQUE_ERROR', err.response?.data?.message || 'Erro ao carregar movimentos')
                throw err
            } finally {
                commit('SET_MOVIMENTOS_ESTOQUE_LOADING', false)
            }
        },

        async registrarEntradaEstoque(_, payload) {
            const { data } = await api.post('/estoque/entrada', payload)
            return data
        },

        async registrarSaidaEstoque(_, payload) {
            const { data } = await api.post('/estoque/saida', payload)
            return data
        },

        async ajustarEstoque(_, payload) {
            const { data } = await api.post('/estoque/ajuste', payload)
            return data
        },

        async listarPedidos({ commit }, params = {}) {
            commit('SET_LOADING_PEDIDOS', true)
            commit('SET_ERROR_PEDIDOS', null)
            try {
                const queryParams = new URLSearchParams()
                if (params.page) queryParams.append('page', params.page)
                if (params.limit) queryParams.append('limit', params.limit)
                if (params.status) queryParams.append('status', params.status)
                if (params.busca) queryParams.append('busca', params.busca)

                const res = await api.get(`/pedidos?${queryParams.toString()}`)

                commit('SET_PEDIDOS', {
                    docs: res.data.pedidos || [],
                    pagination: res.data.pagination || {},
                })

                return res.data
            } catch (err) {
                console.error('Erro ao listar pedidos:', err.message)
                commit('SET_ERROR_PEDIDOS', err.response?.data?.message || 'Erro ao carregar pedidos')
                throw err
            } finally {
                commit('SET_LOADING_PEDIDOS', false)
            }
        },

        async carregarResumoPedidos({ commit }) {
            try {
                const res = await api.get('/pedidos/resumo')
                commit('SET_RESUMO_PEDIDOS', res.data.resumo)
                return res.data.resumo
            } catch (err) {
                console.error('Erro ao carregar resumo de pedidos:', err.message)
                throw err
            }
        },

        async getPedido({ commit }, id) {
            try {
                const res = await api.get(`/pedidos/${id}`)
                return res.data.pedido
            } catch (err) {
                console.error('Erro ao buscar pedido:', err.message)
                throw err
            }
        },

        async criarPedido({ commit }, payload) {
            try {
                const res = await api.post('/pedidos', payload)
                return res.data.pedido
            } catch (err) {
                console.error('Erro ao criar pedido:', err.message)
                throw err
            }
        },

        async atualizarPedido({ commit }, { id, payload }) {
            try {
                console.log(payload)
                const res = await api.put(`/pedidos/${id}`, payload)
                return res.data.pedido
            } catch (err) {
                console.error('Erro ao atualizar pedido:', err.message)
                throw err
            }
        },

        async atualizarStatusPedido({ commit }, { id, status, observacao }) {
            try {
                const res = await api.patch(`/pedidos/${id}/status`, { status, observacao })
                return res.data.pedido
            } catch (err) {
                console.error('Erro ao atualizar status do pedido:', err.message)
                throw err
            }
        },

        async excluirPedido({ commit }, id) {
            try {
                const res = await api.delete(`/pedidos/${id}`)
                return res.data
            } catch (err) {
                console.error('Erro ao excluir pedido:', err.message)
                throw err
            }
        },
        async listarUtilizadores({ commit }, params = {}) {
            commit('SET_LOADING_UTILIZADORES', true)
            commit('SET_ERROR_UTILIZADORES', null)
            try {
                const res = await api.get('/utilizadores', { params })
                commit('SET_UTILIZADORES', { docs: res.data.utilizadores || [], pagination: res.data.pagination || {} })
            } catch (err) {
                commit('SET_ERROR_UTILIZADORES', err.response?.data?.message || 'Erro ao carregar utilizadores')
                throw err
            } finally {
                commit('SET_LOADING_UTILIZADORES', false)
            }
        },

        async getUtilizador(_, id) {
            const res = await api.get(`/utilizadores/${id}`)
            return res.data.utilizador
        },

        // Retorna { utilizador, senhaGerada } — a senha só vem preenchida nesta resposta.
        async criarUtilizador(_, payload) {
            const res = await api.post('/utilizadores', payload)
            return res.data
        },

        async atualizarUtilizador(_, { id, payload }) {
            const res = await api.put(`/utilizadores/${id}`, payload)
            return res.data.utilizador
        },

        // Retorna { senhaGerada }
        async redefinirSenhaUtilizador(_, id) {
            const res = await api.patch(`/utilizadores/${id}/redefinir-senha`)
            return res.data
        },

        async eliminarUtilizador(_, id) {
            const res = await api.delete(`/utilizadores/${id}`)
            return res.data
        },

        async carregarResumoUtilizadores({ commit }) {
            const res = await api.get('/utilizadores/resumo')
            commit('SET_RESUMO_UTILIZADORES', res.data.resumo)
            return res.data.resumo
        },
    },
    getters: {
        // Getters úteis (opcional)
        dashboard: (state) => state.dashboard,
        loadingDashboard: (state) => state.loadingDashboard,
        errorDashboard: (state) => state.errorDashboard,
        produtosListados: state => state.produtos,
        produtoDetalhado: state => state.produto,
        paginationInfo: state => state.pagination,
        produtosLoading: state => state.loadingProdutos,
        produtosError: state => state.errorProdutos,
        resumoProdutos: state => state.resumoProdutos,
        hasMoreProducts: state => state.pagination.hasNextPage,
        clientesListados: state => state.clientes,
        clientesPagination: state => state.pagination,
        resumoClientes: state => state.resumoClientes,
        clientesLoading: state => state.loading,
        clientesError: state => state.errorClientes,

        // Getters para o estoque
        niveisEstoque: (state) => state.niveisEstoque,
        paginationNiveis: (state) => state.paginationEstoqueNiveis,
        niveisLoading: (state) => state.niveisEstoqueLoading,
        niveisError: (state) => state.niveisEstoqueError,

        resumoEstoque: (state) => state.resumoEstoque,
        resumoEstoqueLoading: (state) => state.resumoEstoqueLoading,

        movimentosEstoque: (state) => state.movimentosEstoque,
        paginationMovimentos: (state) => state.paginationEstoqueMovimentos,
        movimentosLoading: (state) => state.movimentosEstoqueLoading,
        movimentosError: (state) => state.movimentosEstoqueError,

        pedidosListados: (state) => state.pedidos,
        pedidosPagination: (state) => state.pagination,
        pedidosLoading: (state) => state.loadingPedidos,
        pedidosError: (state) => state.errorPedidos,
        resumoPedidos: (state) => state.resumoPedidos,

        utilizadoresListados: (state) => state.utilizadores,
        utilizadoresPagination: (state) => state.pagination,
        utilizadoresLoading: (state) => state.loadingUtilizadores,
        utilizadoresError: (state) => state.errorUtilizadores,
        resumoUtilizadores: (state) => state.resumoUtilizadores
    }
}