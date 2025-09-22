import { mockCommunityPosts, mockCommunityComments } from '@/data/communityMock'

let postSequence = Math.max(...mockCommunityPosts.map((item) => item.postId)) + 1
let commentSequence = Object.values(mockCommunityComments)
  .flat()
  .reduce((max, item) => Math.max(max, item.commentId), 0)

const posts = [...mockCommunityPosts]
const commentsMap = new Map(Object.entries(mockCommunityComments).map(([key, value]) => [Number(key), [...value]]))

function buildResponse(code, message, items) {
  return { code, message, items }
}

export async function fetchPosts() {
  return buildResponse(200, 'OK', posts)
}

export async function toggleLike(postId) {
  const target = posts.find((item) => item.postId === postId)
  if (!target) {
    throw new Error('Post not found')
  }
  target.likedByMe = !target.likedByMe
  target.likeCount += target.likedByMe ? 1 : -1
  return buildResponse(200, 'OK', [
    {
      likeCount: target.likeCount,
      commentCount: target.commentCount,
      likedByMe: target.likedByMe,
    },
  ])
}

export async function createPost(payload) {
  const newPost = {
    postId: postSequence++,
    stockId: payload.stockId ?? 0,
    userId: payload.userId ?? 0,
    opinion: payload.opinion,
    content: payload.content,
    createdAt: new Date().toISOString(),
    userName: payload.userName ?? '나',
    likedByMe: false,
    likeCount: 0,
    commentCount: 0,
    authorTierCode: payload.authorTierCode ?? 'BRONZE',
    imageUrl: payload.imageUrl ?? '',
  }

  posts.unshift(newPost)
  commentsMap.set(newPost.postId, [])

  return buildResponse(201, 'Created', [newPost])
}

export async function fetchPostDetail(postId) {
  const target = posts.find((item) => item.postId === postId)
  if (!target) {
    throw new Error('Post not found')
  }
  return buildResponse(200, 'OK', [target])
}

export async function fetchComments(postId) {
  const list = commentsMap.get(postId) ?? []
  return {
    items: list,
    totalCount: list.length,
    code: 200,
    message: 'OK',
    numOfRows: list.length,
  }
}

export async function createComment(postId, payload) {
  const list = commentsMap.get(postId) ?? []
  const newComment = {
    commentId: ++commentSequence,
    content: payload.content,
    createdAt: new Date().toISOString(),
    postId,
    userId: payload.userId ?? 0,
    parentCommentId: payload.parentCommentId ?? null,
    userName: payload.userName ?? '나',
    authorTierCode: payload.authorTierCode ?? 'BRONZE',
    totalCommentCount: 0,
    deleted: false,
    imageUrl: payload.imageUrl ?? '',
  }
  list.unshift(newComment)
  commentsMap.set(postId, list)

  const target = posts.find((item) => item.postId === postId)
  if (target) {
    target.commentCount += 1
  }

  return buildResponse(201, 'Created', [newComment])
}
