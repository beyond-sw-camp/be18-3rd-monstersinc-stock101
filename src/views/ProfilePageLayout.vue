<template>
  <div class="profile-page">
    <button type="button" class="profile-page__back">← 돌아가기</button>
    <h1 class="profile-page__title">{{ title }}</h1>

    <ProfileStats :summary="summary" />

    <ProfileHeader :user="profile.user" :is-owner="isOwner" class="profile-page__header" />

    <ProfileTabs v-model="activeTab" />

    <section v-if="activeTab === 'predictions'" class="profile-page__section">
      <PredictionFilters v-if="enableFilters" v-model="resultFilter" />

      <div v-if="viewMode === 'feed'" class="profile-page__list profile-page__list--stack">
        <PredictionCard v-for="prediction in filteredPredictions" :key="prediction.predictionId" :prediction="prediction" />
      </div>

      <div v-else class="profile-page__list profile-page__list--grid">
        <PredictionSummaryCard
          v-for="prediction in filteredPredictions"
          :key="prediction.predictionId"
          :prediction="prediction"
        />
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
import { computed, ref, watch } from 'vue'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import ProfileStats from '@/components/profile/ProfileStats.vue'
import ProfileTabs from '@/components/profile/ProfileTabs.vue'
import PredictionFilters from '@/components/predictions/PredictionFilters.vue'
import PredictionCard from '@/components/predictions/PredictionCard.vue'
import PredictionSummaryCard from '@/components/predictions/PredictionSummaryCard.vue'
import PostCard from '@/components/posts/PostCard.vue'
import { calculatePredictionSummary } from '@/data/profileDemo'

const props = defineProps({
  profile: {
    type: Object,
    required: true,
  },
  isOwner: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '나의 프로필',
  },
  defaultTab: {
    type: String,
    default: 'predictions',
  },
  defaultFilter: {
    type: String,
    default: 'all',
  },
  viewMode: {
    type: String,
    default: 'feed',
    validator: (value) => ['feed', 'summary'].includes(value),
  },
  enableFilters: {
    type: Boolean,
    default: true,
  },
})

const activeTab = ref(props.defaultTab)
const resultFilter = ref(props.defaultFilter)

watch(
  () => props.defaultTab,
  (newValue) => {
    activeTab.value = newValue
  },
)

watch(
  () => props.defaultFilter,
  (newValue) => {
    resultFilter.value = newValue
  },
)

const summary = computed(() => calculatePredictionSummary(props.profile.predictions))

const filteredPredictions = computed(() => {
  if (resultFilter.value === 'all') {
    return props.profile.predictions
  }
  if (resultFilter.value === 'PENDING') {
    return props.profile.predictions.filter((item) => !item.result || item.result === 'PENDING')
  }
  return props.profile.predictions.filter((item) => item.result === resultFilter.value)
})
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
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

@media (max-width: 768px) {
  .profile-page {
    padding: 24px;
  }

  .profile-page__title {
    font-size: 26px;
  }
}
</style>
