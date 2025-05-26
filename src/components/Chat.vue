<!-- src/components/Chat.vue -->
<template>
  <div class="chat-container">
    <!-- Header -->
    <header class="chat-header">
      <div class="user-info">
        <img :src="user.avatarUrl" alt="avatar" class="user-avatar" />
        <span class="user-name">{{ user.displayName }}</span>
      </div>
      <button @click="$emit('logout')" class="btn-logout">Вийти</button>
    </header>

    <!-- Message List -->
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
          <p class="message__text">{{ msg.text }}</p>
          <span class="message__meta">{{ msg.displayName }}</span>
        </div>
      </div>
    </section>

    <!-- Input Area -->
    <footer class="chat-input-area">
      <input
          v-model="newText"
          @keyup.enter="submit"
          placeholder="Напишіть повідомлення…"
          class="chat-input"
      />
      <button @click="submit" class="btn-send">Відправити</button>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { sendMessage, subscribeMessages } from '../firebase'

export default {
  name: 'Chat',
  props: { user: { type: Object, required: true } },
  setup(props) {
    const messages = ref([])
    const newText = ref('')
    const msgContainer = ref(null)
    let unsubscribe = null

    onMounted(() => {
      unsubscribe = subscribeMessages((msgs) => {
        messages.value = msgs
        nextTick(() => {
          const el = msgContainer.value
          if (el) el.scrollTop = el.scrollHeight
        })
      })
    })

    onBeforeUnmount(() => {
      if (unsubscribe) unsubscribe()
    })

    const submit = async () => {
      const text = newText.value.trim()
      if (!text) return
      await sendMessage({
        userId: props.user.id,
        displayName: props.user.displayName,
        avatarUrl: props.user.avatarUrl,
        text,
      })
      newText.value = ''
    }

    return { messages, newText, msgContainer, submit }
  },
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #eef2f5;
}

/* Header */
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
.btn-logout {
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 0.9rem;
}

/* Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: #eef2f5;
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
.message--other {
  justify-content: flex-start;
}
.message--own {
  justify-content: flex-end;
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
  position: relative;
}
.message--own .message__content {
  background: #daf1ff;
}
.message__text {
  margin: 0;
  color: #111827;
}
.message__meta {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
}

/* Input */
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
  transition: background 0.3s;
}
.btn-send:hover {
  background: #2563eb;
}
</style>