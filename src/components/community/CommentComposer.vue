<template>
  <div class="comment-composer" :class="{ 'comment-composer--locked': !isLoggedIn }">
    <input
      ref="inputRef"
      type="text"
      class="comment-composer__input"
      :value="modelValue"
      :readonly="!isLoggedIn || disabled"
      :placeholder="isLoggedIn ? '의견을 남겨주세요' : '로그인 후 사용해 주세요'"
      @input="handleInput"
      @keyup.enter="handleSubmit"
    />
    <button type="button" class="comment-composer__button" :disabled="!canSubmit" @click="handleSubmit">
      등록하기
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  isLoggedIn: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  maxLength: {
    type: Number,
    default: 300,
  },
})

const emit = defineEmits(['update:modelValue', 'submit', 'exceed'])

const inputRef = ref(null)

const canSubmit = computed(() => props.isLoggedIn && !props.disabled && props.modelValue.trim().length > 0)

function handleInput(event) {
  if (!props.isLoggedIn || props.disabled) {
    event.target.value = props.modelValue
    return
  }
  const value = event.target.value
  if (value.length > props.maxLength) {
    event.target.value = value.slice(0, props.maxLength)
    emit('update:modelValue', event.target.value)
    emit('exceed')
    return
  }
  emit('update:modelValue', value)
}

function handleSubmit() {
  if (!canSubmit.value) return
  emit('submit')
}
</script>

<style scoped>
.comment-composer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 14px;
  padding: 18px;
  border-radius: 18px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
}

.comment-composer--locked {
  border-color: #303047;
  background-color: #75748b;
}

.comment-composer__input {
  border: none;
  background: transparent;
  font-size: 15px;
  color: #111827;
}

.comment-composer__input:read-only {
  cursor: not-allowed;
  color: #111827;
}

.comment-composer__input::placeholder {
  color: rgba(17, 24, 39, 0.5);
}

.comment-composer__button {
  min-width: 96px;
  padding: 12px 20px;
  border-radius: 14px;
  border: none;
  background-color: #14122a;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.comment-composer__button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.comment-composer__button:not(:disabled):hover {
  background-color: #1d1a3b;
}
</style>
