<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
    <div class="card border rounded-3" style="max-width: 480px; width: 100%;">
      <div class="card-body p-4 p-md-5">

        <!-- Logo e título -->
        <div class="text-center mb-5">
          <img src="../../../assets/palheta.png" alt="Alinifacture Logo" class="img-fluid mb-4 mx-auto"
            style="max-height: 80px;">
          <h3 class="fw-bold mb-2">Criar conta Alinifacture</h3>
          <p class="text-muted small mb-0">
            Comece a gerir facturas e pagamentos hoje mesmo
          </p>
        </div>

        <!-- Formulário de cadastro com validação em tempo real -->
        <form class="needs-validation" novalidate @submit.prevent="handleSubmit">
          <!-- Nome da Empresa -->
          <div class="form-floating mb-3">
            <input v-model.trim="empresa" type="text" class="form-control" id="floatingEmpresa" autocomplete="off"
              placeholder="Nome da Empresa" :class="{
                'is-valid': empresaTouched && empresaValid,
                'is-invalid': empresaTouched && !empresaValid
              }" @input="empresaTouched = true" required minlength="3">
            <label for="floatingEmpresa">Nome da Empresa</label>
            <div v-if="empresaTouched && !empresaValid" class="invalid-feedback">
              Pelo menos 3 caracteres
            </div>
          </div>

          <!-- Nome do Utilizador -->
          <div class="form-floating mb-3">
            <input v-model.trim="nome" type="text" class="form-control" id="floatingNome" autocomplete="off"
              placeholder="Nome completo" :class="{
                'is-valid': nomeTouched && nomeValid,
                'is-invalid': nomeTouched && !nomeValid
              }" @input="nomeTouched = true" required minlength="3">
            <label for="floatingNome">Nome do Utilizador</label>
            <div v-if="nomeTouched && !nomeValid" class="invalid-feedback">
              Pelo menos 3 caracteres
            </div>
          </div>

          <!-- Email -->
          <div class="form-floating mb-3">
            <input v-model.trim="email" type="email" class="form-control" id="floatingEmail" autocomplete="off"
              placeholder="nome@exemplo.ao" :class="{
                'is-valid': emailTouched && emailValid,
                'is-invalid': emailTouched && !emailValid
              }" @input="emailTouched = true" required>
            <label for="floatingEmail">Email</label>
            <div v-if="emailTouched && !emailValid" class="invalid-feedback">
              Email inválido
            </div>
          </div>

          <!-- Palavra-passe -->
          <div class="form-floating mb-3">
            <input v-model="password" type="password" class="form-control" id="floatingPassword"
              autocomplete="new-password" placeholder="Palavra-passe" :class="{
                'is-valid': passwordTouched && passwordValid,
                'is-invalid': passwordTouched && !passwordValid
              }" @input="passwordTouched = true" required minlength="6">
            <label for="floatingPassword">Palavra-passe</label>
            <div v-if="passwordTouched && !passwordValid" class="invalid-feedback">
              Mínimo 6 caracteres
            </div>
          </div>

          <!-- Confirmar Palavra-passe -->
          <div class="form-floating mb-4">
            <input v-model="confirmPassword" type="password" autocomplete="new-password" class="form-control"
              id="floatingConfirmPassword" placeholder="Confirme a palavra-passe" :class="{
                'is-valid': confirmTouched && confirmPasswordValid,
                'is-invalid': confirmTouched && !confirmPasswordValid
              }" @input="confirmTouched = true" required>
            <label for="floatingConfirmPassword">Confirmar Palavra-passe</label>
            <div v-if="confirmTouched && !confirmPasswordValid" class="invalid-feedback">
              As palavras-passe não coincidem
            </div>
          </div>

          <!-- Termos e Condições -->
          <div class="form-check mb-4">
            <input class="form-check-input" type="checkbox" id="termos" v-model="aceitaTermos"
              :class="{ 'is-invalid': termosTouched && !aceitaTermos }" @change="termosTouched = true" required>
            <label class="form-check-label select-none small" for="termos">
              Eu concordo com os
              <a href="#" class="text-primary text-decoration-none">Termos de Uso</a> e
              <a href="#" class="text-primary text-decoration-none">Política de Privacidade</a>
            </label>
            <div v-if="termosTouched && !aceitaTermos" class="invalid-feedback d-block">
              Deve aceitar os termos
            </div>
          </div>

          <!-- Botão Criar Conta -->
          <button type="submit" class="btn btn-primary w-100 py-2 fw-medium" :disabled="isLoading || !formIsValid">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"
              aria-hidden="true"></span>
            {{ isLoading ? 'A criar conta...' : 'Criar conta gratuita' }}
          </button>
        </form>

        <!-- Link para login -->
        <div class="text-center mt-4 select-none small text-muted">
          Já tens conta?
          <a href="/auth/login" class="text-primary text-decoration-none fw-medium">
            Entrar
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

// Campos do formulário (não persistem — voltam ao vazio ao recarregar a página)
const empresa = ref('')
const nome = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const aceitaTermos = ref(false)

// Flags para mostrar validação só depois do utilizador interagir com o campo
const empresaTouched = ref(false)
const nomeTouched = ref(false)
const emailTouched = ref(false)
const passwordTouched = ref(false)
const confirmTouched = ref(false)
const termosTouched = ref(false)

const isLoading = ref(false)

// Validações em tempo real
const empresaValid = computed(() => empresa.value.trim().length >= 3)
const nomeValid = computed(() => nome.value.trim().length >= 3)
const emailValid = computed(() => {
  if (!email.value.trim()) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
})
const passwordValid = computed(() => password.value.length >= 6)
const confirmPasswordValid = computed(() => {
  return password.value && password.value === confirmPassword.value
})

const formIsValid = computed(() => {
  return (
    empresaValid.value &&
    nomeValid.value &&
    emailValid.value &&
    passwordValid.value &&
    confirmPasswordValid.value &&
    aceitaTermos.value
  )
})

const resetForm = () => {
  empresa.value = ''
  nome.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  aceitaTermos.value = false

  empresaTouched.value = false
  nomeTouched.value = false
  emailTouched.value = false
  passwordTouched.value = false
  confirmTouched.value = false
  termosTouched.value = false
}

const handleSubmit = async () => {
  // Marca todos os campos como "tocados" para mostrar erros se houver
  empresaTouched.value = true
  nomeTouched.value = true
  emailTouched.value = true
  passwordTouched.value = true
  confirmTouched.value = true
  termosTouched.value = true

  if (!formIsValid.value) {
    return
  }

  isLoading.value = true

  try {
    await store.dispatch('register', {
      nomeEmpresa: empresa.value.trim(),
      nomeProprio: nome.value.trim(),
      email: email.value.trim(),
      palavraPasse: password.value.trim()
    })

    toast('Conta criada com sucesso! Bem-vindo à Alinifacture.', {
      theme: "colored",
      position: "top-right",
      autoClose: 2500,
      type: 'success'
    })

    setTimeout(() => {
       router.push('/dashboard')
    }, 2500)
  } catch (error) {
    resetForm()
    toast(error?.response?.data?.message || 'Erro ao criar conta.', {
      theme: "colored",
      position: "top-right",
      autoClose: 2500,
      type: 'error'
    })
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