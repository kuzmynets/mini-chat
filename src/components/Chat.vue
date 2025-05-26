<template>
  <div class="chat">
    <div class="header">
      <div class="user-info">
        <img :src="user.avatarUrl" class="avatar" alt="avatar" />
        <span>{{ user.displayName }}</span>
      </div>
      <button @click="$emit('logout')" class="logout">Вийти</button>
    </div>

    <div class="messages" ref="msgContainer">
      <div
          v-if="messages.length === 0"
          class="no-messages"
      >
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
        // автопрокрутка після рендеру
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
/* залиште ваші стилі, додав окремий клас для no-messages */
.no-messages {
  text-align: center;
  color: #999;
  margin: 20px 0;
}
</style>