<template>
  <div class="profile-page">
    <button type="button" class="profile-page__back">← 돌아가기</button>
    <h1 class="profile-page__title">{{ pageTitle }}</h1>

    <ProfileStats :summary="summary" :active-filter="resultFilter" @filter-change="handleFilterChange" />

    <ProfileHeader :user="profile.user" :is-owner="isOwner" :current-user="currentUser" class="profile-page__header" />

    <ProfileTabs v-model="activeTab" :user="profile.user" />

    <section v-if="activeTab === 'predictions'" class="profile-page__section">
      <div v-if="loading" class="profile-page__loading">
        <p>데이터를 불러오는 중...</p>
      </div>

      <!-- Always show PredictionSummaryCard in grid layout -->
      <div v-else class="profile-page__list profile-page__list--grid">
        <PredictionSummaryCard
          v-for="prediction in filteredPredictions"
          :key="prediction.predictionId"
          :prediction="prediction"
        />
      </div>

            <div v-if="!loading && filteredPredictions.length === 0" class="profile-page__empty">
        <p>해당 조건에 맞는 예측이 없습니다.</p>
      </div>
    </section>

    <section v-else class="profile-page__section">
      <div class="profile-page__list profile-page__list--stack">
        <PostCard v-for="post in profile.posts" :key="post.postId" :post="post" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import ProfileStats from '@/components/profile/ProfileStats.vue'
import ProfileTabs from '@/components/profile/ProfileTabs.vue'
import PredictionSummaryCard from '@/components/predictions/PredictionSummaryCard.vue'
import PostCard from '@/components/posts/PostCard.vue'
import { getUserPredictions, getUserPredictionsById, transformPredictionData } from '@/services/predictionApi'
import { myProfile, otherProfile, calculatePredictionSummary } from '@/data/profileDemo'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

const profile = ref({
  user: myProfile.user,
  predictions: [],
  posts: myProfile.posts
})

// Computed properties based on route parameters and auth status
const userId = computed(() => {
  // Check if we're on the /profile/me route
  if (route.path === '/profile/me') {
    return 'me'
  }

  // Check if we have an ID parameter from /profile/:id
  if (route.params.id) {
    return route.params.id
  }

  // If no one is logged in, default to user ID 1
  if (!authStore.userInfo?.accessToken || !authStore.userInfo?.userId) {
    return '1'
  }

  // Default fallback
  return 'me'
})

const tab = computed(() => route.query.tab || 'predictions')

const isOwner = computed(() => {
  // If no one is logged in, no one is the owner
  if (!authStore.userInfo?.accessToken || !authStore.userInfo?.userId) {
    return false
  }
  // Check if viewing own profile - either /profile/me or /profile/{myId}
  return userId.value === 'me' || userId.value === String(authStore.userInfo.userId)
})

const pageTitle = computed(() => {
  if (!authStore.userInfo?.accessToken || !authStore.userInfo?.userId) {
    return '사용자 프로필'
  }
  return isOwner.value ? '나의 프로필' : '사용자 프로필'
})

const currentUser = computed(() => {
  if (!authStore.userInfo?.accessToken || !authStore.userInfo?.userId) {
    return null
  }
  return {
    id: authStore.userInfo.userId,
    name: authStore.userInfo.userName || 'Current User',
    email: authStore.userInfo.email || '',
    tierCode: authStore.userInfo.tierCode || 'BRONZE',
  }
})

const defaultTab = computed(() => tab.value)

const enableFilters = computed(() =>
  // Only enable filters for own profile or when viewing other user's predictions
  isOwner.value || tab.value === 'predictions'
)

// UI state management (merged from ProfilePageLayout)
const activeTab = ref(defaultTab.value)
const resultFilter = ref('all')

// Watch for tab changes from query params
watch(
  () => defaultTab.value,
  (newValue) => {
    activeTab.value = newValue
  },
)

// Summary computation (merged from ProfilePageLayout)
const summary = computed(() => {
  if (!profile.value?.predictions) {
    return { total: 0, success: 0, failure: 0, pending: 0, accuracy: 0 }
  }
  return calculatePredictionSummary(profile.value.predictions)
})

// Filter handling (merged from ProfilePageLayout)
const handleFilterChange = (filterKey) => {
  resultFilter.value = filterKey
}

const filteredPredictions = computed(() => {
  if (!profile.value?.predictions) {
    return []
  }

  if (resultFilter.value === 'all') {
    return profile.value.predictions
  }
  if (resultFilter.value === 'PENDING') {
    // 결과 대기: result가 null인 경우
    return profile.value.predictions.filter((item) => item.result === null || item.result === 'PENDING')
  }
  if (resultFilter.value === 'SUCCESS') {
    // 예측 성공: result가 "SUCCESS"인 경우
    return profile.value.predictions.filter((item) => item.result === 'SUCCESS')
  }
  if (resultFilter.value === 'FAILURE') {
    // 예측 실패: result가 "FAILURE"인 경우
    return profile.value.predictions.filter((item) => item.result === 'FAILURE')
  }
  return profile.value.predictions
})

// Function to update URL when tab changes
const updateTabInUrl = (newTab) => {
  const currentPath = route.path
  const query = { ...route.query }

  if (newTab === 'predictions') {
    // Remove tab query if it's the default
    delete query.tab
  } else {
    query.tab = newTab
  }

  router.push({
    path: currentPath,
    query: Object.keys(query).length > 0 ? query : undefined
  })
}

const fetchUserInfo = async (targetUserId) => {
  try {
    // Check if user is logged in
    if (authStore.userInfo?.accessToken) {
      // User is logged in
      if (targetUserId === 'me') {
        // Current user accessing /profile/me - fetch their data using their actual ID
        const actualUserId = authStore.userInfo.userId
        console.log('Fetching current user data from API using ID:', actualUserId)
        const response = await axios.get(`http://localhost:8080/api/v1/users/${actualUserId}`)
        const userData = response.data.items[0]
        profile.value.user = {
          id: userData.userId,
          name: userData.name,
          email: userData.email,
          tierCode: userData.tierCode,
          statusMessage: userData.statusMessage,
          imageUrl: userData.imageUrl
        }
      } else if (targetUserId === String(authStore.userInfo.userId)) {
        // Current user accessing /profile/{theirId} - same as above
        console.log('Fetching current user data from API using ID:', targetUserId)
        const response = await axios.get(`http://localhost:8080/api/v1/users/${targetUserId}`)
        const userData = response.data.items[0]
        profile.value.user = {
          id: userData.userId,
          name: userData.name,
          email: userData.email,
          tierCode: userData.tierCode,
          statusMessage: userData.statusMessage,
          imageUrl: userData.imageUrl
        }
      } else {
        // Other user - fetch from API
        console.log('Fetching user info from API for user:', targetUserId)
        const response = await axios.get(`http://localhost:8080/api/v1/users/${targetUserId}`)
        const userData = response.data.items[0]
        profile.value.user = {
          id: userData.userId,
          name: userData.name,
          email: userData.email,
          tierCode: userData.tierCode,
          statusMessage: userData.statusMessage,
          imageUrl: userData.imageUrl
        }
      }
    } else {
      // No one logged in - fetch user info from API
      console.log('No user logged in, fetching user info from API for user:', targetUserId)
      const response = await axios.get(`http://localhost:8080/api/v1/users/${targetUserId}`)
      const userData = response.data.items[0]
      profile.value.user = {
        id: userData.userId,
        name: userData.name,
        email: userData.email,
        tierCode: userData.tierCode,
        statusMessage: userData.statusMessage,
        imageUrl: userData.imageUrl
      }
    }
    console.log('User info updated:', profile.value.user.name)
  } catch (error) {
    console.error('Failed to fetch user info:', error)
    // Fallback to mock data
    const fallbackUser = (targetUserId === 'me' || targetUserId === '1') ? myProfile.user : otherProfile.user
    profile.value.user = { ...fallbackUser, id: targetUserId }
  }
}

const fetchPredictions = async (targetUserId) => {
  loading.value = true
  console.log('fetchPredictions called with targetUserId:', targetUserId)
  try {
    let response

    // Check if user is logged in
    if (!authStore.userInfo?.accessToken || !authStore.userInfo?.userId) {
      // No one logged in - fetch data for specific user using axios
      console.log('No user logged in, fetching predictions for user ID:', targetUserId)
      response = await axios.get(`http://localhost:8080/api/v1/prediction/user/${targetUserId}`)
    } else {
      // User is logged in - use existing API service
      if (targetUserId === 'me') {
        // Use the authenticated API call for current user
        console.log('Fetching predictions for authenticated user via API service')
        response = await getUserPredictions()
      } else {
        // Fetch other user's predictions
        console.log('Fetching predictions for other user:', targetUserId)
        response = await getUserPredictionsById(targetUserId)
      }
    }

    const transformedPredictions = transformPredictionData(response.data || response)
    profile.value.predictions = transformedPredictions
    console.log('Transformed predictions:', transformedPredictions.length, 'items')

    // Fetch user info separately
    await fetchUserInfo(targetUserId)

    // Set posts (mock data for now)
    if (isOwner.value) {
      profile.value.posts = myProfile.posts
    } else {
      profile.value.posts = otherProfile.posts
    }
  } catch (error) {
    console.error('Failed to fetch predictions:', error)
    // Fallback to mock data on error
    const fallbackProfile = (targetUserId === 'me' || targetUserId === '1') ? myProfile : otherProfile
    profile.value = { ...fallbackProfile }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('ProfileView mounted, route:', route.path, route.params, 'userId:', userId.value)
  fetchPredictions(userId.value)
})

// Watch for route parameter changes
watch(
  () => [route.params.id, route.path],
  () => {
    fetchPredictions(userId.value)
  }
)

// Watch for tab changes (in case we need to fetch different data)
watch(
  () => tab.value,
  (newTab) => {
    // For future enhancement: fetch different data based on tab
    console.log('Tab changed to:', newTab)
  }
)

// Watch for auth state changes
watch(
  () => authStore.userInfo?.accessToken,
  () => {
    // Refetch data when user logs in/out
    fetchPredictions(userId.value)
  }
)
</script>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 40px;
  max-width: 980px;
  margin: 0 auto;
}

.profile-page__back {
  align-self: flex-start;
  font-size: 14px;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
}

.profile-page__title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.profile-page__header {
  margin-top: -12px;
}

.profile-page__section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-page__list {
  display: grid;
  gap: 20px;
}

.profile-page__list--stack {
  grid-template-columns: 1fr;
}

.profile-page__list--grid {
  grid-template-columns: 1fr 1fr;
}

.profile-page__loading,
.profile-page__empty {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.profile-page__loading p,
.profile-page__empty p {
  margin: 0;
  font-size: 16px;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 24px;
  }

  .profile-page__title {
    font-size: 26px;
  }

  .profile-page__list--grid {
    grid-template-columns: 1fr;
  }
}
</style>