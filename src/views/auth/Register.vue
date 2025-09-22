<template>
    <section class="card">
        <div class="back"> ← 돌아가기</div>

        <h1 class="main-title">Stock101에서</h1>
        <h1 class="main-title">투자 여정을 시작하세요</h1>
        <p class="sub">계정을 만들고 시장의 흐름을 함께 경험해보세요</p>

        <div>
            <form @submit.prevent="submitRegister" novalidate class="register-form">

                <div class="input-group">
                    <label for="register-name" class="input-label">이름</label>
                    <input type="text" id="register-name" v-model="name" required class="custom-input" />
                </div>
                
                <div class="input-group">
                    <label for="register-email" class="input-label">이메일</label>
                    <input type="email" id="register-email" v-model="email" required class="custom-input" />
                </div>

                <div class="input-group">
                    <label for="register-password" class="input-label">비밀번호</label>
                    <input type="password" id="register-password" v-model="password" required class="custom-input" />
                </div>
                
                <div class="input-group">
                    <label for="confirm-password" class="input-label">비밀번호 확인</label>
                    <input type="password" id="confirm-password" v-model="passwordConfirm" required class="custom-input" />
                </div>

                <div class="checkbox-group">
                    <input type="checkbox" id="terms-agree" v-model="termsAgreed" required class="custom-checkbox">
                    <label for="terms-agree" class="checkbox-label">약관 및 개인정보 처리 동의<span class="required-text">(필수)</span></label>
                </div>

                <div class="checkbox-group">
                    <input type="checkbox" id="newsletter-subscribe" v-model="newsletterSubscribed" class="custom-checkbox">
                    <label for="newsletter-subscribe" class="checkbox-label">뉴스레터 구독하고 똑똑한 투자 시작하기<span class="optional-text">(선택)</span></label>
                </div>
                
                <button type="submit" class="register-button" :disabled="!isFormValid">회원 가입</button>

                <p class="switch">계정이 있다면 <router-link :to="{ name: 'Login' }" class="login-link">로그인</router-link> 해주세요</p>
            </form>
        </div>
    </section>
</template>

<script setup>
import { ref, computed } from 'vue'; 

// 데이터 정의
const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const termsAgreed = ref(false);
const newsletterSubscribed = ref(false);

// 폼 유효성 검사 (예시)
const isFormValid = computed(() => {
    // 필수 필드 및 비밀번호 일치, 필수 약관 동의 검사
    return name.value && email.value && password.value && 
           (password.value === passwordConfirm.value) && termsAgreed.value;
});

// 회원가입 제출 함수
const submitRegister = () => {
    if (isFormValid.value) {
        console.log('회원가입 정보:', {
            name: name.value,
            email: email.value,
            password: password.value,
            newsletter: newsletterSubscribed.value
        });
        // 여기에 실제 회원가입 API 호출 로직을 구현하세요.
    } else {
        alert('필수 정보를 모두 입력하고 약관에 동의해주세요.');
    }
};
</script>

---

## 🎨 스타일링 (Scoped CSS)

```css
<style scoped>
/* 카드 컨테이너: 로그인 페이지와 동일한 스타일 유지 */
.card {
    max-width: 560px;
    margin: 20px auto;
    padding: 28px 24px;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    background: #fff;
    /* 회원가입은 폼 콘텐츠가 중앙이 아니므로 text-align: left를 기본으로 사용하고, 
       제목 부분만 중앙 정렬처럼 보이도록 조정합니다. */
}

/* 돌아가기 링크: 왼쪽 정렬 */
.back {
    text-align: left;
    margin-bottom: 8px;
    color: #6b7280;
    font-size: 14px;
    cursor: pointer;
}

/* 제목 및 부제목: 중앙 정렬 */
.main-title {
    font-size: 34px;
    line-height: 1.25;
    margin: 0;
    text-align: center; /* 제목 중앙 정렬 */
}

.sub {
    margin: 6px 0 24px;
    color: #6b7280;
    text-align: center; /* 부제목 중앙 정렬 */
}

/* 폼 그룹 */
.register-form {
    display: grid;
    gap: 20px; /* 섹션 간 간격 (입력 필드, 체크박스 등) */
    text-align: left; /* 폼 내부 요소 왼쪽 정렬 */
}

/* 입력 필드 그룹 */
.input-group {
    display: grid;
    gap: 8px;
}

/* 라벨 스타일 (필드 위에 위치) */
.input-label {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    padding-left: 2px; /* 살짝 들여쓰기 */
}

/* --- 입력 필드 스타일: 로그인 페이지와 일관성 유지 --- */
.custom-input {
    width: 100%;
    padding: 12px 16px; /* 내부 여백 */
    border: 1px solid #d1d5db; /* 연한 회색 테두리 */
    border-radius: 8px; /* 둥근 모서리 */
    font-size: 16px;
    box-sizing: border-box; 
    outline: none; 
    transition: border-color 0.2s; 
}

.custom-input:focus {
    border-color: #5a2c51; 
}


/* --- 체크박스 스타일 --- */
.checkbox-group {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: -5px; /* 입력 필드와의 간격 조정 */
}

.custom-checkbox {
    /* 기본 체크박스 스타일 재정의 (필요에 따라 더 커스텀 가능) */
    width: 16px;
    height: 16px;
    /* 여기에 커스텀 체크박스 스타일을 더 추가할 수 있습니다. */
}

.checkbox-label {
    font-size: 14px;
    color: #333;
    cursor: pointer;
}

.required-text {
    color: #9ca3af; /* 필수 텍스트 색상 */
    font-weight: 400;
}

.optional-text {
    color: #9ca3af; /* 선택 텍스트 색상 */
    font-weight: 400;
}


/* --- 회원가입 버튼 스타일: 로그인 버튼과 일관성 유지 --- */
.register-button {
    width: 100%;
    padding: 14px 20px;
    border: none;
    border-radius: 8px;
    background-color: #3f1e38; 
    color: white;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    margin-top: 8px; 
    transition: background-color 0.2s;
}

.register-button:hover:not(:disabled) {
    background-color: #5a2c51; /* 호버 시 색상 변화 */
}

.register-button:disabled {
    background-color: #a3a3a3; /* 비활성화 시 색상 */
    cursor: not-allowed;
}


/* --- 로그인 이동 링크 --- */
.switch {
    margin-top: 12px;
    text-align: center; /* 중앙 정렬 */
    color: #6b7280;
    font-size: 14px;
}

.login-link {
    color: #3f1e38; /* 링크 색상 */
    text-decoration: none;
    font-weight: 600;
}
</style>