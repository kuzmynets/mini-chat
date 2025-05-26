<template>
  <div class="chat-container">
    <!-- Header -->
    <header class="chat-header">
      <div class="user-info">
        <button @click="$emit('edit-profile')" class="btn btn-profile">
          <img :src="user.avatarUrl" alt="avatar" class="user-avatar" />
          <span class="user-name">{{ user.displayName }}</span>
        </button>
      </div>
      <div class="header-buttons">
        <button @click="$emit('edit-profile')" class="btn-profile">Профіль</button>
        <button @click="$emit('logout')" class="btn-logout">Вийти</button>
      </div>
    </header>

    <section class="chat-messages" ref="msgContainer">
      <div v-if="messages.length === 0" class="no-messages">
        Тут ще немає повідомлень…
      </div>
      <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['message', msg.userId === user.id ? 'message--own' : 'message--other']"
      >
        <img :src="msg.avatarUrl" alt="avatar" class="message__avatar" />
        <div class="message__content">
          <div class="message__sender">{{ msg.displayName }}</div>
          <template v-if="editId === msg.id">
            <input
                v-model="editText"
                class="edit-input"
                @keyup.enter="confirmEdit(msg.id)"
            />
            <button @click="confirmEdit(msg.id)" class="btn-save">OK</button>
            <button @click="cancelEdit" class="btn-cancel">✕</button>
          </template>
          <template v-else>
            <p class="message__text">
              {{ msg.text }} <span v-if="msg.edited" class="edited-label">(ред.)</span>
            </p>
            <div class="message__meta">
              <small class="meta-time">{{ formatTime(msg.timestamp) }}</small>
              <small v-if="msg.readBy?.length" class="meta-read">
                👁 {{ msg.readBy.join(', ') }}
              </small>
            </div>
          </template>
        </div>
        <div v-if="msg.userId === user.id" class="message__actions">
          <button @click="startEdit(msg)" class="btn-action">✎</button>
          <button @click="remove(msg.id)" class="btn-action">🗑</button>
        </div>
      </div>
      <div v-if="typingUsers.length" class="typing-indicator">
        <span v-for="(t, i) in typingUsers" :key="t.id">
          {{ t.displayName }}<span v-if="i < typingUsers.length - 1">, </span>
        </span>
        {{ typingUsers.length === 1 ? ' набирає...' : ' набирають...' }}
      </div>
    </section>

    <footer class="chat-input-area">
      <input
          v-model="newText"
          @input="onInput"
          @keyup.enter="submit"
          placeholder="Напишіть повідомлення…"
          class="chat-input"
      />
      <button @click="submit" class="btn-send">▶</button>
    </footer>
  </div>
</template>

<script>
import {
  ref,
  onMounted,
  nextTick,
  onBeforeUnmount
} from 'vue'
import {
  sendMessage,
  subscribeMessages,
  markMessageRead,
  updateMessage,
  deleteMessage,
  setUserTyping,
  subscribeTyping
} from '../firebase'

export default {
  name: 'Chat',
  props: { user: { type: Object, required: true } },
  setup(props) {
    const messages = ref([])
    const newText = ref('')
    const msgContainer = ref(null)
    const editId = ref(null)
    const editText = ref('')
    const typingUsers = ref([])
    let unsubMsgs, unsubTyp

    onMounted(() => {
      unsubMsgs = subscribeMessages(async msgs => {
        messages.value = msgs
        for (const msg of msgs) {
          if (!msg.readBy?.includes(props.user.displayName)) {
            await markMessageRead(msg.id, props.user.displayName)
          }
        }
        nextTick(() => {
          const el = msgContainer.value
          if (el) el.scrollTop = el.scrollHeight
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

    const submit = async () => {
      const text = newText.value.trim()
      if (!text) return
      await sendMessage({
        userId: props.user.id,
        displayName: props.user.displayName,
        avatarUrl: props.user.avatarUrl,
        text
      })
      newText.value = ''
      setUserTyping(props.user.id, false)
    }

    const onInput = () => {
      setUserTyping(props.user.id, true)
      clearTimeout(window.typingTimeout)
      window.typingTimeout = setTimeout(() => {
        setUserTyping(props.user.id, false)
      }, 1000)
    }

    const formatTime = ts => {
      const date = ts?.toDate ? ts.toDate() : new Date(ts.seconds * 1000)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const startEdit = msg => {
      editId.value = msg.id
      editText.value = msg.text
    }
    const confirmEdit = async id => {
      if (editText.value.trim()) {
        await updateMessage(id, editText.value)
      }
      cancelEdit()
    }
    const cancelEdit = () => {
      editId.value = null
      editText.value = ''
    }

    const remove = async id => {
      if (confirm('Видалити це повідомлення?')) {
        await deleteMessage(id)
      }
    }

    return {
      messages,
      newText,
      msgContainer,
      editId,
      editText,
      typingUsers,
      submit,
      onInput,
      formatTime,
      startEdit,
      confirmEdit,
      cancelEdit,
      remove
    }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #eef2f5;
}
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #ffffff;
  border-bottom: 1px solid #d1d5db;
}
.user-info {
  display: flex;
  align-items: center;
}
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 0.5rem;
}
.user-name {
  font-weight: 600;
  color: #374151;
}
.header-buttons {
  display: flex;
  gap: 0.5rem;
}
.btn-profile,
.btn-logout {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}
.btn-logout {
  color: #ef4444;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.no-messages {
  text-align: center;
  color: #6b7280;
  margin-top: 2rem;
}
.message {
  display: flex;
  align-items: flex-end;
}
.message__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin: 0 0.5rem;
}
.message__content {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.message--own .message__content {
  background: #daf1ff;
}
.message__sender {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #4a5568;
}
.message__text {
  margin: 0;
  color: #111827;
}
.message__meta {
  display: flex;
  justify-content: space-between;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}
.meta-time {
  font-style: italic;
}
.meta-read {
  margin-left: 1rem;
}
.typing-indicator {
  font-style: italic;
  color: #6b7280;
  padding-left: 1rem;
}
.chat-input-area {
  display: flex;
  padding: 0.75rem 1rem;
  background: #ffffff;
  border-top: 1px solid #d1d5db;
}
.chat-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 9999px;
  margin-right: 0.5rem;
  font-size: 1rem;
}
.btn-send {
  background: #1d4ed8;
  border: none;
  color: #ffffff;
  padding: 0 1rem;
  border-radius: 9999px;
  cursor: pointer;
}
.btn-send:hover {
  background: #2563eb;
}
.edit-input {
  width: 100%;
  padding: 0.25rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.btn-action,
.btn-save,
.btn-cancel {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 0.25rem;
}
.edited-label {
  font-style: italic;
  font-size: 0.75rem;
  margin-left: 0.25rem;
}
</style>