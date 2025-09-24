<template>
  <div class="community-feed">
    <button type="button" class="community-feed__back" @click="handleBack">Back</button>
    <h1 class="community-feed__title">커뮤니티 대화</h1>

    <PostComposer
      :opinion="selectedOpinion"
      :content="composerContent"
      :is-logged-in="isLoggedIn"
      @update:opinion="(value) => (selectedOpinion = value)"
      @update:content="(value) => (composerContent = value)"
      @submit="handleCreatePost"
      @exceed="notifyMaxChars"
      @login-required="requireLogin"
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
import { useAuthStore } from '@/stores/authStore'
import { useSessionStore } from '@/stores/session'
import { useToastStore } from '@/stores/toast'
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const LOGIN_REQUIRED_MESSAGE = '\ub85c\uadf8\uc778 \ud6c4 \uc774\uc6a9\ud574 \uc8fc\uc138\uc694'

const router = useRouter()
const sessionStore = useSessionStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const posts = ref([])
const isLoading = ref(false)
const error = ref(null)
const isInitialized = ref(false)
const selectedStockId = ref(null)


const props = defineProps({
  stockId: {
    type: Number,
    default: null,
  },
})
// for quick local testing default to 1001 when neither prop nor store provides it
const TEST_DEFAULT_STOCK_ID = 1001


const selectedOpinion = ref('')
const composerContent = ref('')

const DEV_FALLBACK_POSTS = [
  { postId: 26, stockId: 0, userId: 15, opinion: 'Sell', content: 'ewww', createdAt: '2025-09-23 17:17:00', userName: 'test', likedByMe: false, likeCount: 0, commentCount: 0, authorTierCode: 'BRONZE', imageUrl: 'https://plus.unsplash.com/premium_photo-1710911198710-3097c518f0e1?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { postId: 25, stockId: 0, userId: 15, opinion: 'Sell', content: 'ewww', createdAt: '2025-09-23 16:43:12', userName: 'test', likedByMe: false, likeCount: 0, commentCount: 0, authorTierCode: 'BRONZE', imageUrl: 'https://plus.unsplash.com/premium_photo-1710911198710-3097c518f0e1?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { postId: 24, stockId: 0, userId: 1, opinion: 'SELL', content: 'striasng', createdAt: '2025-09-22 15:01:53', userName: '박진우', likedByMe: false, likeCount: 0, commentCount: 0, authorTierCode: 'DIAMOND', imageUrl: 'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { postId: 23, stockId: 0, userId: 15, opinion: 'Sell', content: 'ewww', createdAt: '2025-09-22 10:54:19', userName: 'test', likedByMe: false, likeCount: 0, commentCount: 0, authorTierCode: 'BRONZE', imageUrl: 'https://plus.unsplash.com/premium_photo-1710911198710-3097c518f0e1?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { postId: 20, stockId: 0, userId: 15, opinion: 'Sell', content: 'ewww', createdAt: '2025-09-21 15:38:50', userName: 'test', likedByMe: false, likeCount: 0, commentCount: 0, authorTierCode: 'BRONZE', imageUrl: 'https://plus.unsplash.com/premium_photo-1710911198710-3097c518f0e1?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { postId: 18, stockId: 0, userId: 1, opinion: 'Sell', content: 'ewww', createdAt: '2025-09-19 17:09:39', userName: '박진우', likedByMe: false, likeCount: 0, commentCount: 0, authorTierCode: 'DIAMOND', imageUrl: 'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { postId: 17, stockId: 0, userId: 1, opinion: 'Sell', content: 'ewww', createdAt: '2025-09-19 17:07:48', userName: '박진우', likedByMe: false, likeCount: 0, commentCount: 0, authorTierCode: 'DIAMOND', imageUrl: 'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { postId: 16, stockId: 0, userId: 15, opinion: 'Sell', content: 'ewww', createdAt: '2025-09-19 12:39:50', userName: 'test', likedByMe: false, likeCount: 0, commentCount: 0, authorTierCode: 'BRONZE', imageUrl: 'https://plus.unsplash.com/premium_photo-1710911198710-3097c518f0e1?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { postId: 15, stockId: 0, userId: 2, opinion: 'Sell', content: 'ewww', createdAt: '2025-09-18 16:05:11', userName: 'test', likedByMe: false, likeCount: 0, commentCount: 8, authorTierCode: 'BRONZE', imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { postId: 14, stockId: 0, userId: 1, opinion: 'qwer', content: 'qwer', createdAt: '2025-09-11 23:08:53', userName: '박진우', likedByMe: false, likeCount: 0, commentCount: 0, authorTierCode: 'DIAMOND', imageUrl: 'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { postId: 1, stockId: 0, userId: 2, opinion: 'Buy', content: 'yyy', createdAt: '2025-09-08 23:34:47', userName: 'test', likedByMe: false, likeCount: 0, commentCount: 0, authorTierCode: 'BRONZE', imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
]

const isLoggedIn = computed(() => !!(authStore.userInfo?.accessToken))
const hasAuth = computed(() => {
  try {
    if (authStore && authStore.isLoggedIn) return true
  } catch (e) {}
  if (authStore && authStore.userInfo?.accessToken) return true
  if (sessionStore && sessionStore.accessToken) return true
  if (sessionStore && sessionStore.user) return true
  return false
})

async function loadFeed() {
  if (isLoading.value) return
  isLoading.value = true
  const effectiveStockId = props.stockId ?? selectedStockId.value ?? TEST_DEFAULT_STOCK_ID
  try {
    const params = {}
    if (effectiveStockId != null) params.stockId = effectiveStockId
    const base = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api/v1/board/posts` : '/api/v1/board/posts'
    console.debug('[CommunityFeedView] requesting posts', { url: base, params })
    const { data } = await axios.get(base, { params, timeout: 8000 })
    const items = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : []
    if ((!items || items.length === 0) && import.meta.env.MODE === 'development') {
      posts.value = DEV_FALLBACK_POSTS
    } else {
      posts.value = items
    }
    error.value = null
    isInitialized.value = true
  } catch (err) {
    console.error('[CommunityFeedView] loadFeed failed', err)
    error.value = err
    if (isLoggedIn.value) {
      toastStore.pushToast({ message: 'Unable to load posts.', tone: 'error' })
    }
    posts.value = []
    isInitialized.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadFeed()
})

function requireLogin() {
  toastStore.pushToast({ message: LOGIN_REQUIRED_MESSAGE, tone: 'info' })
}

function notifyMaxChars() {
  toastStore.pushToast({ message: '최대 300자까지만 입력할 수 있어요.', tone: 'error' })
}

async function handleCreatePost() {
  if (!hasAuth.value) {
    // prefer a clear toast when auth missing and clear composer content
    toastStore.pushToast({ message: '로그인 후 사용해 주세요.', tone: 'info' })
    composerContent.value = ''
    selectedOpinion.value = ''
    return
  }
  const content = composerContent.value.trim()
  if (!selectedOpinion.value || !content) return
  try {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''
  const headers = {}
  // prefer token from authStore (populated by login), fallback to sessionStore
  const token = authStore.userInfo?.accessToken ?? sessionStore.accessToken
  if (token && token !== 'demo-access-token') headers.Authorization = `Bearer ${token}`
    const body = {
      stockId: props.stockId ?? selectedStockId.value ?? TEST_DEFAULT_STOCK_ID,
      opinion: selectedOpinion.value,
      content,
    }
    const { data } = await axios.post('/api/v1/board/posts', body, { headers })
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    const [created] = items
    if (created) posts.value = [created, ...posts.value]
    selectedOpinion.value = ''
    composerContent.value = ''
    toastStore.pushToast({ message: 'Post created.', tone: 'success' })
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
      toastStore.pushToast({ message: 'Enter some content before posting.', tone: 'warning' })
      return
    }
    toastStore.pushToast({ message: '로그인 후 사용해 주세요.', tone: 'error' })
    console.error(error)
  }
}

function handleSelectPost(post) {
  // always navigate to post detail; detail view will gate actions (like/comment) as needed
  router.push({ name: 'CommunityPostDetail', params: { postId: post.postId } })
}

async function handleLikePost(post) {
  if (!isLoggedIn.value) {
    requireLogin()
    return
  }
  try {
    const wasLiked = post.likedByMe
    // optimistic update
    post.likedByMe = !wasLiked
    post.likeCount += !wasLiked ? 1 : -1
  const headers = {}
  const token = authStore.userInfo?.accessToken ?? sessionStore.accessToken
  if (token && token !== 'demo-access-token') headers.Authorization = `Bearer ${token}`
  const { data } = await axios.post(`/api/v1/board/posts/${post.postId}/like`, null, { headers })
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data?.data) ? data.data : []
    const [result] = items
    if (result) {
      if (typeof result.likeCount === 'number') post.likeCount = result.likeCount
      if (typeof result.likedByMe === 'boolean') post.likedByMe = result.likedByMe
      if (typeof result.commentCount === 'number') post.commentCount = result.commentCount
    }
    toastStore.pushToast({
      message: wasLiked ? 'Like removed.' : 'Like added.',
      tone: wasLiked ? 'info' : 'success',
    })
  } catch (error) {
    // revert optimistic update
    post.likedByMe = wasLiked
    post.likeCount += wasLiked ? 1 : -1
    toastStore.pushToast({ message: 'Failed to update like.', tone: 'error' })
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
