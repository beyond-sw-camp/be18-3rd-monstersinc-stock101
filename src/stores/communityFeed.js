import { createPost, fetchPosts, toggleLike } from '@/services/communityApi'
import { useSessionStore } from '@/stores/session'
import { defineStore } from 'pinia'

export const useCommunityFeedStore = defineStore('communityFeed', {
  state: () => ({
    posts: [],
    selectedStockId: null,
    isLoading: false,
    error: null,
    isInitialized: false,
  }),
  actions: {
    setSelectedStockId(stockId) {
      if (typeof stockId === 'number') {
        this.selectedStockId = Number.isNaN(stockId) ? null : stockId
        return
      }
      if (stockId == null || stockId === '') {
        this.selectedStockId = null
        return
      }
      const parsed = Number(stockId)
      this.selectedStockId = Number.isNaN(parsed) ? null : parsed
    },
    async ensurePosts() {
      if (this.isInitialized || this.isLoading) return
      this.isLoading = true
      try {
        const sessionStore = useSessionStore()
        const { items } = await fetchPosts({ token: sessionStore.accessToken, stockId: this.selectedStockId })
        this.posts = items
        this.error = null
        this.isInitialized = true
      } catch (error) {
        this.error = error
      } finally {
        this.isLoading = false
      }
    },
    async toggleLike(postId) {
      const target = this.posts.find((item) => item.postId === postId)
      if (!target) return null
      const optimisticLiked = !target.likedByMe
      target.likedByMe = optimisticLiked
      target.likeCount += optimisticLiked ? 1 : -1
      try {
        const sessionStore = useSessionStore()
        const { items } = await toggleLike(postId, { token: sessionStore.accessToken })
        const [result] = items ?? []
        if (result) {
          target.likeCount = result.likeCount ?? target.likeCount
          target.commentCount = result.commentCount ?? target.commentCount
          target.likedByMe = result.likedByMe ?? target.likedByMe
        }
        return target
      } catch (error) {
        target.likedByMe = !optimisticLiked
        target.likeCount += optimisticLiked ? -1 : 1
        throw error
      }
    },
    async createPost({ stockId, opinion, content, user }) {
      const payload = {
        stockId,
        opinion,
        content,
        userId: user?.id,
        userName: user?.name,
        authorTierCode: user?.tier,
      }
      const sessionStore = useSessionStore()
      const { items } = await createPost(payload, { token: sessionStore.accessToken })
      const [created] = items ?? []
      if (created) {
        this.posts = [created, ...this.posts]
      }
      return created
    },
  },
})










