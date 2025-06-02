<template>
  <div class="container-fluid p-0 vh-100 d-flex flex-column">
    <!-- 1. Вхід/реєстрація -->
    <Auth
        v-if="!user"
        @login="handleLogin"
        class="flex-fill"
    />

    <!-- 2. Редагування профілю -->
    <Profile
        v-else-if="editingProfile"
        :user="user"
        @updated="onProfileUpdated"
        @cancel="editingProfile = false"
        class="flex-fill"
    />

    <!-- 3. Список бесід -->
    <ConversationsList
        v-else-if="!activeConversation && !creatingNew && !editingProfile"
        :userId="user.id"
        :user="user"
        @select="openConversation"
        @new="startNewConversation"
        @edit-profile="editingProfile = true"
        @logout="handleLogout"
        class="flex-fill"
    />

    <!-- 4. Форма створення бесіди -->
    <NewConversation
        v-else-if="creatingNew"
        :userId="user.id"
        @created="openConversation"
        @cancel="creatingNew = false"
        class="flex-fill"
    />

    <!-- 5. Відкритий чат -->
    <Chat
        v-else
        :user="user"
        :conversationId="activeConversation.id"
        :conversationName="activeConversation.name"
        @back="activeConversation = null"
        @logout="handleLogout"
        @edit-profile="editingProfile = true"
        class="flex-fill d-flex flex-column"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import Auth from './components/Auth.vue'
import ConversationsList from './components/ConversationsList.vue'
import NewConversation from './components/NewConversation.vue'
import Chat from './components/Chat.vue'
import Profile from './components/Profile.vue'

export default {
  name: 'App',
  components: {
    Auth,
    ConversationsList,
    NewConversation,
    Chat,
    Profile
  },
  setup() {
    const user = ref(null)
    const activeConversation = ref(null)
    const creatingNew = ref(false)
    const editingProfile = ref(false)

    onMounted(() => {
      const saved = localStorage.getItem('user')
      if (saved) user.value = JSON.parse(saved)
    })

    function handleLogin(u) {
      user.value = u
      localStorage.setItem('user', JSON.stringify(u))
    }

    function handleLogout() {
      user.value = null
      localStorage.removeItem('user')
      activeConversation.value = null
      creatingNew.value = false
      editingProfile.value = false
    }

    function openConversation(conv) {
      activeConversation.value = conv
      creatingNew.value = false
      editingProfile.value = false
    }

    function startNewConversation() {
      creatingNew.value = true
      activeConversation.value = null
      editingProfile.value = false
    }

    function onProfileUpdated(updatedUser) {
      user.value = updatedUser
      localStorage.setItem('user', JSON.stringify(updatedUser))
      editingProfile.value = false
    }

    return {
      user,
      activeConversation,
      creatingNew,
      editingProfile,
      handleLogin,
      handleLogout,
      openConversation,
      startNewConversation,
      onProfileUpdated
    }
  }
}
</script>

<style scoped>
</style>
