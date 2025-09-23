import MyProfilePredictionsFeed from '@/views/MyProfilePredictionsFeed.vue'
import MyProfilePredictionsSuccess from '@/views/MyProfilePredictionsSuccess.vue'
import UserProfilePosts from '@/views/UserProfilePosts.vue'
import UserProfilePredictions from '@/views/UserProfilePredictions.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

import Main from '@/pages/main.vue'
import CommunityFeedView from '@/views/CommunityFeedView.vue'
import CommunityPostDetailView from '@/views/CommunityPostDetailView.vue'
import UserLogin from '@/pages/auth/Login.vue'
import UserRegister from '@/pages/auth/Register.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    {
      path: '/',
      name: "main",
      component: Main,
    },
        {
      path: '/auth/login',
      name: "userLogin",
      meta: { requiresAuth: false, guestOnly: true },
      component: UserLogin,
    },
    {
      path: '/auth/register',
      name: "userRegister",
      component: UserRegister,
      meta: { requiresAuth: false, guestOnly: true }

    },
    {
      path: '/profile/me/predictions',
      name: 'MyProfilePredictions',
      component: MyProfilePredictionsFeed,
    },
    {
      path: '/profile/me/predictions/success',
      name: 'MyProfilePredictionsSuccess',
      component: MyProfilePredictionsSuccess,
    },
    {
      path: '/profile/users/:id/predictions',
      name: 'UserProfilePredictions',
      component: UserProfilePredictions,
      props: true,
    },
    {
      path: '/profile/users/:id/posts',
      name: 'UserProfilePosts',
      component: UserProfilePosts,
      props: true,
    },
    {
      path: '/community',
      name: 'CommunityFeed',
      component: CommunityFeedView,
    },
    {
      path: '/community/posts/:postId',
      name: 'CommunityPostDetail',
      component: CommunityPostDetailView,
      props: true,
    },
  ],
});
//  네비게이션 가드
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isLoggedIn = authStore.isLoggedIn; // 로그인 상태 가져오기

    if (to.meta.guestOnly && isLoggedIn) {
        next({ name: 'main' }); 
    } else {
        next();
    }
});



export default router
