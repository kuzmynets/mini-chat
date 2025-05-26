<!-- src/components/Auth.vue -->
<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">{{ isLogin ? 'Увійти' : 'Реєстрація' }}</h2>
      <form @submit.prevent="handle" class="auth-form">
        <div class="form-group" v-if="!isLogin">
          <label for="displayName" class="form-label">Ім’я</label>
          <input
              id="displayName"
              v-model="displayName"
              type="text"
              class="form-input"
              placeholder="Ваше ім’я"
              required
          />
        </div>

        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              placeholder="you@example.com"
              required
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Пароль</label>
          <input
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              placeholder="••••••••"
              required
          />
        </div>

        <div class="form-group" v-if="!isLogin">
          <label for="confirmPassword" class="form-label">Підтвердіть пароль</label>
          <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              class="form-input"
              placeholder="••••••••"
              required
          />
        </div>

        <button type="submit" class="btn-primary">
          {{ isLogin ? 'Увійти' : 'Зареєструватися' }}
        </button>
      </form>

      <p class="auth-toggle">
        <span class="highlight">{{ isLogin ? 'Немає акаунту?' : 'Вже є акаунт?' }}</span>
        <button @click="toggleMode" class="toggle-link">
          {{ isLogin ? 'Зареєструватися' : 'Увійти' }}
        </button>
      </p>

      <p v-if="error" class="auth-error">{{ error }}</p>
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
            : await manualSignUp(
                this.email,
                this.password,
                this.displayName
            )
        this.$emit('login', user)
      } catch (e) {
        this.error = e.message
      }
    }
  }
}
</script>

<style scoped>

.highlight {
  color: #000000;
  font-weight: bold;
}

.auth-container {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f0f2f5;
}
.auth-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}
.auth-title {
  text-align: center;
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.5rem;
}
.auth-form {
  display: flex;
  flex-direction: column;
}
.form-group {
  margin-bottom: 1rem;
}
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-size: 0.9rem;
}
.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}
.btn-primary {
  background: #42b983;
  color: #fff;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}
.btn-primary:hover {
  background: #369a6e;
}
.auth-toggle {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.9rem;
}
.toggle-link {
  background: none;
  border: none;
  color: #42b983;
  margin-left: 0.5rem;
  cursor: pointer;
}
.auth-error {
  margin-top: 1rem;
  color: #e74c3c;
  text-align: center;
}
</style>