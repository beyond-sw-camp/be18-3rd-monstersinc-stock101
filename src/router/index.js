import MyProfilePredictionsFeed from '@/views/MyProfilePredictionsFeed.vue'
import MyProfilePredictionsSuccess from '@/views/MyProfilePredictionsSuccess.vue'
import UserProfilePosts from '@/views/UserProfilePosts.vue'
import UserProfilePredictions from '@/views/UserProfilePredictions.vue'
import { createRouter, createWebHistory } from 'vue-router'

import Main from '@/pages/main.vue'
import CommunityFeedView from '@/views/CommunityFeedView.vue'
import CommunityPostDetailView from '@/views/CommunityPostDetailView.vue'
<<<<<<< HEAD
import StockCommunityView from '@/views/StockCommunityView.vue'
=======
import UserLogin from '@/pages/auth/Login.vue'
import UserRegister from '@/pages/auth/Register.vue'
>>>>>>> bf61b67442d81c2ed3f17b84e5a2ad89fc8ce6a1

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
      component: UserLogin,
    },
    {
      path: '/auth/register',
      name: "userRegister",
      component: UserRegister,
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
      path: '/stock/:symbol',
      name: 'StockCommunity',
      component: StockCommunityView,
      props: true,
    },
    {
      path: '/community/posts/:postId',
      name: 'CommunityPostDetail',
      component: CommunityPostDetailView,
      props: true,
    },
  ],
})

export default router
