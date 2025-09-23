<template>
  <div class="community-feed">
    <button type="button" class="community-feed__back" @click="handleBack">돌아가기</button>
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
import CommunityPostCard from '@/components/community/CommunityPostCard.vue'
import PostComposer from '@/components/community/PostComposer.vue'
import { fetchPosts } from '@/services/communityApi'
import { useCommunityFeedStore } from '@/stores/communityFeed'
import { useSessionStore } from '@/stores/session'
import { useToastStore } from '@/stores/toast'
import axios from 'axios'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const feedStore = useCommunityFeedStore()
const sessionStore = useSessionStore()
const toastStore = useToastStore()

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const apiClient = axios.create({
  baseURL: apiBaseUrl,
})

const { posts, selectedStockId } = storeToRefs(feedStore)

const selectedOpinion = ref('')
const composerContent = ref('')

const isLoggedIn = computed(() => sessionStore.isLoggedIn)

async function loadFeed() {
  if (feedStore.isLoading) return
  feedStore.isLoading = true
    try {
    const headers = {}
    if (sessionStore.accessToken) {
      headers.Authorization = `Bearer ${sessionStore.accessToken}`
    }
    const params = {}
    if (selectedStockId.value != null) params.stockId = selectedStockId.value
    const { data } = await apiClient.get('/api/v1/board/posts', { headers, params })
    const items = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : []
    if (items.length) {
      feedStore.posts = items
      feedStore.error = null
      feedStore.isInitialized = true
      return
    }
    if (!feedStore.posts.length) {
  const fallback = await fetchPosts({ token: sessionStore.accessToken, stockId: selectedStockId.value })
      feedStore.posts = fallback.items
      feedStore.error = null
      feedStore.isInitialized = true
    }
  } catch (error) {
    console.error('[CommunityFeedView] loadFeed failed', error)
    feedStore.error = error
    toastStore.pushToast({ message: '게시물을 불러오는 데 실패하였습니다.', tone: 'error' })
    if (!feedStore.posts.length) {
      try {
        const fallback = await fetchPosts({ token: sessionStore.accessToken, stockId: selectedStockId.value })
        feedStore.posts = fallback.items
      } catch (fallbackError) {
        console.error('[CommunityFeedView] fallback load failed', fallbackError)
      }
    }
  } finally {
    feedStore.isLoading = false
  }
}

onMounted(() => {
  loadFeed()
})

function requireLogin() {
  toastStore.pushToast({ message: '로그인 후 이용해 주세요.', tone: 'info' })
}

function notifyMaxChars() {
  toastStore.pushToast({ message: '최대 300자까지 입력할 수 있어요.', tone: 'error' })
}

async function handleCreatePost() {
  if (!isLoggedIn.value) {
    requireLogin()
    return
  }
  const content = composerContent.value.trim()
  if (!selectedOpinion.value || !content) return
  try {
    await feedStore.createPost({
      stockId: selectedStockId.value,
      opinion: selectedOpinion.value,
      content,
      user: sessionStore.user,
    })
    selectedOpinion.value = ''
    composerContent.value = ''
    toastStore.pushToast({ message: '게시물이 등록되었어요.', tone: 'success' })
    await loadFeed()
  } catch (error) {
    const message = error?.message
    if (message === 'STOCK_ID_REQUIRED') {
      toastStore.pushToast({ message: 'Select a stock before posting.', tone: 'warning' })
      return
    }
    if (message === 'OPINION_REQUIRED') {
      toastStore.pushToast({ message: 'Choose an opinion before posting.', tone: 'warning' })
      return
    }
    if (message === 'CONTENT_REQUIRED') {
      toastStore.pushToast({ message: '내용을 입력해 주세요.', tone: 'warning' })
      return
    }
    toastStore.pushToast({ message: '게시물 등록에 실패했습니다. 다시 시도해 주세요.', tone: 'error' })
    console.error(error)
  }
}

function handleSelectPost(post) {
  
  router.push({ name: 'CommunityPostDetail', params: { postId: post.postId } })
}

async function handleLikePost(post) {
  if (!isLoggedIn.value) {
    requireLogin()
    return
  }
  try {
    const wasLiked = post.likedByMe
    await feedStore.toggleLike(post.postId)
    toastStore.pushToast({
      message: wasLiked ? '좋아요가 취소되었어요.' : '좋아요가 반영되었어요.',
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


