<template>
  <div class="auth">
    <h2>{{ isLogin ? 'Увійти' : 'Реєстрація' }}</h2>
    <form @submit.prevent="handle">
      <input v-model="displayName" v-if="!isLogin" type="text" placeholder="Ім’я" required />
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Пароль" required />
      <input
          v-if="!isLogin"
          v-model="confirmPassword"
          type="password"
          placeholder="Підтвердіть пароль"
          required
      />
      <input
          v-if="!isLogin"
          type="file"
          accept="image/*"
          @change="onFileChange"
      />
      <button type="submit">{{ isLogin ? 'Увійти' : 'Зареєструватися' }}</button>
    </form>
    <p @click="isLogin = !isLogin" class="toggle">
      {{ isLogin ? 'Немає акаунту? Зареєструватися' : 'Вже є акаунт? Увійти' }}
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
      avatarFile: null,
      error: ''
    }
  },
  methods: {
    onFileChange(e) {
      this.avatarFile = e.target.files[0]
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
                this.displayName,
                this.avatarFile
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
/* твої стилі */
</style>
