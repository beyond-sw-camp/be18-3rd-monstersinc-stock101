<template>
  <article class="post-card">
    <header class="post-card__header">
      <div class="post-card__author">
        <div class="post-card__avatar" aria-hidden="true"></div>
        <div>
          <span class="post-card__name">{{ post.author }}</span>
          <span class="post-card__timestamp">{{ formattedDate }}</span>
        </div>
      </div>
      <span class="post-card__tag" v-if="post.tag">{{ post.tag }}</span>
    </header>
    <p class="post-card__body">{{ post.content }}</p>
    <footer class="post-card__footer">
      <span class="post-card__stat">❤ {{ post.likes }}</span>
      <span class="post-card__stat">💬 {{ post.comments }}</span>
    </footer>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
})

const formattedDate = computed(() => {
  const value = props.post.postedAt
  if (!(value instanceof Date)) {
    return new Date(value).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return value.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})
</script>

<style scoped>
.post-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 24px;
  border-radius: 18px;
  border: 1px solid #e5e7eb;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}

.post-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.post-card__author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.post-card__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e5e7eb, #f3f4f6);
}

.post-card__name {
  display: block;
  font-weight: 600;
  color: #111827;
}

.post-card__timestamp {
  display: block;
  font-size: 12px;
  color: #6b7280;
}

.post-card__tag {
  padding: 6px 12px;
  border-radius: 999px;
  background-color: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
}

.post-card__body {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: #374151;
}

.post-card__footer {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #6b7280;
}
</style>
