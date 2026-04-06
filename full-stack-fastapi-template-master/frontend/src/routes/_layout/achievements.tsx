import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { AchievementIcon, RARITY_COLORS } from "../../components/AchievementIcons"

export const Route = createFileRoute("/_layout/achievements")({
  component: AchievementsPage,
})

interface Achievement {
  id: number
  code: string
  name: string
  description: string
  category: string
  rarity: "common" | "rare" | "epic" | "legendary"
  icon_url: string | null
  unlocked_at: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  explorer:  "探索",
  regional:  "地区",
  foodie:    "美食",
  social:    "社交",
  companion: "养成",
}

const CATEGORY_FILTERS = ["全部", "探索", "地区", "美食", "社交", "养成"]

// ── 单张成就卡片 ──────────────────────────────────────────────────────────────
function AchievementCard({ achv, unlocked }: { achv: Achievement; unlocked: boolean }) {
  const rarity  = RARITY_COLORS[achv.rarity]
  const [hover, setHover] = useState(false)

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: `1.5px solid ${hover && unlocked ? rarity.stroke : `var(--color-border-tertiary)`}`,
        transition: "all .2s",
        transform: hover && unlocked ? "translateY(-3px)" : "none",
      }}
      className="rounded-2xl p-4 flex flex-col items-center gap-2 bg-white dark:bg-zinc-900 cursor-default"
    >
      <div className="relative">
        <AchievementIcon code={achv.code} size={72} unlocked={unlocked} />
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl opacity-60">🔒</span>
          </div>
        )}
      </div>

      <div className="text-center">
        <p
          className="text-sm font-medium"
          style={{ color: unlocked ? rarity.text : "var(--color-text-tertiary)" }}
        >
          {achv.name}
        </p>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 leading-relaxed">
          {achv.description}
        </p>
      </div>

      <div className="flex items-center gap-1.5 mt-auto">
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: unlocked ? rarity.bg : "#F1EFE8",
            color:      unlocked ? rarity.text : "#888780",
          }}
        >
          {rarity.label}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400">
          {CATEGORY_LABELS[achv.category] ?? achv.category}
        </span>
      </div>

      {unlocked && achv.unlocked_at && (
        <p className="text-xs text-gray-300 dark:text-zinc-600">
          {new Date(achv.unlocked_at).toLocaleDateString("zh-CN")} 解锁
        </p>
      )}
    </div>
  )
}

// ── 解锁进度条 ────────────────────────────────────────────────────────────────
function ProgressBar({ value, total, color }: { value: number; total: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${(value / total) * 100}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-gray-400 w-12 text-right">{value} / {total}</span>
    </div>
  )
}

// ── 主页面 ────────────────────────────────────────────────────────────────────
function AchievementsPage() {
  const [allAchv,      setAllAchv]      = useState<Achievement[]>([])
  const [myAchv,       setMyAchv]       = useState<Achievement[]>([])
  const [activeFilter, setActiveFilter] = useState("全部")
  const [loading,      setLoading]      = useState(true)

  const token = localStorage.getItem("access_token")
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/achievements/all", { headers }).then(r => r.json()),
      fetch("/api/v1/achievements/me",  { headers }).then(r => r.json()),
    ]).then(([all, me]) => {
      setAllAchv(all)
      setMyAchv(me)
      setLoading(false)
    })
  }, [])

  const unlockedCodes = new Set(myAchv.map(a => a.code))

  // 合并数据：已解锁的带上 unlocked_at
  const merged: Achievement[] = allAchv.map(a => {
    const found = myAchv.find(m => m.code === a.code)
    return found ? { ...a, unlocked_at: found.unlocked_at } : a
  })

  // 按筛选分类
  const filtered = merged.filter(a => {
    if (activeFilter === "全部") return true
    return CATEGORY_LABELS[a.category] === activeFilter
  })

  // 按稀有度排序：传说>史诗>稀有>普通，已解锁优先
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 }
  const sorted = [...filtered].sort((a, b) => {
    const ua = unlockedCodes.has(a.code) ? 0 : 1
    const ub = unlockedCodes.has(b.code) ? 0 : 1
    if (ua !== ub) return ua - ub
    return rarityOrder[a.rarity] - rarityOrder[b.rarity]
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        加载中…
      </div>
    )
  }

  const total    = allAchv.length
  const unlocked = myAchv.length

  return (
    <div className="space-y-6">
      {/* 顶部标题 + 总进度 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white">成就图鉴</h1>
          <p className="text-sm text-gray-400 mt-0.5">收集旅途中的每一份荣耀</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-medium" style={{ color: "#7F77DD" }}>
            {unlocked}
            <span className="text-base text-gray-400 font-normal"> / {total}</span>
          </div>
          <p className="text-xs text-gray-400">已解锁</p>
        </div>
      </div>

      {/* 稀有度进度 */}
      <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-4 space-y-2.5">
        {(["common", "rare", "epic", "legendary"] as const).map(r => {
          const rc      = RARITY_COLORS[r]
          const rTotal  = allAchv.filter(a => a.rarity === r).length
          const rUnlock = myAchv.filter(a => a.rarity === r).length
          return (
            <div key={r} className="flex items-center gap-3">
              <span className="text-xs w-8" style={{ color: rc.text }}>{rc.label}</span>
              <div className="flex-1">
                <ProgressBar value={rUnlock} total={rTotal} color={rc.stroke} />
              </div>
            </div>
          )
        })}
      </div>

      {/* 分类筛选 */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORY_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
              activeFilter === f
                ? "text-white"
                : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-200"
            }`}
            style={activeFilter === f ? { background: "#7F77DD" } : {}}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 成就网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {sorted.map(a => (
          <AchievementCard
            key={a.code}
            achv={a}
            unlocked={unlockedCodes.has(a.code)}
          />
        ))}
      </div>
    </div>
  )
}