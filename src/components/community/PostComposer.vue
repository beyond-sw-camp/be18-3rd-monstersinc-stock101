<template>
  <section class="post-composer">
    <header class="post-composer__header">
      <h2 class="post-composer__title">지금 당신의 생각을 남겨보세요</h2>
    </header>

    <OpinionSelector v-model="opinionProxy" :disabled="!isLoggedIn || disabled" />

    <div class="post-composer__textarea-wrapper" :class="{ 'post-composer__textarea-wrapper--locked': !isLoggedIn }">
      <textarea
        ref="textareaRef"
        class="post-composer__textarea"
        :placeholder="isLoggedIn ? '내용을 입력해 주세요.' : '로그인 후 사용해 주세요.'"
        :value="content"
        :maxlength="maxLength"
        :readonly="disabled || !isLoggedIn"
        @input="handleInput"
      ></textarea>
    </div>

    <footer class="post-composer__footer">
      <span class="post-composer__counter">{{ content.length }}/{{ maxLength }}</span>
      <button type="button" class="post-composer__submit" :disabled="!canSubmit" @click="handleSubmit">
        등록하기
      </button>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import OpinionSelector from './OpinionSelector.vue'

const props = defineProps({
  opinion: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  maxLength: {
    type: Number,
    default: 300,
  },
  isLoggedIn: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:opinion', 'update:content', 'submit', 'exceed'])

const textareaRef = ref(null)

const opinionProxy = computed({
  get: () => props.opinion,
  set: (value) => emit('update:opinion', value),
})

const content = computed(() => props.content)

const canSubmit = computed(() => props.isLoggedIn && !props.disabled && props.opinion && props.content.trim().length > 0)

function handleInput(event) {
  if (!props.isLoggedIn || props.disabled) {
    event.target.value = props.content
    return
  }
  const nextValue = event.target.value
  if (nextValue.length > props.maxLength) {
    event.target.value = nextValue.slice(0, props.maxLength)
    emit('update:content', event.target.value)
    emit('exceed')
    if (textareaRef.value) {
      textareaRef.value.scrollTop = textareaRef.value.scrollHeight
    }
    return
  }
  emit('update:content', nextValue)
}

function handleSubmit() {
  if (!canSubmit.value) return
  emit('submit')
}
</script>

<style scoped>
.post-composer {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  border-radius: 24px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
}

.post-composer__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.post-composer__textarea-wrapper {
  position: relative;
  border-radius: 20px;
  border: 1px solid #d1d5db;
  background-color: #f9fafb;
  overflow: hidden;
}

.post-composer__textarea-wrapper--locked {
  background-color: #75748b;
  border-color: #303047;
}

.post-composer__textarea {
  width: 100%;
  min-height: 160px;
  padding: 18px 20px;
  border: none;
  background: transparent;
  font-size: 15px;
  line-height: 1.5;
  color: #1f2937;
  resize: vertical;
}

.post-composer__textarea::placeholder {
  color: rgba(17, 24, 39, 0.5);
}

.post-composer__textarea:read-only {
  cursor: not-allowed;
  color: #111827;
}

.post-composer__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.post-composer__counter {
  font-size: 13px;
  color: #6b7280;
}

.post-composer__submit {
  min-width: 96px;
  padding: 12px 20px;
  border-radius: 14px;
  border: none;
  background-color: #14122a;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.post-composer__submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.post-composer__submit:not(:disabled):hover {
  background-color: #1d1a3b;
}
</style>
