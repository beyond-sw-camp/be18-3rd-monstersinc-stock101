<template>
  <article class="community-post-card" @click="handleSelect">
    <div class="community-post-card__header">
      <span class="community-post-card__badge" :class="badgeClass">{{ post.opinion }}</span>
      <span class="community-post-card__timestamp">{{ formattedDate }}</span>
    </div>

    <div class="community-post-card__body">
      <div class="community-post-card__avatar" aria-hidden="true"></div>
      <div>
        <div class="community-post-card__meta">
          <span class="community-post-card__author">{{ post.userName }}</span>
          <span class="community-post-card__tier">{{ post.authorTierCode }}</span>
        </div>
        <p class="community-post-card__content">{{ post.content }}</p>
      </div>
    </div>

    <footer class="community-post-card__footer" @click.stop>
      <button type="button" class="community-post-card__icon" :class="{ 'community-post-card__icon--liked': post.likedByMe }" @click="handleLike">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 21s-5.286-4.117-7.607-6.735C2.5 12.178 2 9.488 3.414 7.414 4.828 5.34 7.512 4.5 9.5 6.5l1.5 1.5 1.5-1.5c1.988-2 4.672-1.16 6.086.914 1.414 2.074.914 4.764-1.979 6.851C17.286 16.883 12 21 12 21z"
            :fill="post.likedByMe ? '#f05665' : 'none'"
            :stroke="post.likedByMe ? '#f05665' : '#6b7280'"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>{{ post.likeCount }}</span>
      </button>
      <button type="button" class="community-post-card__icon" @click="handleComment">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M21 12c0 4.418-4.03 8-9 8-1.013 0-1.99-.154-2.905-.44L3 20l1.58-3.162C3.59 15.695 3 13.91 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            stroke="#6b7280"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>{{ post.commentCount }}</span>
      </button>
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

const emit = defineEmits(['select', 'like', 'comment'])

const badgeClass = computed(() => {
  if (props.post.opinion === 'Hold') return 'community-post-card__badge--neutral'
  if (props.post.opinion === 'Strong Sell' || props.post.opinion === 'Sell') {
    return 'community-post-card__badge--negative'
  }
  return 'community-post-card__badge--positive'
})

const formattedDate = computed(() => {
  const value = props.post.createdAt
  return new Date(value).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

function handleSelect() {
  emit('select', props.post)
}

function handleLike() {
  emit('like', props.post)
}

function handleComment() {
  emit('comment', props.post)
}
</script>

<style scoped>
.community-post-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px 24px;
  border-radius: 18px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  cursor: pointer;
}

.community-post-card:hover {
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  transform: translateY(-2px);
}

.community-post-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.community-post-card__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background-color: #f3f4f6;
  color: #111827;
}

.community-post-card__badge--positive {
  background-color: #d8f5df;
  color: #0f8c4f;
}

.community-post-card__badge--negative {
  background-color: #ffd9de;
  color: #cb2943;
}

.community-post-card__badge--neutral {
  background-color: #fff4b8;
  color: #946c00;
}

.community-post-card__timestamp {
  font-size: 12px;
  color: #9ca3af;
}

.community-post-card__body {
  display: flex;
  gap: 14px;
}

.community-post-card__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e5e7eb, #f3f4f6);
  flex-shrink: 0;
}

.community-post-card__meta {
  display: flex;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
}

.community-post-card__author {
  font-weight: 600;
  color: #111827;
}

.community-post-card__content {
  margin: 6px 0 0;
  font-size: 15px;
  line-height: 1.6;
  color: #374151;
}

.community-post-card__footer {
  display: flex;
  gap: 16px;
}

.community-post-card__icon {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 6px;
}

.community-post-card__icon--liked {
  color: #f05665;
}

.community-post-card__icon span {
  font-variant-numeric: tabular-nums;
}
</style>
