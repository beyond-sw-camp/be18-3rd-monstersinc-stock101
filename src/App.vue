<template>
  <div class="app-shell">
    <header class="app-shell__header">
      <h1 class="app-shell__brand">Stock101 Demo</h1>
      <nav class="app-shell__nav">
        <RouterLink to="/profile/me/predictions">내 프로필 (전체)</RouterLink>
        <RouterLink to="/profile/me/predictions/success">내 프로필 (성공)</RouterLink>
        <RouterLink to="/profile/users/2/predictions">다른 사용자 예측</RouterLink>
        <RouterLink to="/profile/users/2/posts">다른 사용자 게시물</RouterLink>
        <RouterLink to="/community">커뮤니티 대화</RouterLink>
        <RouterLink :to="{ name: 'userRegister' }">회원가입</RouterLink>
        <RouterLink :to="{ name: 'userLogin' }">로그인</RouterLink>
      </nav>
    </header>
    <main class="app-shell__main">
      <RouterView />
    </main>
    <ToastHost />
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
import ToastHost from '@/components/shared/ToastHost.vue'
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background-color: #f5f6f8;
}

.app-shell__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 40px;
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.app-shell__brand {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.app-shell__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.app-shell__nav a {
  font-size: 14px;
  color: #2563eb;
  text-decoration: none;
}

.app-shell__nav a.router-link-active {
  font-weight: 600;
}

.app-shell__main {
  padding: 24px 0 60px;
}

@media (max-width: 768px) {
  .app-shell__header {
    padding: 16px 20px;
  }
}
</style>
