<template>
  <div id="app">
    <Auth
        v-if="!user"
        @login="handleLogin"
    />
    <Profile
        v-else-if="editingProfile"
        :user="user"
        @updated="onProfileUpdated"
        @cancel="editingProfile = false"
    />
    <Chat
        v-else
        :user="user"
        @logout="handleLogout"
        @edit-profile="editingProfile = true"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import Auth from './components/Auth.vue'
import Chat from './components/Chat.vue'
import Profile from './components/Profile.vue'

export default {
  name: 'App',
  components: { Auth, Chat, Profile },
  setup() {
    const user = ref(null)
    const editingProfile = ref(false)

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

    const onProfileUpdated = updatedUser => {
      user.value = updatedUser
      localStorage.setItem('user', JSON.stringify(updatedUser))
      editingProfile.value = false
    }

    return { user, editingProfile, handleLogin, handleLogout, onProfileUpdated }
  }
}
</script>
