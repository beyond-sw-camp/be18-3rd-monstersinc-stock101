<template>
  <article class="prediction-summary">
    <div class="prediction-summary__info">
      <h3 class="prediction-summary__symbol">{{ prediction.stockName }}</h3>
      <p class="prediction-summary__timestamp">{{ formattedDate }}</p>
    </div>
    <span class="prediction-summary__badge" :class="badgeClass">
      {{ prediction.prediction === 'UP' ? 'UP' : 'DOWN' }}
    </span>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  prediction: {
    type: Object,
    required: true,
  },
})

const formattedDate = computed(() => {
  const value = props.prediction.predictedAt
  if (!(value instanceof Date)) {
    return new Date(value).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return value.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const badgeClass = computed(() =>
  props.prediction.prediction === 'UP' ? 'prediction-summary__badge--up' : 'prediction-summary__badge--down',
)
</script>

<style scoped>
.prediction-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background-color: #fff;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.05);
}

.prediction-summary__info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.prediction-summary__symbol {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #111827;
}

.prediction-summary__timestamp {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.prediction-summary__badge {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background-color: #f3f4f6;
  color: #111827;
}

.prediction-summary__badge--up {
  background-color: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}

.prediction-summary__badge--down {
  background-color: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}
</style>
