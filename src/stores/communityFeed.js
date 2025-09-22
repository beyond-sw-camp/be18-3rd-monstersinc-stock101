import { defineStore } from 'pinia'
import { fetchPosts, toggleLike, createPost } from '@/services/communityApi'

export const useCommunityFeedStore = defineStore('communityFeed', {
  state: () => ({
    posts: [],
    isLoading: false,
    error: null,
    isInitialized: false,
  }),
  actions: {
    async ensurePosts() {
      if (this.isInitialized || this.isLoading) return
      this.isLoading = true
      try {
        const { items } = await fetchPosts()
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
        const { items } = await toggleLike(postId)
        const [result] = items
        target.likeCount = result.likeCount
        target.commentCount = result.commentCount
        target.likedByMe = result.likedByMe
        return target
      } catch (error) {
        target.likedByMe = !optimisticLiked
        target.likeCount += optimisticLiked ? -1 : 1
        throw error
      }
    },
    async createPost({ opinion, content, user }) {
      const payload = {
        opinion,
        content,
        userId: user?.id,
        userName: user?.name,
        authorTierCode: user?.tier,
      }
      const { items } = await createPost(payload)
      const [created] = items
      this.posts = [created, ...this.posts]
      return created
    },
  },
})
