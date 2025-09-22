<template>
  <ProfilePageLayout
    :profile="profile"
    title="사용자 프로필"
    default-tab="posts"
    view-mode="feed"
    :enable-filters="false"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ProfilePageLayout from './ProfilePageLayout.vue'
import { otherProfile, myProfile } from '@/data/profileDemo'

const route = useRoute()

const profile = computed(() => (route.params.id === '1' ? myProfile : otherProfile))
</script>
