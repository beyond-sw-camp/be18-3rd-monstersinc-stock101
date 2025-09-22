<template>
  <ProfilePageLayout
    :profile="profile"
    :is-owner="true"
    title="나의 프로필"
    view-mode="summary"
    default-filter="SUCCESS"
  />
</template>

<script setup>
import ProfilePageLayout from './ProfilePageLayout.vue'
import { myProfile } from '@/data/profileDemo'

const profile = myProfile
</script>
