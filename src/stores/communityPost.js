import { defineStore } from 'pinia'
import { fetchPostDetail, fetchComments, createComment } from '@/services/communityApi'

export const useCommunityPostStore = defineStore('communityPost', {
  state: () => ({
    post: null,
    comments: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async load(postId) {
      this.isLoading = true
      try {
        const [{ items: postItems }, { items: commentItems }] = await Promise.all([
          fetchPostDetail(postId),
          fetchComments(postId),
        ])
        this.post = postItems[0]
        this.comments = commentItems
        this.error = null
      } catch (error) {
        this.error = error
      } finally {
        this.isLoading = false
      }
    },
    async addComment(postId, { content, user }) {
      const payload = {
        content,
        userId: user?.id,
        userName: user?.name,
        authorTierCode: user?.tier,
      }
      const { items } = await createComment(postId, payload)
      const [created] = items
      this.comments = [created, ...this.comments]
      if (this.post) {
        this.post.commentCount += 1
      }
      return created
    },
    clear() {
      this.post = null
      this.comments = []
      this.error = null
      this.isLoading = false
    },
  },
})
