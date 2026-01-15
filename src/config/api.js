/**
 * API 설정 중앙 관리
 * 환경변수에 따라 API Base URL을 결정합니다.
 */

// 환경변수에서 API Base URL 가져오기
// 개발: /api (상대 경로로 Nginx Proxy Manager가 라우팅)
// 프로덕션: /api (Nginx Proxy Manager를 통한 백엔드 라우팅)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// API 엔드포인트들
export const API_ENDPOINTS = {
  // 사용자
  USERS: '/v1/users',
  USER_BY_ID: (userId) => `/v1/users/${userId}`,
  USER_REGISTER: '/v1/users/register',
  
  // 게시판
  BOARD_POSTS: '/v1/board/posts',
  BOARD_POST_BY_ID: (postId) => `/v1/board/posts/${postId}`,
  BOARD_POST_COMMENTS: (postId) => `/v1/board/posts/${postId}/comments`,
  BOARD_POST_LIKE: (postId) => `/v1/board/posts/${postId}/like`,
  BOARD_USER_POSTS: (userId) => `/v1/board/user/${userId}`,
  
  // 예측
  PREDICTIONS: '/v1/prediction',
  USER_PREDICTIONS: (userId) => `/v1/prediction/user/${userId}`,
  MY_PREDICTIONS: '/v1/prediction/user/me',
  
  // 주식
  STOCKS: '/v1/stock',
  STOCK_BY_ID: (stockId) => `/v1/stock/${stockId}`,
  
  // 뉴스
  NEWS_POPULAR: '/v1/news/popular-news',
  
  // 인증
  AUTH_REFRESH: '/v1/auth/refresh',
}

// 전체 URL을 생성하는 헬퍼 함수
export const getApiUrl = (endpoint) => {
  // 엔드포인트가 이미 전체 URL이면 그대로 반환
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint
  }
  
  // API_BASE_URL이 비어있으면 엔드포인트만 반환 (상대 경로)
  if (!API_BASE_URL || API_BASE_URL === '/api') {
    return `/api${endpoint}`
  }
  
  // BASE_URL + endpoint 조합
  return `${API_BASE_URL}${endpoint}`
}

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  getApiUrl
}
