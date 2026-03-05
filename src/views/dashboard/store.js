import api from '../../api'

export default {
    state: {
        // Se quiseres guardar os produtos e paginação no state (opcional, mas recomendado para reatividade)
        produtos: [],
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
        errorProdutos: null,
        errorClientes: null,
        clientes: [],
    },
    mutations: {
        SET_PRODUTOS(state, { docs, pagination }) {
            state.produtos = docs
            state.pagination = pagination
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
        }
    },
    actions: {
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
    },
    getters: {
        // Getters úteis (opcional)
        produtosListados: state => state.produtos,
        paginationInfo: state => state.pagination,
        produtosLoading: state => state.loadingProdutos,
        produtosError: state => state.errorProdutos,
        hasMoreProducts: state => state.pagination.hasNextPage,
        clientesListados: state => state.clientes,
        clientesPagination: state => state.pagination,
        clientesLoading: state => state.loading,
        clientesError: state => state.errorClientes
    }
}