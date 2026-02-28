<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
    <div class="card border rounded-3" style="max-width: 420px; width: 100%;">
      <div class="card-body p-4 p-md-5">

        <!-- Logo e título -->
        <div class="text-center mb-5">
          <img src="../../../assets/palheta.png" alt="Alinifacture Logo" class="img-fluid mb-4 mx-auto"
            style="max-height: 80px;">
          <h3 class="fw-bold mb-2">Entrar na tua conta</h3>
          <p class="text-muted small mb-0">
            Gerencie as tuas facturas e pagamentos
          </p>
        </div>

        <!-- Formulário com validação em tempo real -->
        <form class="needs-validation" novalidate @submit.prevent="handleSubmit">
          <!-- Email - Floating label -->
          <div class="form-floating mb-3">
            <input v-model.trim="email" type="email" class="form-control" id="floatingEmail"
              placeholder="nome@exemplo.ao" :class="{
                'is-valid': emailTouched && emailValid,
                'is-invalid': emailTouched && !emailValid
              }" @input="emailTouched = true" required>
            <label for="floatingEmail">Email</label>
            <div v-if="emailTouched && !emailValid" class="invalid-feedback">
              Email inválido
            </div>
          </div>

          <!-- Senha - Floating label -->
          <div class="form-floating mb-4">
            <input v-model="password" type="password" class="form-control" id="floatingPassword" placeholder="Senha"
              :class="{
                'is-valid': passwordTouched && passwordValid,
                'is-invalid': passwordTouched && !passwordValid
              }" @input="passwordTouched = true" required minlength="6">
            <label for="floatingPassword">Senha</label>
            <div v-if="passwordTouched && !passwordValid" class="invalid-feedback">
              Mínimo 6 caracteres
            </div>
          </div>

          <!-- Lembrar-me + Esqueci senha -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="rememberMe" />
              <label class="form-check-label small" for="rememberMe">
                Lembrar-me
              </label>
            </div>
            <a href="#" class="small text-decoration-none text-primary">
              Esqueci a senha
            </a>
          </div>

          <!-- Botão Entrar -->
          <button type="submit" class="btn btn-primary w-100 py-2 fw-medium" :disabled="isLoading || !formIsValid">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"
              aria-hidden="true"></span>
            {{ isLoading ? 'A entrar...' : 'Entrar' }}
          </button>
        </form>

        <!-- Link para criar conta -->
        <div class="text-center mt-4 small text-muted">
          Ainda não tens conta?
          <a href="/auth/registro" class="text-primary text-decoration-none fw-medium">
            Criar conta gratuita
          </a>
        </div>

      </div>
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

// Flags para ativar validação só depois da primeira interação
const emailTouched = ref(false)
const passwordTouched = ref(false)

// Validações em tempo real
const emailValid = computed(() => {
  if (!email.value.trim()) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
})

const passwordValid = computed(() => password.value.length >= 6)

const formIsValid = computed(() => emailValid.value && passwordValid.value)

const handleSubmit = async () => {
  // Marca todos como tocados para mostrar possíveis erros restantes
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
.form-control.is-valid {
  border-color: #198754;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23198754' d='M2.3 6.73.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

.form-control.is-invalid {
  border-color: #dc3545;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}
</style>