<template>
  <div class="profile-container">
    <div class="profile-card">
      <h2 class="profile-title">Редагування профілю</h2>

      <form @submit.prevent="handleSubmit" class="profile-form">
        <div class="form-group">
          <label for="avatarUrl" class="form-label">URL аватарки</label>
          <input
              id="avatarUrl"
              v-model="avatarUrl"
              type="url"
              class="form-input"
              placeholder="https://example.com/me.png"
              required
          />
        </div>

        <div class="preview" v-if="avatarUrl">
          <img :src="avatarUrl" alt="Preview" class="preview-img" />
        </div>

        <div class="buttons">
          <button type="submit" class="btn-primary">Зберегти</button>
          <button type="button" @click="$emit('cancel')" class="btn-secondary">
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
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: var(--color-background-soft);
}
.profile-card {
  background: var(--color-background);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}
.profile-title {
  text-align: center;
  margin-bottom: 1rem;
  color: var(--color-heading);
}
.profile-form {
  display: flex;
  flex-direction: column;
}
.form-group {
  margin-bottom: 1rem;
}
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  font-size: 0.9rem;
}
.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
}
.preview {
  text-align: center;
  margin-bottom: 1rem;
}
.preview-img {
  max-width: 100%;
  max-height: 150px;
  border-radius: 50%;
}
.buttons {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 1rem;
}
.btn-primary {
  flex: 1;
  background: var(--vt-c-indigo);
  color: #fff;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
}
.btn-secondary {
  flex: 1;
  background: transparent;
  border: 1px solid var(--vt-c-indigo);
  color: var(--vt-c-indigo);
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>