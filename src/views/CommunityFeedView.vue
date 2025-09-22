<template>
  <div class="community-feed">
    <button type="button" class="community-feed__back" @click="handleBack">← 돌아가기</button>
    <h1 class="community-feed__title">커뮤니티 대화</h1>

    <PostComposer
      :opinion="selectedOpinion"
      :content="composerContent"
      :is-logged-in="isLoggedIn"
      @update:opinion="(value) => (selectedOpinion = value)"
      @update:content="(value) => (composerContent = value)"
      @submit="handleCreatePost"
      @exceed="notifyMaxChars"
    />

    <section class="community-feed__list">
      <CommunityPostCard
        v-for="post in posts"
        :key="post.postId"
        :post="post"
        @select="handleSelectPost"
        @comment="handleSelectPost"
        @like="handleLikePost"
      />
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import PostComposer from '@/components/community/PostComposer.vue'
import CommunityPostCard from '@/components/community/CommunityPostCard.vue'
import { useCommunityFeedStore } from '@/stores/communityFeed'
import { useSessionStore } from '@/stores/session'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const feedStore = useCommunityFeedStore()
const sessionStore = useSessionStore()
const toastStore = useToastStore()

const { posts } = storeToRefs(feedStore)

const selectedOpinion = ref('')
const composerContent = ref('')

const isLoggedIn = computed(() => sessionStore.isLoggedIn)

onMounted(() => {
  feedStore.ensurePosts()
})

function requireLogin() {
  toastStore.pushToast({ message: '로그인 후 사용해 주세요', tone: 'info' })
}

function notifyMaxChars() {
  toastStore.pushToast({ message: '최대 300자만 입력할 수 있어요', tone: 'error' })
}

async function handleCreatePost() {
  if (!isLoggedIn.value) {
    requireLogin()
    return
  }
  try {
    await feedStore.createPost({
      opinion: selectedOpinion.value,
      content: composerContent.value.trim(),
      user: sessionStore.user,
    })
    selectedOpinion.value = ''
    composerContent.value = ''
    toastStore.pushToast({ message: '게시물이 등록되었습니다.', tone: 'success' })
  } catch (error) {
    toastStore.pushToast({ message: '등록에 실패했습니다. 잠시 후 다시 시도해 주세요.', tone: 'error' })
    console.error(error)
  }
}

function handleSelectPost(post) {
  if (!isLoggedIn.value) {
    requireLogin()
    return
  }
  router.push({ name: 'CommunityPostDetail', params: { postId: post.postId } })
}

async function handleLikePost(post) {
  if (!isLoggedIn.value) {
    requireLogin()
    return
  }
  try {
    const result = await feedStore.toggleLike(post.postId)
    toastStore.pushToast({
      message: result.likedByMe ? '좋아요가 반영되었습니다.' : '좋아요가 취소되었습니다',
      tone: result.likedByMe ? 'success' : 'info',
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
.community-feed {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 40px;
  max-width: 900px;
  margin: 0 auto;
}

.community-feed__back {
  align-self: flex-start;
  border: none;
  background: none;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
}

.community-feed__title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.community-feed__list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 768px) {
  .community-feed {
    padding: 24px;
  }

  .community-feed__title {
    font-size: 26px;
  }
}
</style>
