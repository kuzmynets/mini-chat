<template>
  <div class="container d-flex justify-content-center align-items-center vh-100 bg-light">
    <div class="card p-4" style="max-width: 400px; width: 100%;">
      <h2 class="card-title text-center mb-4">
        {{ isLogin ? 'Увійти' : 'Реєстрація' }}
      </h2>

      <form @submit.prevent="handle">
        <div v-if="!isLogin" class="mb-3">
          <label for="displayName" class="form-label">Ім’я</label>
          <input
              id="displayName"
              v-model="displayName"
              type="text"
              class="form-control"
              placeholder="Ваше ім’я"
              required
          />
        </div>

        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input
              id="email"
              v-model="email"
              type="email"
              class="form-control"
              placeholder="you@example.com"
              required
          />
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">Пароль</label>
          <input
              id="password"
              v-model="password"
              type="password"
              class="form-control"
              placeholder="••••••••"
              required
          />
        </div>

        <div v-if="!isLogin" class="mb-3">
          <label for="confirmPassword" class="form-label">Підтвердіть пароль</label>
          <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              class="form-control"
              placeholder="••••••••"
              required
          />
        </div>

        <button type="submit" class="btn btn-primary w-100">
          {{ isLogin ? 'Увійти' : 'Зареєструватися' }}
        </button>
      </form>

      <div class="d-flex justify-content-center align-items-center mt-3">
        <span class="me-2 text-secondary">
          {{ isLogin ? 'Немає акаунту?' : 'Вже є акаунт?' }}
        </span>
        <button @click="toggleMode" class="btn btn-link p-0">
          {{ isLogin ? 'Зареєструватися' : 'Увійти' }}
        </button>
      </div>

      <div v-if="error" class="alert alert-danger text-center mt-3">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { manualSignUp, manualLogin } from '../firebase'

export default {
  name: 'Auth',
  data() {
    return {
      isLogin: true,
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      error: ''
    }
  },
  methods: {
    toggleMode() {
      this.isLogin = !this.isLogin
      this.error = ''
    },
    async handle() {
      this.error = ''
      try {
        if (!this.isLogin && this.password !== this.confirmPassword) {
          throw new Error('Паролі не співпадають')
        }
        const user = this.isLogin
            ? await manualLogin(this.email, this.password)
            : await manualSignUp(this.email, this.password, this.displayName)
        this.$emit('login', user)
      } catch (e) {
        this.error = e.message
      }
    }
  }
}
</script>

<style scoped>
</style>