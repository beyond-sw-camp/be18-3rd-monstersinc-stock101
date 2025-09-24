<template>
  <div class="community-feed">
    <button type="button" class="community-feed__back" @click="handleBack">Back</button>
    <h1 class="community-feed__title">Community Feed</h1>

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
import { fetchPosts } from '@/services/communityApi'
import { useCommunityFeedStore } from '@/stores/communityFeed'
import { useSessionStore } from '@/stores/session'
import { useToastStore } from '@/stores/toast'
import axios from 'axios'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const LOGIN_REQUIRED_MESSAGE = '\ub85c\uadf8\uc778 \ud6c4 \uc774\uc6a9\ud574 \uc8fc\uc138\uc694'

const router = useRouter()
const feedStore = useCommunityFeedStore()
const sessionStore = useSessionStore()
const toastStore = useToastStore()


const props = defineProps({
  stockId: {
    type: Number,
    default: null,
  },
})
// for quick local testing default to 1001 when neither prop nor store provides it
const TEST_DEFAULT_STOCK_ID = 1001

// use relative path so Vite dev server proxy (vite.config) forwards /api requests to backend (port 8080)

const { posts, selectedStockId } = storeToRefs(feedStore)

const selectedOpinion = ref('')
const composerContent = ref('')

const isLoggedIn = computed(() => sessionStore.isLoggedIn)

async function loadFeed() {
  if (feedStore.isLoading) return
  feedStore.isLoading = true
  // determine effective stockId to request (prop -> store -> test default)
  const effectiveStockId = props.stockId ?? selectedStockId.value ?? TEST_DEFAULT_STOCK_ID
  try {
    const headers = {}
    if (sessionStore.accessToken) {
      headers.Authorization = `Bearer ${sessionStore.accessToken}`
    }
    const params = {}
    if (effectiveStockId != null) params.stockId = effectiveStockId
    console.debug('[CommunityFeedView] requesting posts', { url: '/api/v1/board/posts', headers, params })
  // send request via Vite proxy (relative path) so browser CORS isn't an issue
  const { data } = await axios.get('/api/v1/board/posts', { headers, params })
    const items = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : []
    // Always set posts (may be empty). Do not treat empty list as an error.
    feedStore.posts = items
    feedStore.error = null
    feedStore.isInitialized = true
  } catch (error) {
    console.error('[CommunityFeedView] loadFeed failed', error)
    feedStore.error = error
    if (isLoggedIn.value) {
      toastStore.pushToast({ message: 'Unable to load posts.', tone: 'error' })
    }
    // Try fallback (local/mock) with the same effective stockId
    try {
      const fallback = await fetchPosts({ token: sessionStore.accessToken, stockId: effectiveStockId })
      feedStore.posts = fallback.items
      feedStore.error = null
      feedStore.isInitialized = true
    } catch (fallbackError) {
      console.error('[CommunityFeedView] fallback load failed', fallbackError)
    }
  } finally {
    feedStore.isLoading = false
  }
}

onMounted(() => {
  loadFeed()
})

function requireLogin() {
  toastStore.pushToast({ message: LOGIN_REQUIRED_MESSAGE, tone: 'info' })
}

function notifyMaxChars() {
  toastStore.pushToast({ message: 'You can enter up to 300 characters.', tone: 'error' })
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
    toastStore.pushToast({ message: 'Failed to create the post. Please try again.', tone: 'error' })
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
    const wasLiked = post.likedByMe
    await feedStore.toggleLike(post.postId)
    toastStore.pushToast({
      message: wasLiked ? 'Like removed.' : 'Like added.',
      tone: wasLiked ? 'info' : 'success',
    })
  } catch (error) {
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
