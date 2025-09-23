import { mockCommunityPosts, mockCommunityComments } from '@/data/communityMock'

const BASE_URL = 'http://localhost:8080'

let postSequence = Math.max(...mockCommunityPosts.map((item) => item.postId)) + 1
let commentSequence = Object.values(mockCommunityComments)
  .flat()
  .reduce((max, item) => Math.max(max, item.commentId), 0)

const posts = [...mockCommunityPosts]
const commentsMap = new Map(
  Object.entries(mockCommunityComments).map(([key, value]) => [Number(key), [...value]])
)

function buildResponse(code, message, items) {
  return { code, message, items }
}

function unwrapCandidates(payload) {
  if (payload == null) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.content)) return payload.content
  if (payload.item) return [payload.item]
  if (payload.result) return unwrapCandidates(payload.result)
  if (payload.data) return unwrapCandidates(payload.data)
  return [payload]
}

function toResponse(payload, fallbackCode = 200, fallbackMessage = 'OK') {
  const items = unwrapCandidates(payload)
  return {
    code: payload?.code ?? fallbackCode,
    message: payload?.message ?? fallbackMessage,
    items,
  }
}

async function request(path, { method = 'GET', token, body } = {}) {
  const headers = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  if (body) {
    headers['Content-Type'] = 'application/json'
  }
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`)
    error.status = response.status
    throw error
  }

  if (response.status === 204) {
    return { code: response.status, message: 'No Content', items: [] }
  }

  const data = await response.json().catch(() => ({}))
  return data
}

export async function fetchPosts(options = {}) {
  try {
    const payload = await request('/api/v1/board/posts', { token: options.token })
    const response = toResponse(payload)
    if (!response.items.length) {
      return buildResponse(200, 'OK', posts)
    }
    return response
  } catch (error) {
    console.warn('[communityApi] fetchPosts fallback:', error)
    return buildResponse(200, 'OK', posts)
  }
}

export async function toggleLike(postId, options = {}) {
  try {
    const payload = await request(`/api/v1/board/posts/${postId}/like`, {
      method: 'POST',
      token: options.token,
    })
    const response = toResponse(payload)
    if (!response.items.length) {
      return response
    }
    return response
  } catch (error) {
    console.warn('[communityApi] toggleLike fallback:', error)
    const target = posts.find((item) => item.postId === postId)
    if (!target) {
      throw error
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
}

export async function createPost(payload, options = {}) {
  const body = {
    stockId: payload.stockId ?? 1001,
    opinion: payload.opinion,
    content: payload.content,
  }
  try {
    const response = await request('/api/v1/board/posts', {
      method: 'POST',
      body,
      token: options.token,
    })
    const normalized = toResponse(response, 201, 'Created')
    if (!normalized.items.length) {
      return normalized
    }
    return normalized
  } catch (error) {
    console.warn('[communityApi] createPost fallback:', error)
    const newPost = {
      postId: postSequence++,
      stockId: body.stockId,
      userId: payload.userId ?? 0,
      opinion: payload.opinion,
      content: payload.content,
      createdAt: new Date().toISOString(),
      userName: payload.userName ?? '사용자',
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
}

export async function fetchPostDetail(postId, options = {}) {
  try {
    const payload = await request(`/api/v1/board/posts/${postId}`, {
      token: options.token,
    })
    const response = toResponse(payload)
    if (!response.items.length) {
      return buildResponse(200, 'OK', posts.filter((item) => item.postId === postId))
    }
    return response
  } catch (error) {
    console.warn('[communityApi] fetchPostDetail fallback:', error)
    const target = posts.find((item) => item.postId === postId)
    if (!target) throw error
    return buildResponse(200, 'OK', [target])
  }
}

export async function fetchComments(postId, options = {}) {
  try {
    const payload = await request(`/api/v1/board/posts/${postId}/comments`, {
      token: options.token,
    })
    const response = toResponse(payload)
    if (!response.items.length) {
      return buildResponse(200, 'OK', commentsMap.get(postId) ?? [])
    }
    return response
  } catch (error) {
    console.warn('[communityApi] fetchComments fallback:', error)
    const list = commentsMap.get(postId) ?? []
    return buildResponse(200, 'OK', list)
  }
}

export async function createComment(postId, payload, options = {}) {
  const body = {
    content: payload.content,
    userId: payload.userId,
    parentCommentId: payload.parentCommentId ?? null,
  }
  try {
    const response = await request(`/api/v1/board/posts/${postId}/comments`, {
      method: 'POST',
      body,
      token: options.token,
    })
    const normalized = toResponse(response, 201, 'Created')
    if (!normalized.items.length) {
      return normalized
    }
    return normalized
  } catch (error) {
    console.warn('[communityApi] createComment fallback:', error)
    const list = commentsMap.get(postId) ?? []
    const newComment = {
      commentId: ++commentSequence,
      content: payload.content,
      createdAt: new Date().toISOString(),
      postId,
      userId: payload.userId ?? 0,
      parentCommentId: payload.parentCommentId ?? null,
      userName: payload.userName ?? '사용자',
      authorTierCode: payload.authorTierCode ?? 'BRONZE',
      totalCommentCount: 0,
      deleted: false,
      imageUrl: payload.imageUrl ?? '',
    }
    if (newComment.parentCommentId) {
      list.push(newComment)
    } else {
      list.unshift(newComment)
    }
    commentsMap.set(postId, list)

    const target = posts.find((item) => item.postId === postId)
    if (target) {
      target.commentCount += 1
    }

    return buildResponse(201, 'Created', [newComment])
  }
}



