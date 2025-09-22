<template>
    <!-- 이건 무슨 의미인가 입력값에 따라 여러 클래스를 동적으로 붙임-->
    <div class="fld" :class="[{ 'fld--invalid': !!error, 'fld--block': block }, `fld--${size}`]">
        <label v-if = "label" :for="controlId" class="fid__">

        </label>

    </div>
</template>


<script setup>
import { computed } from 'vue';

defineProps({
    id: String,
    label: String,
    help: String,
    error: String,
    required: Boolean,
    block: {type:Boolean, default: true},
    size : {type: String, default:'md'}
})


</script>

<style scoped>
.fld { display: flex; flex-direction: column; gap: .5rem; }
.fld--block { width: 100%; }
.fld__label { font-size: .875rem; color: #6b7280; }
.fld__req { color: #ef4444; margin-left: .25rem; }
.fld__control { display: flex; align-items: center; gap: .5rem; }
.fld__help { font-size: .75rem; color: #6b7280; }
.fld__error { font-size: .75rem; color: #ef4444; }
.fld--invalid .fld__label { color: #ef4444; }

/* size 프리셋 */
.fld--sm .fld__label { font-size: .8125rem; }
.fld--lg .fld__label { font-size: .9375rem; }
</style>