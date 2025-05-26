<template>
  <div class="chat">
    <div class="header">
      <div class="user-info">
        <img :src="user.avatarUrl" class="avatar" alt="avatar" />
        <span>{{ user.displayName }}</span>
      </div>
      <button @click="$emit('logout')" class="logout">
        Вийти
      </button>
    </div>

    <div class="messages" ref="msgContainer">
      <div v-if="messages.length === 0" class="no-messages">
        Тут ще немає жодного повідомлення…
      </div>
      <div v-for="msg in messages" :key="msg.id" class="message">
        <img :src="msg.avatarUrl" class="avatar" alt="avatar" />
        <div class="body">
          <strong>{{ msg.displayName }}</strong>
          <p>{{ msg.text }}</p>
        </div>
      </div>
    </div>

    <div class="input-area">
      <input
          v-model="newText"
          @keyup.enter="submit"
          placeholder="Напишіть повідомлення…"
      />
      <button @click="submit">Відправити</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { sendMessage, subscribeMessages } from '../firebase'

export default {
  name: 'Chat',
  props: {
    user: { type: Object, required: true }
  },
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
      unsubscribe && unsubscribe()
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
.no-messages {
  text-align: center;
  color: #999;
  margin: 20px 0;
}
.chat {
  display: flex;
  flex-direction: column;
  max-width: 600px;
  height: 100vh;
  margin: 0 auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}
.user-info {
  display: flex;
  align-items: center;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 8px;
}
.logout {
  background: transparent;
  border: none;
  color: #e74c3c;
  cursor: pointer;
}
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background: #fafafa;
}
.message {
  display: flex;
  margin-bottom: 10px;
}
.body {
  background: #fff;
  border-radius: 6px;
  padding: 8px 10px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.input-area {
  display: flex;
  padding: 10px;
  border-top: 1px solid #ddd;
}
input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
}
button {
  padding: 8px 12px;
  border: none;
  background: #42b983;
  color: white;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}
</style>