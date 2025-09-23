import { reactive, computed } from "vue";
import { defineStore } from "pinia";
import apiClient from "@/api";

export const useAuthStore = defineStore('auth', () => {
    const userInfo = reactive({
        accessToken: localStorage.getItem('authToken') || '',
        userId: localStorage.getItem('userId') || 0,
        userName: localStorage.getItem('userName') || '',
        tierCode: localStorage.getItem('tierCode') || 'BRONZE',
        imageURL: localStorage.getItem('imageURL') || '',
        statusMessage:localStorage.getItem('statusMessage') || 'BRONZE',
        type: '',
        roles: [],
        issuedAt: 0,
        expiresAt: localStorage.getItem('expiresAt') || 0,
    });

    const isLoggedIn = computed(() => {

        return (!!userInfo.accessToken && (userInfo.expiresAt ) > Date.now());
    })

    const login = async (email, password) => {
        try {
            const response = await apiClient.post('/api/v1/auth/login', { email, password });

            const data = response.data.items[0];
            userInfo.accessToken = data.accessToken;
            userInfo.userId = data.userId;
            userInfo.userName= data.userName;
            userInfo.tierCode = data.tierCode;
            userInfo.imageURL = data.imageURL;
            userInfo.statusMessage = data.statusMessage;
            userInfo.expiresAt = data.expiresAt;

            localStorage.setItem('authToken', data.accessToken);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userName', data.userName);
            localStorage.setItem('tierCode', data.tierCode);
            localStorage.setItem('imageURL', data.imageURL);
            localStorage.setItem('statusMessage', data.statusMessage);
            localStorage.setItem('expiresAt', data.expiresAt);

            return { success: true };

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
        userInfo.accessToken = '';
        userInfo.userId = 0;
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('tierCode');
        localStorage.removeItem('userId');
        localStorage.removeItem('imageURL');
        localStorage.removeItem('statusMessage');
        
    }

    const refreshAccessToken = async () => {
        try {
            // 브라우저가 쿠키를 자동으로 보내주므로, 요청 본문에 아무것도 보낼 필요가 없습니다.
            const response = await apiClient.post('/api/v1/auth/refresh');
            const tokenData = response.data.items[0];

            // 새로 받은 액세스 토큰 정보만 업데이트
            userInfo.accessToken = tokenData.accessToken;
            userInfo.expiresAt = tokenData.expiresAt;
            localStorage.setItem('authToken', tokenData.accessToken);
            
            return true;
        }
        catch (error) {
            console.error("토큰 재발급 실패");
        }
    }

    return { userInfo, login, logout, isLoggedIn, refreshAccessToken };

})