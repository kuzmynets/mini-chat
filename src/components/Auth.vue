<template>
  <div class="auth">
    <h2>{{ isLogin ? 'Увійти' : 'Реєстрація' }}</h2>
    <form @submit.prevent="handle">
      <input
          v-if="!isLogin"
          v-model="displayName"
          type="text"
          placeholder="Ім’я"
          required
      />
      <input
          v-model="email"
          type="email"
          placeholder="Email"
          required
      />
      <input
          v-model="password"
          type="password"
          placeholder="Пароль"
          required
      />
      <input
          v-if="!isLogin"
          v-model="confirmPassword"
          type="password"
          placeholder="Підтвердіть пароль"
          required
      />
      <button type="submit">
        {{ isLogin ? 'Увійти' : 'Зареєструватися' }}
      </button>
    </form>
    <p @click="toggleMode" class="toggle">
      {{ isLogin
        ? 'Немає акаунту? Зареєструватися'
        : 'Вже є акаунт? Увійти' }}
    </p>
    <p v-if="error" class="error">{{ error }}</p>
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
.auth {
  max-width: 320px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
}
input {
  width: 100%;
  margin: 8px 0;
  padding: 8px;
  box-sizing: border-box;
}
button {
  width: 100%;
  padding: 8px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.toggle {
  margin-top: 12px;
  color: #42b983;
  cursor: pointer;
}
.error {
  margin-top: 8px;
  color: #e74c3c;
}
</style>