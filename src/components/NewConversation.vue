<template>
  <div class="container d-flex justify-content-center align-items-center vh-100 bg-light">
    <div class="card p-4" style="max-width: 500px; width: 100%;">
      <h2 class="card-title text-center mb-4">Нова бесіда</h2>

      <form @submit.prevent="create">
        <div class="mb-3">
          <label class="form-label">Тип бесіди</label>
          <select v-model="type" class="form-select">
            <option value="direct">Приватна (2 учасники)</option>
            <option value="group">Групова</option>
          </select>
        </div>

        <div v-if="type==='group'" class="mb-3">
          <label class="form-label">Назва групи</label>
          <input
              v-model="name"
              type="text"
              class="form-control"
              placeholder="Введіть назву групи"
              required
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Додати користувачів (email через кому)</label>
          <input
              v-model="emails"
              type="text"
              class="form-control"
              placeholder="user1@example.com, user2@example.com"
              required
          />
        </div>

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary flex-grow-1">
            Створити
          </button>
          <button
              type="button"
              @click="$emit('cancel')"
              class="btn btn-secondary flex-grow-1"
          >
            Відмінити
          </button>
        </div>

        <div v-if="error" class="alert alert-danger mt-3">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import {
  createConversation,
  addParticipant,
  getUserByEmail
} from '../firebase'

export default {
  name: 'NewConversation',
  props: {
    userId: { type: String, required: true }
  },
  setup(props, { emit }) {
    const type = ref('direct')
    const name = ref('')
    const emails = ref('')
    const error = ref('')

    const create = async () => {
      error.value = ''
      const list = emails.value
          .split(',')
          .map(e => e.trim())
          .filter(e => e)

      if (type.value === 'direct' && list.length !== 1) {
        error.value = 'Для приватної бесіди введіть точно один email'
        return
      }

      try {
        const conv = await createConversation(
            type.value === 'group' ? name.value : '',
            type.value
        )
        await addParticipant(conv.id, props.userId)
        for (const email of list) {
          const usr = await getUserByEmail(email)
          await addParticipant(conv.id, usr.id)
        }
        emit('created', {
          id: conv.id,
          name: type.value === 'group' ? name.value : list[0]
        })
      } catch (e) {
        error.value = e.message
      }
    }

    return { type, name, emails, error, create }
  }
}
</script>

<style scoped>
</style>
