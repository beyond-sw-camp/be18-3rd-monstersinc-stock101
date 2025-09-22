<template>
  <article class="community-comment-item">
    <div class="community-comment-item__avatar" aria-hidden="true"></div>
    <div class="community-comment-item__content">
      <header class="community-comment-item__header">
        <span class="community-comment-item__author">{{ comment.userName }}</span>
        <span class="community-comment-item__meta">{{ comment.authorTierCode }}</span>
        <span class="community-comment-item__meta">{{ formattedDate }}</span>
      </header>
      <p class="community-comment-item__body">{{ comment.content }}</p>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
})

const formattedDate = computed(() => {
  const value = props.comment.createdAt
  return new Date(value).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})
</script>

<style scoped>
.community-comment-item {
  display: flex;
  gap: 14px;
  padding: 18px;
  border-radius: 16px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
}

.community-comment-item__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e5e7eb, #f3f4f6);
  flex-shrink: 0;
}

.community-comment-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.community-comment-item__header {
  display: flex;
  gap: 8px;
  align-items: baseline;
  flex-wrap: wrap;
}

.community-comment-item__author {
  font-weight: 600;
  color: #111827;
}

.community-comment-item__meta {
  font-size: 12px;
  color: #9ca3af;
}

.community-comment-item__body {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: #374151;
}
</style>
