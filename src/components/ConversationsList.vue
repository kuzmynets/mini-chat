<template>
  <div class="container py-3">
    <!-- Хедер з профілем та виходом -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex align-items-center">
        <img
            :src="user.avatarUrl"
            alt="avatar"
            class="rounded-circle me-2"
            width="40"
            height="40"
        />
        <span class="fw-semibold">{{ user.displayName }}</span>
      </div>
      <div>
        <button
            @click="$emit('edit-profile')"
            class="btn btn-outline-secondary btn-sm me-2"
        >
          Профіль
        </button>
        <button
            @click="$emit('logout')"
            class="btn btn-outline-danger btn-sm"
        >
          Вийти
        </button>
      </div>
    </div>

    <!-- Список бесід -->
    <h3 class="mb-3">Ваші бесіди</h3>
    <ul class="list-group">
      <li
          v-for="conv in convs"
          :key="conv.id"
          @click="$emit('select', conv)"
          class="list-group-item list-group-item-action d-flex align-items-center"
          style="cursor: pointer;"
      >
        <img
            v-if="conv.avatarUrl"
            :src="conv.avatarUrl"
            class="rounded-circle me-2"
            width="32"
            height="32"
        />
        <span>{{ conv.name }}</span>
      </li>
    </ul>

    <!-- Кнопка нової бесіди -->
    <button
        @click="$emit('new')"
        class="btn btn-primary w-100 mt-3"
    >
      + Нова бесіда
    </button>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import {
  getUserConversations,
  getConversationParticipants,
  getUserById
} from '../firebase'

export default {
  name: 'ConversationsList',
  props: {
    userId: { type: String, required: true },
    user:   { type: Object, required: true }
  },
  setup(props, { emit }) {
    const convs = ref([])

    onMounted(async () => {
      // Отримуємо всі бесіди, де user є учасником
      const raw = await getUserConversations(props.userId)
      const list = []

      for (const c of raw) {
        if (c.type === 'direct') {
          // Якщо direct, знаходимо іншого учасника
          const parts = await getConversationParticipants(c.id)
          const other = parts.find(p => p.userId !== props.userId)
          if (other) {
            const otherData = await getUserById(other.userId)
            list.push({
              id: c.id,
              type: 'direct',
              name: otherData.displayName,
              avatarUrl: otherData.avatarUrl
            })
          }
        } else {
          // Для групових чатів просто беремо збережені дані
          list.push({
            id: c.id,
            type: 'group',
            name: c.name,
            avatarUrl: c.avatarUrl || null
          })
        }
      }

      convs.value = list
    })

    return { convs }
  }
}
</script>

<style scoped>
.list-group-item-action:hover {
  background-color: #f8f9fa;
}
</style>
