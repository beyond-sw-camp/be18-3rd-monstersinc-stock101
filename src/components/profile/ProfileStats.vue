<template>
  <div class="profile-stats">
    <div v-for="card in cards" :key="card.key" class="profile-stats__card">
      <span class="profile-stats__label">{{ card.label }}</span>
      <span class="profile-stats__value" :class="card.accent">{{ card.value }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  summary: {
    type: Object,
    required: true,
    validator(value) {
      return (
        typeof value.total === 'number' &&
        typeof value.success === 'number' &&
        typeof value.failure === 'number' &&
        typeof value.pending === 'number' &&
        typeof value.accuracy === 'number'
      )
    },
  },
})

const cards = computed(() => [
  { key: 'total', label: '전체', value: props.summary.total, accent: 'accent-neutral' },
  { key: 'success', label: '예측 성공', value: props.summary.success, accent: 'accent-positive' },
  { key: 'failure', label: '예측 실패', value: props.summary.failure, accent: 'accent-negative' },
  { key: 'pending', label: '결과 대기', value: props.summary.pending, accent: 'accent-info' },
  {
    key: 'accuracy',
    label: '정확도',
    value: `${props.summary.accuracy.toFixed(0)}%`,
    accent: 'accent-neutral',
  },
])
</script>

<style scoped>
.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  width: 100%;
}

.profile-stats__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 20px 12px;
  border: 1px solid #e6e8ec;
  border-radius: 16px;
  background-color: #fff;
  text-align: center;
  box-shadow: 0 3px 8px rgba(15, 23, 42, 0.04);
}

.profile-stats__label {
  font-size: 14px;
  color: #697489;
}

.profile-stats__value {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.profile-stats__value.accent-positive {
  color: #22c55e;
}

.profile-stats__value.accent-negative {
  color: #ef4444;
}

.profile-stats__value.accent-info {
  color: #2563eb;
}
</style>
