import api from '../../api'

import clearSessionIdFromCookies from "@/utils/clearSessionIdFromCookies"; // Remove o session_id dos cookies.
import setSessionIdFromCookies from "@/utils/setSessionIdFromCookies"; // Armazena o session_id nos cookies.

export default {
    state: {
        user: null,
        token: null,
        sessionId: null
    },
    mutations: {
        SET_AUTH(state, { user, accessToken, sessionId }) {
            state.user = user
            state.token = accessToken
            state.sessionId = sessionId

            setSessionIdFromCookies(sessionId);
        },
        LOGOUT(state) {
            state.token = null
            state.sessionId = null

            clearSessionIdFromCookies()
        },
        UPDATE_USER(state, payload) {
            state.user = payload
        }
    },
    actions: {
        async register({ commit }, payload) {
            try {
                // payload esperado: { nomeProprio, apelido, email, palavraPasse, telefone?, cargo?, empresa? }
                const res = await api.post("/utilizadores/registro", payload);

                const { utilizador, accessToken, sessaoId } = res.data;

                // Após registo bem-sucedido, faz login automático (commit da auth)
                commit('SET_AUTH', {
                    user: utilizador,
                    accessToken: accessToken,
                    sessionId: sessaoId
                });

                console.log('Registo e login automático realizados com sucesso');

                return res;
            } catch (err) {
                // Tratamento de erros comuns do backend
                if (err.response) {
                    const { status, data } = err.response;

                    if (status === 409) {
                        console.warn('Email já registado:', data.message);
                        throw new Error(data.message || 'Este email já está registado.');
                    }

                    if (status === 400) {
                        console.warn('Erro de validação no registo:', data.message);
                        throw new Error(data.message || 'Verifique os dados inseridos.');
                    }
                }

                console.error('Erro ao registar utilizador:', err.message);
                throw err; // Propaga para o componente mostrar alerta genérico
            }
        },
        async login({ commit }, { email, password }) {
            try {
                const res = await api.post("/utilizadores/login", { email, palavraPasse: password });
                const { utilizador: user, accessToken, sessaoId } = res.data;

                commit('SET_AUTH', { user, accessToken, sessionId: sessaoId })
                return res
            } catch (err) {
                console.error('Erro ao fazer login:', err.message);
                throw err  // Propaga o erro para que o componente possa lidarhar adequadamente (exibir mensagem de erro, etc).
            }
        },
        async refreshToken({ commit }, sessionId) {
            try {
                const res = await api.post("/utilizadores/refresh-token", {
                    session_id: sessionId,
                });

                const user = res.data.utilizador;
                const accessToken = res.data.access_token;

                commit('SET_AUTH', {
                    user,
                    accessToken: accessToken,
                    sessionId: sessionId
                })
                return res
            } catch (err) {
                if (err.response?.status === 401) {
                    clearSessionIdFromCookies();
                }
                console.error(err.message);
                throw err;
            }
        },
        async logout({ commit }, sessionId) {
            try {
                const res = await api.post("/utilizadores/logout", {
                    session_id: sessionId,
                })
                
                commit('LOGOUT')
                return res
            } catch (err) {
                if (err.response?.status === 401) {
                    clearSessionIdFromCookies();
                }
                console.error(err.message);
                throw err;
            }
        }
    },
    getters: {
        accessToken: (state) => state.token,
        currentUser: (state) => state.user,
        isAuthenticated: (state) => !!state.token && !!state.user
    }
}