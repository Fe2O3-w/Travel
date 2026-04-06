import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState, useCallback } from "react"
import ChinaMap from "../../components/ChinaMap"
import { useCityStore } from "../../stores/cityStore"
import { usePetStore } from "../../stores/petStore"
import { CITY_DATA } from "../../data/cityData"
import { getCityByName } from "../../data/cityCategories"
import { getCategoryTopics, createTopic, timeAgo, type NbbTopic } from "../../data/nodebb"

export const Route = createFileRoute("/_layout/map")({
  component: MapPage,
})

// ── 心情选项 ──────────────────────────────────────────────────────────────────
const MOODS = [
  { value: "happy",   label: "😄 开心" },
  { value: "neutral", label: "😐 一般" },
  { value: "tired",   label: "😴 疲惫" },
  { value: "excited", label: "🤩 兴奋" },
  { value: "relaxed", label: "😌 放松" },
]

// ── 旅行日志面板 ──────────────────────────────────────────────────────────────
interface TravelLog {
  id: number
  city_name: string
  province: string
  title: string
  content: string
  mood: string
  rating: number
  visited_at: string
  created_at: string
}

function TravelLogPanel({ cityName, province }: { cityName: string; province: string }) {
  const token = localStorage.getItem("access_token")
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }

  const [logs,    setLogs]    = useState<TravelLog[]>([])
  const [loading, setLoading] = useState(true)
  const [view,    setView]    = useState<"list" | "write">("list")
  const [editing, setEditing] = useState<TravelLog | null>(null)

  // 表单
  const [title,     setTitle]     = useState("")
  const [content,   setContent]   = useState("")
  const [mood,      setMood]      = useState("happy")
  const [rating,    setRating]    = useState(5)
  const [saving,    setSaving]    = useState(false)
  const [err,       setErr]       = useState("")

  const loadLogs = useCallback(() => {
    setLoading(true)
    fetch(`/api/v1/travel-logs?city_name=${encodeURIComponent(cityName)}`, { headers })
      .then(r => r.json())
      .then(data => { setLogs(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [cityName])

  useEffect(() => { loadLogs() }, [loadLogs])

  const startEdit = (log: TravelLog) => {
    setEditing(log)
    setTitle(log.title)
    setContent(log.content)
    setMood(log.mood)
    setRating(log.rating)
    setView("write")
  }

  const resetForm = () => {
    setEditing(null); setTitle(""); setContent(""); setMood("happy"); setRating(5); setErr("")
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) { setErr("标题和内容不能为空"); return }
    setSaving(true); setErr("")
    const url    = editing ? `/api/v1/travel-logs/${editing.id}` : "/api/v1/travel-logs"
    const method = editing ? "PATCH" : "POST"
    const body   = editing
      ? { title, content, mood, rating }
      : { city_name: cityName, province, title, content, mood, rating }
    const res = await fetch(url, { method, headers, body: JSON.stringify(body) })
    setSaving(false)
    if (res.ok) { resetForm(); setView("list"); loadLogs() }
    else        { setErr("保存失败，请重试") }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("确认删除这篇日志？")) return
    await fetch(`/api/v1/travel-logs/${id}`, { method: "DELETE", headers })
    loadLogs()
  }

  const moodLabel = (m: string) => MOODS.find(x => x.value === m)?.label ?? m

  return (
    <div className="flex-1 overflow-y-auto">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <span className="text-xs text-gray-400">{logs.length} 篇日志</span>
        {view === "list" ? (
          <button
            onClick={() => { resetForm(); setView("write") }}
            className="text-xs px-3 py-1 rounded-full text-white"
            style={{ background: "#7c3aed" }}
          >
            ✏️ 写日志
          </button>
        ) : (
          <button
            onClick={() => { resetForm(); setView("list") }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            ← 返回
          </button>
        )}
      </div>

      {/* 日志列表 */}
      {view === "list" && (
        <div className="px-3 pb-3 space-y-2">
          {loading ? (
            <div className="text-center py-8 text-gray-400 text-sm">加载中…</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-3xl mb-2">📓</div>
              <p className="text-sm">还没有日志</p>
              <button
                onClick={() => { resetForm(); setView("write") }}
                className="mt-2 text-xs text-violet-500 hover:text-violet-700"
              >
                写下第一篇 →
              </button>
            </div>
          ) : logs.map(log => (
            <div key={log.id} className="rounded-xl p-3 bg-gray-50 dark:bg-zinc-800 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-gray-800 dark:text-zinc-100 line-clamp-1 flex-1">
                  {log.title}
                </p>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(log)} className="text-xs text-violet-400 hover:text-violet-600">编辑</button>
                  <button onClick={() => handleDelete(log.id)} className="text-xs text-red-400 hover:text-red-600">删除</button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2">{log.content}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{moodLabel(log.mood)}</span>
                <span>{"⭐".repeat(log.rating)}</span>
                <span className="ml-auto">{new Date(log.visited_at).toLocaleDateString("zh-CN")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 写日志表单 */}
      {view === "write" && (
        <div className="px-4 pb-4 space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">标题</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={`我在${cityName}的旅行记忆...`}
              className="w-full border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 placeholder-gray-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">内容</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={`记录你在${cityName}的所见所闻...`}
              rows={5}
              className="w-full border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 placeholder-gray-400 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">心情</label>
              <select
                value={mood}
                onChange={e => setMood(e.target.value)}
                className="w-full border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-zinc-800 text-gray-800"
              >
                {MOODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">评分</label>
              <div className="flex gap-1 pt-1.5">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setRating(n)} className="text-lg leading-none">
                    {n <= rating ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60"
            style={{ background: "#7c3aed" }}
          >
            {saving ? "保存中..." : editing ? "更新日志" : "保存日志"}
          </button>
        </div>
      )}
    </div>
  )
}

// ── 城市社区 + 日志面板 ────────────────────────────────────────────────────────
function CityCommunityPanel({
  cityName,
  onClose,
}: {
  cityName: string
  onClose: () => void
}) {
  const cityNbb  = getCityByName(cityName)
  const cityInfo = CITY_DATA[cityName]
  const [topics,  setTopics]  = useState<NbbTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<"topics" | "post" | "log">("topics")
  const [title,   setTitle]   = useState("")
  const [content, setContent] = useState("")
  const [posting, setPosting] = useState(false)
  const [postErr, setPostErr] = useState("")

  useEffect(() => {
    if (!cityNbb) { setLoading(false); return }
    setLoading(true)
    getCategoryTopics(cityNbb.cid).then(res => {
      setTopics(res.topics)
      setLoading(false)
    })
  }, [cityNbb])

  const handlePost = async () => {
    if (!cityNbb || !title.trim() || !content.trim()) { setPostErr("标题和内容不能为空"); return }
    setPosting(true)
    const result = await createTopic(cityNbb.cid, title, content)
    setPosting(false)
    if (result) {
      setTitle(""); setContent(""); setTab("topics")
      getCategoryTopics(cityNbb.cid).then(res => setTopics(res.topics))
    } else {
      setPostErr("发布失败，请先登录社区")
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-100 dark:border-zinc-800">
        <span style={{ fontSize: 24 }}>{cityInfo?.emoji ?? "📍"}</span>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white">{cityName}</h3>
          <p className="text-xs text-gray-400">{cityInfo?.province}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
      </div>

      {/* Tab 切换 */}
      <div className="flex border-b border-gray-100 dark:border-zinc-800">
        {(["topics", "post", "log"] as const).map((t, i) => {
          const labels = ["旅行故事", "✍️ 写故事", "📓 我的日志"]
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs transition-colors ${
                tab === t
                  ? "text-violet-600 border-b-2 border-violet-600 font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {labels[i]}
            </button>
          )
        })}
      </div>

      {/* 内容区 */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* 帖子列表 */}
        {tab === "topics" && (
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              [1,2,3].map(i => (
                <div key={i} className="rounded-xl p-3 bg-gray-50 dark:bg-zinc-800 animate-pulse">
                  <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 mb-2" />
                  <div className="h-2.5 bg-gray-100 dark:bg-zinc-700 rounded w-1/2" />
                </div>
              ))
            ) : topics.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <div className="text-3xl mb-2">🗺️</div>
                <p className="text-sm">还没有旅行故事</p>
                <button onClick={() => setTab("post")} className="mt-2 text-xs text-violet-500 hover:text-violet-700">
                  来写第一篇 →
                </button>
              </div>
            ) : (
              topics.map(t => (
                <a
                  key={t.tid}
                  href={`http://localhost:4567/topic/${t.slug}`}
                  target="_blank" rel="noreferrer"
                  className="block rounded-xl p-3 bg-gray-50 dark:bg-zinc-800 hover:bg-violet-50 dark:hover:bg-violet-950 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800 dark:text-zinc-100 line-clamp-2 mb-1.5">{t.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{t.user?.username ?? "旅行者"}</span>
                    <span>·</span>
                    <span>{timeAgo(t.timestamp)}</span>
                    <span className="ml-auto">💬 {t.postcount}</span>
                  </div>
                </a>
              ))
            )}
            {cityNbb && (
              <a href={`http://localhost:4567/category/${cityNbb.cid}`} target="_blank" rel="noreferrer"
                className="block text-center text-xs text-violet-500 hover:text-violet-700 py-2">
                查看全部 {cityName} 的帖子 →
              </a>
            )}
          </div>
        )}

        {/* 发帖表单 */}
        {tab === "post" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">标题</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder={`我在${cityName}的旅行记忆...`}
                className="w-full border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">内容</label>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder={`分享你在${cityName}的故事、美食、景点...`}
                rows={6}
                className="w-full border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 placeholder-gray-400 resize-none"
              />
            </div>
            {postErr && <p className="text-xs text-red-500">{postErr}</p>}
            <button onClick={handlePost} disabled={posting}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60"
              style={{ background: "#7c3aed" }}>
              {posting ? "发布中..." : "发布旅行故事"}
            </button>
            <p className="text-xs text-gray-400 text-center">
              需要先<a href="http://localhost:4567/login" target="_blank" rel="noreferrer"
                className="text-violet-500 mx-1">登录社区</a>才能发帖
            </p>
          </div>
        )}

        {/* 旅行日志 */}
        {tab === "log" && (
          <TravelLogPanel
            cityName={cityName}
            province={cityInfo?.province ?? ""}
          />
        )}
      </div>
    </div>
  )
}

// ── 主页面 ────────────────────────────────────────────────────────────────────
function MapPage() {
  const { visitedCities, autoCheckinByIP, locatedCity } = useCityStore()
  const petStore = usePetStore()
  const [ipLoading,     setIpLoading]     = useState(true)
  const [ipDone,        setIpDone]        = useState(false)
  const [communityCity, setCommunityCity] = useState<string | null>(null)

  useEffect(() => {
    autoCheckinByIP().then(city => {
      setIpLoading(false)
      setIpDone(true)
      if (city) {
        petStore.say(`检测到你在${city.name}！已自动为你打卡 📍`, 5000)
        const info = CITY_DATA[city.name]
        if (info) petStore.onCityArrive(city.name, info.food[0] ?? "", info.scenery[0] ?? "")
      } else {
        petStore.say("出发啦！点击地图探索中国各地吧~", 4000)
      }
    })
  }, [])

  const handleCityCheckin = useCallback((cityName: string) => {
    setCommunityCity(cityName)
  }, [])

  return (
    <div className="flex gap-4 h-full">

      {/* 左侧：地图主区域 */}
      <div className={`flex flex-col gap-3 transition-all duration-300 ${communityCity ? "flex-1" : "w-full"}`}>

        {ipDone && locatedCity && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
            style={{ background: "#EEEDFE", color: "#534AB7", border: "1px solid #AFA9EC" }}>
            <span style={{ fontSize: 16 }}>📍</span>
            <span>已根据 IP 定位到 <strong className="mx-1">{locatedCity}</strong> 并自动打卡</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: "#7F77DD", color: "white" }}>
              GPS 打卡
            </span>
          </div>
        )}
        {ipLoading && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
            style={{ background: "#F1EFE8", color: "#888780", border: "1px solid #D3D1C7" }}>
            <span className="animate-spin inline-block" style={{ fontSize: 14 }}>⟳</span>
            <span>正在定位你的城市…</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-gray-900 dark:text-white">云游中国</h1>
            <p className="text-sm text-gray-400 mt-0.5">点击省份查看城市，打卡你去过的地方</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-medium" style={{ color: "#7c3aed" }}>{visitedCities.length}</div>
            <div className="text-xs text-gray-400">已打卡城市</div>
          </div>
        </div>

        <div className="flex-1 relative bg-gray-50 dark:bg-zinc-900 rounded-2xl overflow-hidden min-h-[500px]">
          <ChinaMap onCityCheckin={handleCityCheckin} />
        </div>

        {visitedCities.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-2">已打卡</p>
            <div className="flex flex-wrap gap-2">
              {visitedCities.map(city => (
                <button key={city} onClick={() => setCommunityCity(city)}
                  className="px-3 py-1 rounded-full text-sm transition-all hover:scale-105"
                  style={{ background: "#ede9fe", color: "#7c3aed" }}>
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 右侧：城市面板 */}
      {communityCity && (
        <div className="w-80 shrink-0 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col">
          <CityCommunityPanel
            cityName={communityCity}
            onClose={() => setCommunityCity(null)}
          />
        </div>
      )}
    </div>
  )
}