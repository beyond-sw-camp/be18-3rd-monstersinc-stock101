import { reactive } from "vue";
import { defineStore } from "pinia";
import apiClient from "@/api";
import router from "@/router";

export const useAuthStore = defineStore('auth', () => {
    const tokenInfo = reactive({
        accessToken: localStorage.getItem('authToken') || '',
        userId: localStorage.getItem('userId') || 0,
        type: '',
        roles: [],
        issuedAt: 0,
        expiresAt: 0
    });

    const login = async (email, password) => {
        try {
            const response = await apiClient.post('/api/v1/auth/login', { email, password });
            console.log(response.data);

            const tokenData = response.data.items[0];
            Object.assign(tokenInfo, tokenData)
            localStorage.setItem('authToken', tokenData.accessToken);
            localStorage.setItem('userId', tokenData.userId);
            return {success: true};
            

        } catch (error) {
            if (error.response && error.response.status === 404) {
                return { success: false, message: '이메일 또는 비밀번호를 확인하세요.' };

            }
            else {
                return { success: false, message: '로그인 중 오류가 발생했습니다.' };

            }
        }

    }

    const logout = () => {
        Object.assign(tokenInfo, {
            accessToken: '', userId: 0, type: '', roles: [], issuedAt: 0, expiresAt: 0
        });
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        console.log("로그아웃 액션 실행됨. tokenInfo:", tokenInfo, "localStorage authToken:", localStorage.getItem('authToken'));

    }
    return { tokenInfo, login, logout };

})