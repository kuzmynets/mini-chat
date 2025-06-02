<template>
  <div class="container-fluid p-0 vh-100 d-flex flex-column">
    <!-- Header -->
    <header class="d-flex justify-content-between align-items-center bg-white border-bottom px-3 py-2">
      <div class="d-flex align-items-center">
        <button @click="$emit('back')" class="btn btn-link p-0 me-2">←</button>
        <h2 class="h5 mb-0">{{ conversationName }}</h2>
      </div>
      <div>
        <button @click="$emit('edit-profile')" class="btn btn-outline-secondary btn-sm me-2">
          Профіль
        </button>
        <button @click="$emit('logout')" class="btn btn-outline-danger btn-sm">
          Вийти
        </button>
      </div>
    </header>

    <!-- Messages -->
    <div ref="msgContainer" class="flex-grow-1 overflow-auto p-3">
      <div v-if="messages.length === 0" class="text-center text-muted">
        Тут ще немає повідомлень…
      </div>
      <div
          v-for="msg in messages"
          :key="msg.id"
          :class="[
          'd-flex mb-3',
          msg.userId === user.id ? 'justify-content-end' : 'justify-content-start'
        ]"
      >
        <img
            :src="msg.avatarUrl"
            class="rounded-circle me-2"
            alt="avatar"
            width="40"
            height="40"
        />

        <div class="w-100" style="max-width: 70%;">
          <div
              :class="[
              'card',
              msg.userId === user.id ? 'bg-primary text-white' : 'bg-white text-dark'
            ]"
          >
            <div class="card-body p-2">
              <div class="fw-bold small mb-1">{{ msg.displayName }}</div>

              <!-- Editing Mode -->
              <div v-if="editId === msg.id" class="d-flex">
                <input
                    v-model="editText"
                    class="form-control form-control-sm me-1"
                    @keyup.enter="confirmEdit(msg.id)"
                />
                <button @click="confirmEdit(msg.id)" class="btn btn-sm btn-success me-1">OK</button>
                <button @click="cancelEdit" class="btn btn-sm btn-danger">✕</button>
              </div>

              <!-- Display Mode -->
              <div v-else>
                <p class="mb-1">
                  {{ msg.text }}
                  <small v-if="msg.edited" class="fst-italic">(ред.)</small>
                </p>
              </div>

              <div class="d-flex justify-content-between small text-muted">
                <span>{{ formatTime(msg.timestamp) }}</span>
                <span v-if="msg.readBy?.length">👁 {{ msg.readBy.join(', ') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="msg.userId === user.id" class="ms-2 d-flex flex-column">
          <button @click="startEdit(msg)" class="btn btn-sm btn-light mb-1">✎</button>
          <button @click="remove(msg.id)" class="btn btn-sm btn-light">🗑</button>
        </div>
      </div>

      <div v-if="typingUsers.length" class="text-muted fst-italic">
        <span v-for="(t, i) in typingUsers" :key="t.id">
          {{ t.displayName }}<span v-if="i < typingUsers.length - 1">, </span>
        </span>
        {{ typingUsers.length === 1 ? ' набирає...' : ' набирають...' }}
      </div>
    </div>

    <!-- Input -->
    <footer class="d-flex p-3 bg-white border-top">
      <input
          v-model="newText"
          @input="onInput"
          @keyup.enter="submit"
          placeholder="Напишіть повідомлення…"
          class="form-control me-2"
      />
      <button @click="submit" class="btn btn-primary">▶</button>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import {
  sendMessageToConversation,
  subscribeConversationMessages,
  markMessageRead,
  updateMessage,
  deleteMessage,
  setUserTyping,
  subscribeTyping
} from '../firebase'

export default {
  name: 'Chat',
  props: {
    user: { type: Object, required: true },
    conversationId: { type: String, required: true },
    conversationName: { type: String, required: true }
  },
  setup(props) {
    const messages = ref([])
    const newText = ref('')
    const editId = ref(null)
    const editText = ref('')
    const typingUsers = ref([])
    const msgContainer = ref(null)
    let unsubMsgs, unsubTyp

    onMounted(() => {
      unsubMsgs = subscribeConversationMessages(props.conversationId, async msgs => {
        messages.value = msgs
        for (const msg of msgs) {
          if (!msg.readBy?.includes(props.user.displayName)) {
            await markMessageRead(msg.id, props.user.displayName)
          }
        }
        nextTick(() => {
          msgContainer.value.scrollTop = msgContainer.value.scrollHeight
        })
      })
      unsubTyp = subscribeTyping(users => {
        typingUsers.value = users.filter(u => u.id !== props.user.id)
      })
    })

    onBeforeUnmount(() => {
      unsubMsgs && unsubMsgs()
      unsubTyp && unsubTyp()
      setUserTyping(props.user.id, false)
    })

    function startEdit(msg) {
      editId.value = msg.id
      editText.value = msg.text
    }

    async function confirmEdit(id) {
      if (editText.value.trim()) {
        await updateMessage(id, editText.value.trim())
      }
      cancelEdit()
    }

    function cancelEdit() {
      editId.value = null
      editText.value = ''
    }

    async function remove(id) {
      if (confirm('Видалити повідомлення?')) {
        await deleteMessage(id)
      }
    }

    async function submit() {
      if (!newText.value.trim()) return
      await sendMessageToConversation(props.conversationId, {
        userId: props.user.id,
        displayName: props.user.displayName,
        avatarUrl: props.user.avatarUrl,
        text: newText.value.trim()
      })
      newText.value = ''
      setUserTyping(props.user.id, false)
    }

    function onInput() {
      setUserTyping(props.user.id, true)
      clearTimeout(window.typingTimeout)
      window.typingTimeout = setTimeout(() => {
        setUserTyping(props.user.id, false)
      }, 1000)
    }

    function formatTime(ts) {
      if (!ts) {
        return ''
      }
      const date = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return {
      messages,
      newText,
      editId,
      editText,
      typingUsers,
      msgContainer,
      startEdit,
      confirmEdit,
      cancelEdit,
      remove,
      submit,
      onInput,
      formatTime
    }
  }
}
</script>

<style scoped>
</style>