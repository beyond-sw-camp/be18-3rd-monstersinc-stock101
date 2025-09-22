<template>
  <ProfilePageLayout
    :profile="profile"
    title="사용자 프로필"
    view-mode="summary"
    default-filter="SUCCESS"
    :enable-filters="false"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ProfilePageLayout from './ProfilePageLayout.vue'
import { otherProfile, myProfile } from '@/data/profileDemo'

const route = useRoute()

const profile = computed(() => {
  // 간단한 데모를 위해 로그인 사용자 ID(1)와 다른 사용자 ID(2)를 구분합니다.
  return route.params.id === '1' ? myProfile : otherProfile
})
</script>
