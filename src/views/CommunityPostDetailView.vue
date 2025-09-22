<template>
  <div class="community-post-detail">
    <button type="button" class="community-post-detail__back" @click="handleBack">뒤로가기</button>

    <article v-if="post" class="community-post-detail__card">
      <div class="community-post-detail__top">
        <div class="community-post-detail__profile">
          <div class="community-post-detail__avatar" aria-hidden="true"></div>
          <div class="community-post-detail__info">
            <div class="community-post-detail__identity">
              <span class="community-post-detail__badge" :class="badgeClass">{{ post.opinion }}</span>
              <div class="community-post-detail__user">
                <span class="community-post-detail__author">{{ post.userName }}</span>
                <img
                  v-if="tierBadgeSrc"
                  :src="tierBadgeSrc"
                  :alt="`${post.authorTierCode ?? ''} tier`"
                  class="community-post-detail__tier-badge"
                />
              </div>
            </div>
            <p class="community-post-detail__content">{{ post.content }}</p>
          </div>
        </div>
        <span class="community-post-detail__timestamp">{{ formattedDate }}</span>
      </div>

      <footer class="community-post-detail__footer" @click.stop>
        <button
          type="button"
          class="community-post-detail__icon"
          :class="{ 'community-post-detail__icon--liked': post.likedByMe }"
          @click="handleToggleLike"
        >
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
        <button type="button" class="community-post-detail__icon" @click="focusCommentComposer">
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

    <section class="community-post-detail__comments">
      <h2 class="community-post-detail__section-title">의견을 남겨주세요</h2>
      <CommentComposer
        ref="composerRef"
        v-model="commentContent"
        :is-logged-in="isLoggedIn"
        @submit="handleSubmitComment"
        @exceed="notifyMaxChars"
      />

      <div class="community-post-detail__comment-list">
        <CommunityCommentItem
          v-for="comment in comments"
          :key="comment.commentId"
          :comment="comment"
          :is-logged-in="isLoggedIn"
          @reply="handleSubmitReply"
          @login-required="requireLogin"
        />
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
import { getTierBadgeSrc } from '@/utils/tierBadge'

const router = useRouter()
const route = useRoute()

const postStore = useCommunityPostStore()
const sessionStore = useSessionStore()
const toastStore = useToastStore()

const { post, comments } = storeToRefs(postStore)

const commentContent = ref('')
const composerRef = ref(null)

const isLoggedIn = computed(() => sessionStore.isLoggedIn)

const badgeClass = computed(() => {
  if (!post.value) return ''
  if (post.value.opinion === 'Hold') return 'community-post-detail__badge--neutral'
  if (post.value.opinion === 'Strong Sell' || post.value.opinion === 'Sell') {
    return 'community-post-detail__badge--negative'
  }
  return 'community-post-detail__badge--positive'
})

const tierBadgeSrc = computed(() => {
  if (!post.value) return null
  return getTierBadgeSrc(post.value.authorTierCode)
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
  toastStore.pushToast({ message: '로그인이 필요합니다.', tone: 'info' })
}

function notifyMaxChars() {
  toastStore.pushToast({ message: '최대 300자까지 입력할 수 있어요.', tone: 'error' })
}

function focusCommentComposer() {
  composerRef.value?.focus?.()
}

async function handleSubmitComment() {
  if (!isLoggedIn.value) {
    requireLogin()
    return
  }
  if (!post.value) return
  const content = commentContent.value.trim()
  if (!content) return
  try {
    await postStore.addComment(post.value.postId, {
      content,
      user: sessionStore.user,
      parentCommentId: null,
    })
    commentContent.value = ''
    toastStore.pushToast({ message: '댓글이 등록되었습니다.', tone: 'success' })
  } catch (error) {
    toastStore.pushToast({ message: '댓글 등록에 실패했습니다.', tone: 'error' })
    console.error(error)
  }
}

async function handleSubmitReply(payload) {
  if (!isLoggedIn.value) {
    requireLogin()
    return
  }
  if (!post.value) return
  try {
    await postStore.addComment(post.value.postId, {
      content: payload.content,
      user: sessionStore.user,
      parentCommentId: payload.parentCommentId,
    })
    payload.onComplete?.()
    toastStore.pushToast({ message: '답글이 등록되었습니다.', tone: 'success' })
  } catch (error) {
    toastStore.pushToast({ message: '답글 등록에 실패했습니다.', tone: 'error' })
    console.error(error)
  }
}

async function handleToggleLike() {
  if (!isLoggedIn.value) {
    requireLogin()
    return
  }
  if (!post.value) return
  try {
    const wasLiked = post.value.likedByMe
    await postStore.toggleLike(post.value.postId)
    toastStore.pushToast({
      message: wasLiked ? '좋아요가 취소되었습니다.' : '좋아요가 반영되었습니다.',
      tone: wasLiked ? 'info' : 'success',
    })
  } catch (error) {
    toastStore.pushToast({ message: '좋아요 처리에 실패했습니다.', tone: 'error' })
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
  gap: 36px;
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
  gap: 20px;
  padding: 24px;
  border-radius: 22px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
}

.community-post-detail__top {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
}

.community-post-detail__profile {
  display: flex;
  gap: 18px;
  flex: 1;
  min-width: 0;
}

.community-post-detail__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e5e7eb, #f3f4f6);
  flex-shrink: 0;
}

.community-post-detail__info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.community-post-detail__identity {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
}

.community-post-detail__user {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.community-post-detail__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
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

.community-post-detail__author {
  font-weight: 600;
  color: #111827;
  font-size: 16px;
}

.community-post-detail__tier-badge {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.community-post-detail__timestamp {
  font-size: 13px;
  color: #9ca3af;
  white-space: nowrap;
}

.community-post-detail__content {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: #374151;
}

.community-post-detail__footer {
  display: flex;
  gap: 20px;
}

.community-post-detail__icon {
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

.community-post-detail__icon--liked {
  color: #f05665;
}

.community-post-detail__icon span {
  font-variant-numeric: tabular-nums;
}

.community-post-detail__comments {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.community-post-detail__section-title {
  margin: 8px 0 0;
  font-size: 20px;
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

