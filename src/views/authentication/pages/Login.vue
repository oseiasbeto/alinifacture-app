<template>
  <div class="ledger-scope min-vh-100 d-flex align-items-center justify-content-center login-bg py-5">
    <div class="login-card">

      <div class="text-center mb-5">
        <img src="../../../assets/logo.png" alt="Gráfica do Leste Logo" class="img-fluid mb-4 mx-auto login-logo">
        <p class="eyebrow">Gráfica do Leste</p>
        <h3 class="ledger-title">Acesso ao Sistema</h3>
        <p class="text-sm text-stone-500 mt-2 mb-0">
          Gerencie pedidos, produção e faturação da Gráfica do Leste
        </p>
      </div>

      <!-- Formulário com validação em tempo real -->
      <form class="needs-validation" novalidate @submit.prevent="handleSubmit">
        <!-- Email -->
        <div class="mb-3">
          <label for="loginEmail" class="ledger-label">Email</label>
          <input v-model.trim="email" type="email" id="loginEmail" class="ledger-input" placeholder="nome@exemplo.ao"
            :class="{
              'input-valid': emailTouched && emailValid,
              'input-invalid': emailTouched && !emailValid
            }" @input="emailTouched = true" required>
          <div v-if="emailTouched && !emailValid" class="field-feedback">
            Email inválido
          </div>
        </div>

        <!-- Senha -->
        <div class="mb-4">
          <label for="loginPassword" class="ledger-label">Senha</label>
          <input v-model="password" type="password" id="loginPassword" class="ledger-input" placeholder="Senha" :class="{
            'input-valid': passwordTouched && passwordValid,
            'input-invalid': passwordTouched && !passwordValid
          }" @input="passwordTouched = true" required minlength="6">
          <div v-if="passwordTouched && !passwordValid" class="field-feedback">
            Mínimo 6 caracteres
          </div>
        </div>

        <!-- Lembrar-me + Esqueci senha -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="rememberMe" />
            <label class="form-check-label small text-stone-500" for="rememberMe">
              Lembrar-me
            </label>
          </div>
          <a href="#" class="small text-decoration-none link-rule">
            Esqueci a senha
          </a>
        </div>

        <!-- Botão Entrar -->
        <button type="submit" class="btn-primary w-100 py-2" :disabled="isLoading || !formIsValid">
          <span v-if="isLoading" class="spinner-sm me-2"></span>
          {{ isLoading ? 'A entrar...' : 'Entrar' }}
        </button>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { toast } from "vue3-toastify"

const store = useStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const emailTouched = ref(false)
const passwordTouched = ref(false)

const emailValid = computed(() => {
  if (!email.value.trim()) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
})

const passwordValid = computed(() => password.value.length >= 6)

const formIsValid = computed(() => emailValid.value && passwordValid.value)

const handleSubmit = async () => {
  emailTouched.value = true
  passwordTouched.value = true

  if (!formIsValid.value) {
    return
  }

  isLoading.value = true

  try {
    await store.dispatch('login', {
      email: email.value.trim(),
      password: password.value
    })

    router.push('/dashboard')
  } catch (error) {
    toast(error?.response?.data?.message || 'Erro ao entrar. Verifica as credenciais.', {
      theme: "colored",
      position: "top-right",
      autoClose: 2500,
      type: 'error'
    })
  } finally {
    isLoading.value = false
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

.login-bg {
  background: var(--paper);
}

.login-card {
  background: #fff;
  border: 1px solid var(--paper-line);
  border-radius: 12px;
  max-width: 420px;
  width: 100%;
  padding: 2.5rem 2.25rem;
  position: relative;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--rule);
  border-radius: 12px 12px 0 0;
}

.login-logo {
  max-height: 70px;
}

.eyebrow {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--rule);
  margin: 0 0 0.25rem;
}

.ledger-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.6rem;
  color: var(--ink);
  margin: 0;
}

.text-stone-500 {
  color: #78716c;
}

.ledger-label {
  display: block;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ink-soft);
  margin-bottom: 0.3rem;
}

.ledger-input {
  width: 100%;
  border: 1px solid var(--paper-line);
  background: var(--paper);
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  font-size: 0.9rem;
  color: var(--ink);
  outline: none;
  transition: border-color 0.15s;
}

.ledger-input:focus {
  border-color: var(--ink);
}

.input-valid {
  border-color: var(--ok);
}

.input-invalid {
  border-color: var(--rule);
}

.field-feedback {
  margin-top: 0.3rem;
  font-size: 0.78rem;
  color: var(--rule);
}

.link-rule {
  color: var(--rule);
  font-weight: 500;
}

.btn-primary {
  background: var(--ink);
  color: #fff;
  border-radius: 8px;
  padding: 0.65rem 1.1rem;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary:disabled {
  opacity: 0.6;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>