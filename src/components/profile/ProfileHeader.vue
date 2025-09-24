<template>
  <section class="profile-header">
    <div class="profile-header__avatar" aria-hidden="true">
      <img v-if="user.imageUrl || user.avatarUrl" :src="user.imageUrl || user.avatarUrl" :alt="`${user.name} 아바타`" />
      <div v-else class="profile-header__avatar--placeholder"></div>
    </div>
    <div class="profile-header__details">
      <div class="profile-header__name-row">
        <h2 class="profile-header__name">{{ user.name }}</h2>
        <img
          v-if="tierBadgeSrc"
          :src="tierBadgeSrc"
          :alt="`${user.tierCode || 'BRONZE'} 등급 배지`"
          class="profile-header__tier-badge"
          loading="lazy"
          decoding="async"
        />
        <span v-if="user.badge" class="profile-header__badge">{{ user.badge }}</span>
      </div>
      <p class="profile-header__status">{{ user.statusMessage }}</p>
    </div>
    <button v-if="showEditButton" type="button" class="profile-header__action">수정하기</button>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { getTierBadgeSrc } from '@/utils/tierBadge'

const props = defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({ name: '', statusMessage: '' }),
  },
  isOwner: {
    type: Boolean,
    default: false,
  },
  currentUser: {
    type: Object,
    default: null,
  },
})

const tierBadgeSrc = computed(() => {
  if (!props.user?.tierCode) {
    return getTierBadgeSrc('BRONZE')
  }
  return getTierBadgeSrc(props.user.tierCode)
})

const showEditButton = computed(() => {
  // Show edit button only if current user exists and is viewing their own profile
  if (!props.currentUser) {
    return false
  }
  return props.currentUser.id === props.user.id || props.isOwner
})
</script>

<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  border: 1px solid #e6e8ec;
  border-radius: 24px;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}

.profile-header__avatar {
  width: 96px;
  height: 96px;
  flex-shrink: 0;
}

.profile-header__avatar img,
.profile-header__avatar--placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background: linear-gradient(135deg, #e5e7eb, #f3f4f6);
}

.profile-header__details {
  flex: 1;
  min-width: 0;
}

.profile-header__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.profile-header__name {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.profile-header__tier-badge {
  width: 28px;
  height: 28px;
  object-fit: contain;
  margin-left: 4px;
}

.profile-header__badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  color: #2563eb;
  background-color: rgba(37, 99, 235, 0.12);
}

.profile-header__status {
  color: #4b5563;
  font-size: 15px;
  line-height: 1.5;
}

.profile-header__action {
  margin-left: auto;
  padding: 10px 18px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  background-color: #f9fafb;
  font-weight: 500;
  font-size: 14px;
  color: #1f2937;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.profile-header__action:hover {
  background-color: #2563eb;
  border-color: #2563eb;
  color: #fff;
}
</style>
