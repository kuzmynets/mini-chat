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
        Тут ще немає жодного повідомлення…
      </div>
      <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['message-item', msg.userId === user.id ? 'own' : 'other']"
      >
        <img :src="msg.avatarUrl" alt="avatar" class="msg-avatar" />
        <div class="msg-bubble">
          <p class="msg-text">{{ msg.text }}</p>
          <span class="msg-sender">{{ msg.displayName }}</span>
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
      unsubscribe = subscribeMessages(msgs => {
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
        text
      })
      newText.value = ''
    }

    return { messages, newText, msgContainer, submit }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--color-background-soft);
}

/* Header */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
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
  color: var(--color-heading);
}
.btn-logout {
  background: transparent;
  border: none;
  color: #e53e3e;
  cursor: pointer;
  font-size: 0.9rem;
}

/* Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}
.no-messages {
  text-align: center;
  color: var(--color-text);
  margin-top: 2rem;
}
.message-item {
  display: flex;
  margin-bottom: 1rem;
  align-items: flex-end;
}
.message-item.other {
  justify-content: flex-start;
}
.message-item.own {
  justify-content: flex-end;
  flex-direction: row-reverse;
}
.msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin: 0 0.5rem;
}
.msg-bubble {
  max-width: 70%;
  background: var(--color-background);
  padding: 0.75rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  position: relative;
}
.message-item.own .msg-bubble {
  background: #c6f6d5;
}
.msg-text {
  margin: 0;
  color: var(--color-text);
}
.msg-sender {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-text);
  text-align: right;
}

/* Input */
.chat-input-area {
  display: flex;
  padding: 0.75rem 1rem;
  background: var(--color-background);
  border-top: 1px solid var(--color-border);
}
.chat-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
}
.btn-send {
  background: var(--color-heading);
  border: none;
  color: var(--color-background);
  padding: 0 1rem;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  transition: background 0.3s;
}
.btn-send:hover {
  background: var(--vt-c-indigo);
}
</style>