<template>
  <div class="container d-flex justify-content-center align-items-center vh-100 bg-light">
    <div class="card p-4" style="max-width: 400px; width: 100%;">
      <h2 class="card-title text-center mb-4">Редагування профілю</h2>

      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label for="avatarUrl" class="form-label">URL аватарки</label>
          <input
              id="avatarUrl"
              v-model="avatarUrl"
              type="url"
              class="form-control"
              placeholder="https://example.com/me.png"
              required
          />
        </div>

        <div v-if="avatarUrl" class="mb-3 text-center">
          <img
              :src="avatarUrl"
              alt="Preview"
              class="rounded-circle"
              style="width: 150px; height: 150px;"
          />
        </div>

        <div class="d-flex justify-content-between">
          <button type="submit" class="btn btn-primary flex-grow-1 me-2">
            Зберегти
          </button>
          <button
              type="button"
              @click="$emit('cancel')"
              class="btn btn-secondary flex-grow-1"
          >
            Відмінити
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { updateUserAvatar } from '../firebase'

export default {
  name: 'Profile',
  props: { user: { type: Object, required: true } },
  data() {
    return {
      avatarUrl: this.user.avatarUrl || ''
    }
  },
  methods: {
    async handleSubmit() {
      try {
        const newUrl = await updateUserAvatar(this.user.id, this.avatarUrl)
        this.$emit('updated', { ...this.user, avatarUrl: newUrl })
      } catch (e) {
        alert('Не вдалося оновити аватар: ' + e.message)
      }
    }
  }
}
</script>

<style scoped>
</style>