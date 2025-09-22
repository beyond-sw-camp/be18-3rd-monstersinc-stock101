<template>
    <section class="page">
        <!-- 헤더 -->
        <header class="hero">
            <div class="hero__left">
                <h1>Stock 101</h1>
                <p class="tagline">시장의 지표들을 한눈에 찾아보고, 새로운 투자 관점을 탐험해보세요.</p>
            </div>
            <button type="button" @click="goRegister">회원가입</button>
            <button type="button" @click="goLogin">로그인</button>
            
            <!-- <button type="button">내 정보</button>
            <button type="button">로그아웃</button> -->

            <!-- <div class="hero__actions">
            
                <template v-if="!authStore.tokenInfo.accessToken">
                    <BaseButton class="btn" @click="goRegister">회원 가입</BaseButton>
                    <BaseButton class="btn btn--primary" @click="goLogin">로그인</BaseButton>
                </template>
                <template v-else>.
                    <BaseButton class="btn" @click="goProfile({id:'me'})">내 정보</BaseButton>
                    <BaseButton class="btn btn--primary" @click="goLogout">로그아웃</BaseButton>
                </template>
            </div> -->
        </header>
    </section>
</template>

<script setup>

</script>

<style scoped>
.page { padding: 28px 20px 40px; display: grid; gap: 28px; }
.hero { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
.hero__left h1 { margin: 0 0 6px; font-size: 32px; }
.tagline { margin: 0; color:#6b7280; }
.hero__actions { display:flex; gap:8px; align-items:center; }
.btn { border-radius:999px; padding:10px 16px; background:#eef2f7; border:1px solid #e5e7eb; }
.btn--primary { background:#111827; color:#fff; border-color:#111827; }

.sec { display: grid; gap: 12px; }
.sec__title { font-size: 18px; margin: 0; }

.news-col { display:grid; gap: 12px; }
</style>