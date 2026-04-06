import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState, useRef } from "react"
import {
  getRecentTopics, getPopularTopics, getCategoryTopics,
  createTopic, timeAgo, type NbbTopic,
} from "../../data/nodebb"
import { CITY_CATEGORIES, getCityByName } from "../../data/cityCategories"
import { useCityStore } from "../../stores/cityStore"

export const Route = createFileRoute("/_layout/community")({
  component: CommunityPage,
})

// ── 帖子卡片 ──────────────────────────────────────────────────────────────────
function TopicCard({ topic }: { topic: NbbTopic }) {
  const city = CITY_CATEGORIES.find(c => c.cid === topic.cid)

  return (
    <a
      href={`http://localhost:4567/topic/${topic.slug}`}
      target="_blank"
      rel="noreferrer"
      className="block rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-violet-200 dark:hover:border-violet-800 transition-all hover:-translate-y-0.5"
    >
      {/* 顶部：头像 + 用户名 + 城市标签 + 时间 */}
      <div className="flex items-center gap-2 mb-3">
        <img
          src={topic.user?.picture
            ? `http://localhost:4567${topic.user.picture}`
            : `https://api.dicebear.com/7.x/adventurer/svg?seed=${topic.uid}`}
          className="w-9 h-9 rounded-full object-cover"
          alt=""
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-800 dark:text-zinc-100">
              {topic.user?.username ?? "旅行者"}
            </span>
            {city && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "#EEEDFE", color: "#534AB7" }}>
                {city.emoji} 来自{city.name}
              </span>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-400 shrink-0">{timeAgo(topic.timestamp)}</span>
      </div>

      {/* 标题 */}
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
        {topic.title}
      </h3>

      {/* 摘要 */}
      {topic.teaser?.content && (
        <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 mb-3"
          dangerouslySetInnerHTML={{ __html: topic.teaser.content }} />
      )}

      {/* 图片缩略图（最多4张）*/}
      {topic.thumbs && topic.thumbs.length > 0 && (
        <div className="grid grid-cols-4 gap-1 mb-3 rounded-xl overflow-hidden">
          {topic.thumbs.slice(0, 4).map((t, i) => (
            <img key={i} src={`http://localhost:4567${t.url}`}
              className="w-full aspect-square object-cover" alt="" />
          ))}
        </div>
      )}

      {/* 底部：点赞/评论/浏览 */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>👍 {topic.postcount ?? 0}</span>
        <span>💬 {topic.postcount ?? 0}</span>
        <span>👁 {topic.viewcount ?? 0}</span>
      </div>
    </a>
  )
}

// ── 发帖弹窗 ──────────────────────────────────────────────────────────────────
function PostModal({
  onClose,
  defaultCid,
}: {
  onClose: () => void
  defaultCid?: number
}) {
  const [title,   setTitle]   = useState("")
  const [content, setContent] = useState("")
  const [cid,     setCid]     = useState(defaultCid ?? CITY_CATEGORIES[0].cid)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) { setError("标题和内容不能为空"); return }
    setLoading(true)
    const result = await createTopic(cid, title, content)
    setLoading(false)
    if (result) {
      onClose()
      window.open(`http://localhost:4567/topic/${result.tid}`, "_blank")
    } else {
      setError("发布失败，请先登录 NodeBB 社区后再试")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl p-6 mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">分享旅行故事</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        {/* 城市选择 */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">城市版块</label>
          <select
            value={cid}
            onChange={e => setCid(Number(e.target.value))}
            className="w-full border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100"
          >
            {CITY_CATEGORIES.map(c => (
              <option key={c.cid} value={c.cid}>{c.emoji} {c.name}</option>
            ))}
          </select>
        </div>

        {/* 标题 */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">标题</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="用一句话描述你的旅行..."
            className="w-full border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 placeholder-gray-400"
          />
        </div>

        {/* 内容 */}
        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1 block">内容</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="分享你的旅行心得、美食体验、景点推荐..."
            rows={5}
            className="w-full border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 placeholder-gray-400 resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <div className="flex gap-2 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-gray-500 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50">
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm text-white disabled:opacity-60"
            style={{ background: "#7c3aed" }}>
            {loading ? "发布中..." : "发布"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 主页面 ────────────────────────────────────────────────────────────────────
function CommunityPage() {
  const [topics,       setTopics]       = useState<NbbTopic[]>([])
  const [loading,      setLoading]      = useState(true)
  const [activeTab,    setActiveTab]    = useState<"recent" | "popular">("recent")
  const [activeCid,    setActiveCid]    = useState<number | null>(null)
  const [showModal,    setShowModal]    = useState(false)
  const [searchQuery,  setSearchQuery]  = useState("")

  const { visitedCities } = useCityStore()

  // 已打卡城市的版块优先显示
  const visitedCategories = CITY_CATEGORIES.filter(c =>
    visitedCities.includes(c.name)
  )
  const otherCategories = CITY_CATEGORIES.filter(c =>
    !visitedCities.includes(c.name)
  )

  useEffect(() => {
    loadTopics()
  }, [activeTab, activeCid])

  async function loadTopics() {
    setLoading(true)
    let data: NbbTopic[] = []
    if (activeCid) {
      const res = await getCategoryTopics(activeCid)
      data = res.topics
    } else if (activeTab === "popular") {
      data = await getPopularTopics()
    } else {
      data = await getRecentTopics()
    }
    setTopics(data)
    setLoading(false)
  }

  const filtered = searchQuery
    ? topics.filter(t =>
        t.title.includes(searchQuery) ||
        t.user?.username?.includes(searchQuery)
      )
    : topics

  return (
    <div className="flex gap-4 min-h-screen">

      {/* ── 左侧边栏 ── */}
      <div className="w-52 shrink-0 space-y-3">

        {/* 热门动态 / 全部 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <button
            onClick={() => { setActiveCid(null); setActiveTab("recent") }}
            className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              !activeCid && activeTab === "recent"
                ? "text-violet-600 bg-violet-50 dark:bg-violet-950"
                : "text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
            }`}>
            🔥 热门动态
          </button>
          <button
            onClick={() => { setActiveCid(null); setActiveTab("popular") }}
            className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-t border-gray-100 dark:border-zinc-800 ${
              !activeCid && activeTab === "popular"
                ? "text-violet-600 bg-violet-50 dark:bg-violet-950"
                : "text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
            }`}>
            ⭐ 精华帖子
          </button>
        </div>

        {/* 城市专区 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="px-4 py-2.5 text-xs font-medium text-gray-500 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-1.5">
            📍 城市专区
          </div>

          {/* 已打卡城市优先 */}
          {visitedCategories.length > 0 && (
            <>
              <div className="px-4 py-1.5 text-xs text-gray-400 bg-gray-50 dark:bg-zinc-800">
                已打卡
              </div>
              {visitedCategories.map(c => (
                <button key={c.cid}
                  onClick={() => setActiveCid(c.cid)}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                    activeCid === c.cid
                      ? "text-violet-600 bg-violet-50 dark:bg-violet-950 font-medium"
                      : "text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                  }`}>
                  <span style={{ fontSize: 14 }}>{c.emoji}</span>
                  {c.name}
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
                </button>
              ))}
              <div className="px-4 py-1.5 text-xs text-gray-400 bg-gray-50 dark:bg-zinc-800">
                更多城市
              </div>
            </>
          )}

          {/* 其他城市（最多显示10个，其余折叠）*/}
          {otherCategories.slice(0, 10).map(c => (
            <button key={c.cid}
              onClick={() => setActiveCid(c.cid)}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                activeCid === c.cid
                  ? "text-violet-600 bg-violet-50 dark:bg-violet-950 font-medium"
                  : "text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
              }`}>
              <span style={{ fontSize: 14 }}>{c.emoji}</span>
              {c.name}
            </button>
          ))}

          {/* 查看全部版块 */}
          <a href="http://localhost:4567/categories" target="_blank" rel="noreferrer"
            className="w-full flex items-center justify-center gap-1 px-4 py-2.5 text-xs text-violet-500 hover:text-violet-700 border-t border-gray-100 dark:border-zinc-800">
            查看全部版块 →
          </a>
        </div>

        {/* 分享按钮 */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-3 rounded-2xl text-sm font-medium text-white shadow-md transition-all hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
          ✈️ 分享我的旅行
        </button>
      </div>

      {/* ── 中间主内容 ── */}
      <div className="flex-1 min-w-0 space-y-3">

        {/* 搜索栏 */}
        <div className="relative">
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索你想去的城市..."
            className="w-full border border-gray-200 dark:border-zinc-700 rounded-2xl pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-100 placeholder-gray-400"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 16 }}>🔍</span>
        </div>

        {/* 发帖输入框（快捷入口）*/}
        <div
          onClick={() => setShowModal(true)}
          className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl px-4 py-3 cursor-pointer hover:border-violet-200 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-sm">✍</div>
          <span className="text-sm text-gray-400 flex-1">在这里分享你的旅行心得...</span>
          <span className="text-xs text-gray-300 border border-gray-200 dark:border-zinc-700 px-2 py-1 rounded-lg">上传图片</span>
        </div>

        {/* 当前版块标题 */}
        {activeCid && (
          <div className="flex items-center gap-2">
            {(() => {
              const city = CITY_CATEGORIES.find(c => c.cid === activeCid)
              return city ? (
                <>
                  <span style={{ fontSize: 20 }}>{city.emoji}</span>
                  <h2 className="text-base font-medium text-gray-800 dark:text-white">{city.name}旅行圈</h2>
                  <button
                    onClick={() => setActiveCid(null)}
                    className="ml-auto text-xs text-gray-400 hover:text-gray-600">
                    返回全部
                  </button>
                </>
              ) : null
            })()}
          </div>
        )}

        {/* 帖子列表 */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 animate-pulse">
                <div className="flex gap-2 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-zinc-700" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-24" />
                    <div className="h-2.5 bg-gray-100 dark:bg-zinc-800 rounded w-16" />
                  </div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🗺️</div>
            <p className="text-sm">暂无帖子，来分享第一篇旅行故事吧！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(t => <TopicCard key={t.tid} topic={t} />)}
          </div>
        )}

        {/* 跳转到完整论坛 */}
        <div className="text-center pt-2">
          <a href="http://localhost:4567" target="_blank" rel="noreferrer"
            className="text-sm text-violet-500 hover:text-violet-700">
            前往完整社区论坛 →
          </a>
        </div>
      </div>

      {/* ── 右侧栏 ── */}
      <div className="w-48 shrink-0 space-y-3">

        {/* 热门城市排行 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4">
          <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-3">热门城市排行</h3>
          <div className="space-y-2">
            {CITY_CATEGORIES.slice(0, 5).map((c, i) => (
              <button key={c.cid}
                onClick={() => setActiveCid(c.cid)}
                className="w-full flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300 hover:text-violet-600 transition-colors">
                <span className="text-xs font-medium text-gray-400 w-3">{i + 1}.</span>
                <span style={{ fontSize: 13 }}>{c.emoji}</span>
                <span>{c.name}</span>
                <span className="ml-auto text-orange-400 text-xs">🔥</span>
              </button>
            ))}
          </div>
        </div>

        {/* 社区规范 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4">
          <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-2">社区规范</h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
            友善交流，互相尊重。分享真实旅行体验，维护社区友好氛围。
          </p>
        </div>

        {/* 去 NodeBB 管理 */}
        <a href="http://localhost:4567/admin" target="_blank" rel="noreferrer"
          className="block text-center text-xs text-gray-400 hover:text-gray-600 py-2">
          管理后台 →
        </a>
      </div>

      {/* 发帖弹窗 */}
      {showModal && (
        <PostModal
          onClose={() => setShowModal(false)}
          defaultCid={activeCid ?? undefined}
        />
      )}
    </div>
  )
}