<template>
  <div class="community-post-detail">
    <button type="button" class="community-post-detail__back" @click="handleBack">← 돌아가기</button>

    <article v-if="post" class="community-post-detail__card">
      <div class="community-post-detail__card-header">
        <span class="community-post-detail__badge" :class="badgeClass">{{ post.opinion }}</span>
        <span class="community-post-detail__timestamp">{{ formattedDate }}</span>
      </div>
      <div class="community-post-detail__card-body">
        <div class="community-post-detail__avatar" aria-hidden="true"></div>
        <div>
          <div class="community-post-detail__meta">
            <span class="community-post-detail__author">{{ post.userName }}</span>
            <span class="community-post-detail__tier">{{ post.authorTierCode }}</span>
          </div>
          <p class="community-post-detail__content">{{ post.content }}</p>
        </div>
      </div>
      <footer class="community-post-detail__counts">
        ❤ {{ post.likeCount }} · 💬 {{ post.commentCount }}
      </footer>
    </article>

    <section class="community-post-detail__comments">
      <h2 class="community-post-detail__section-title">의견을 남겨주세요</h2>
      <CommentComposer
        v-model="commentContent"
        :is-logged-in="isLoggedIn"
        @submit="handleSubmitComment"
        @exceed="notifyMaxChars"
      />

      <div class="community-post-detail__comment-list">
        <CommunityCommentItem v-for="comment in comments" :key="comment.commentId" :comment="comment" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import CommentComposer from '@/components/community/CommentComposer.vue'
import CommunityCommentItem from '@/components/community/CommunityCommentItem.vue'
import { useCommunityPostStore } from '@/stores/communityPost'
import { useSessionStore } from '@/stores/session'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const route = useRoute()

const postStore = useCommunityPostStore()
const sessionStore = useSessionStore()
const toastStore = useToastStore()

const { post, comments } = storeToRefs(postStore)

const commentContent = ref('')

const isLoggedIn = computed(() => sessionStore.isLoggedIn)

const badgeClass = computed(() => {
  if (!post.value) return ''
  if (post.value.opinion === 'Hold') return 'community-post-detail__badge--neutral'
  if (post.value.opinion === 'Strong Sell' || post.value.opinion === 'Sell') {
    return 'community-post-detail__badge--negative'
  }
  return 'community-post-detail__badge--positive'
})

const formattedDate = computed(() => {
  if (!post.value) return ''
  return new Date(post.value.createdAt).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

onMounted(() => {
  const postId = Number(route.params.postId)
  if (Number.isNaN(postId)) return
  postStore.load(postId)
})

onUnmounted(() => {
  postStore.clear()
  commentContent.value = ''
})

function requireLogin() {
  toastStore.pushToast({ message: '로그인 후 사용해 주세요', tone: 'info' })
}

function notifyMaxChars() {
  toastStore.pushToast({ message: '최대 300자까지 입력할 수 있어요.', tone: 'error' })
}

async function handleSubmitComment() {
  if (!isLoggedIn.value) {
    requireLogin()
    return
  }
  if (!post.value) return
  try {
    await postStore.addComment(post.value.postId, {
      content: commentContent.value.trim(),
      user: sessionStore.user,
    })
    commentContent.value = ''
    toastStore.pushToast({ message: '댓글이 등록되었습니다.', tone: 'success' })
  } catch (error) {
    toastStore.pushToast({ message: '댓글 등록에 실패했습니다.', tone: 'error' })
    console.error(error)
  }
}

function handleBack() {
  router.back()
}
</script>

<style scoped>
.community-post-detail {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 40px;
  max-width: 880px;
  margin: 0 auto;
}

.community-post-detail__back {
  align-self: flex-start;
  border: none;
  background: none;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
}

.community-post-detail__card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  border-radius: 22px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
}

.community-post-detail__card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.community-post-detail__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.community-post-detail__badge--positive {
  background-color: #d8f5df;
  color: #0f8c4f;
}

.community-post-detail__badge--negative {
  background-color: #ffd9de;
  color: #cb2943;
}

.community-post-detail__badge--neutral {
  background-color: #fff4b8;
  color: #946c00;
}

.community-post-detail__timestamp {
  font-size: 12px;
  color: #9ca3af;
}

.community-post-detail__card-body {
  display: flex;
  gap: 16px;
}

.community-post-detail__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e5e7eb, #f3f4f6);
  flex-shrink: 0;
}

.community-post-detail__meta {
  display: flex;
  gap: 10px;
  font-size: 13px;
  color: #6b7280;
}

.community-post-detail__author {
  font-weight: 600;
  color: #111827;
}

.community-post-detail__content {
  margin: 8px 0 0;
  font-size: 16px;
  line-height: 1.6;
  color: #374151;
}

.community-post-detail__counts {
  font-size: 13px;
  color: #6b7280;
}

.community-post-detail__comments {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.community-post-detail__section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.community-post-detail__comment-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

@media (max-width: 768px) {
  .community-post-detail {
    padding: 24px;
  }
}
</style>
