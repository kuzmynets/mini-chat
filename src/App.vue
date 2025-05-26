<template>
  <div id="app">
    <Auth v-if="!user" @login="handleLogin" />
    <Chat v-else :user="user" @logout="handleLogout" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import Auth from './components/Auth.vue'
import Chat from './components/Chat.vue'

export default {
  name: 'App',
  components: { Auth, Chat },
  setup() {
    const user = ref(null)

    onMounted(() => {
      const saved = localStorage.getItem('user')
      if (saved) user.value = JSON.parse(saved)
    })

    const handleLogin = u => {
      user.value = u
      localStorage.setItem('user', JSON.stringify(u))
    }

    const handleLogout = () => {
      user.value = null
      localStorage.removeItem('user')
    }

    return { user, handleLogin, handleLogout }
  }
}
</script>