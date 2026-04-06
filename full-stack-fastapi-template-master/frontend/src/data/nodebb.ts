const NODEBB = "/nodebb"
const API    = "/api/v1/nodebb"

export interface NbbTopic {
  tid: number
  title: string
  slug: string
  uid: number
  user: { username: string; picture: string }
  cid: number
  postcount: number
  viewcount: number
  timestamp: number
  lastposttime: number
  thumbs: { url: string }[]
  tags: { value: string }[]
  teaser?: { content: string }
}

function authHeaders(): Record<string, string> {
  return {
    "Content-Type":  "application/json",
    "Authorization": `Bearer ${localStorage.getItem("access_token") ?? ""}`,
  }
}

// ── 读取（直接访问 NodeBB，无需认证）────────────────────────────────────────
export async function getCategoryTopics(
  cid: number, page = 1,
): Promise<{ topics: NbbTopic[]; topicCount: number }> {
  const res = await fetch(`${NODEBB}/api/category/${cid}?page=${page}`)
  if (!res.ok) return { topics: [], topicCount: 0 }
  const data = await res.json()
  return { topics: data.topics ?? [], topicCount: data.topicCount ?? 0 }
}

export async function getRecentTopics(page = 1): Promise<NbbTopic[]> {
  const res = await fetch(`${NODEBB}/api/recent?page=${page}`)
  if (!res.ok) return []
  return (await res.json()).topics ?? []
}

export async function getPopularTopics(): Promise<NbbTopic[]> {
  const res = await fetch(`${NODEBB}/api/popular`)
  if (!res.ok) return []
  return (await res.json()).topics ?? []
}

// ── 写入（通过 FastAPI 代理，自动带用户身份）─────────────────────────────────
export async function createTopic(
  cid: number,
  title: string,
  content: string,
  tags: string[] = [],
): Promise<{ tid: number; slug: string } | null> {
  const res = await fetch(`${API}/topics`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ cid, title, content, tags }),
  })
  if (!res.ok) {
    console.error("发帖失败:", await res.text())
    return null
  }
  return await res.json()
}

export async function replyTopic(tid: number, content: string): Promise<boolean> {
  const res = await fetch(`${API}/topics/${tid}/reply`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ content }),
  })
  return res.ok
}

export async function votePost(pid: number, delta: 1 | -1): Promise<boolean> {
  // 点赞暂时直接访问 NodeBB（需要登录 NodeBB session）
  const res = await fetch(`${NODEBB}/api/v3/posts/${pid}/vote`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ delta }),
  })
  return res.ok
}

export function timeAgo(timestamp: number): string {
  const diff  = Date.now() - timestamp
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return "刚刚"
  if (mins  < 60) return `${mins}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days  < 30) return `${days}天前`
  return new Date(timestamp).toLocaleDateString("zh-CN")
}