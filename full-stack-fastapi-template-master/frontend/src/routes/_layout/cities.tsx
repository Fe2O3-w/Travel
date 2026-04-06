import { createFileRoute } from "@tanstack/react-router"
import { useState, useMemo } from "react"
import { CITY_DATA, type CityInfo } from "../../data/cityData"
import { useCityStore } from "../../stores/cityStore"

export const Route = createFileRoute("/_layout/cities")({
  component: CitiesPage,
})

const PROVINCES = [
  "全部",
  "华北", "东北", "华东", "华中", "华南", "西南", "西北", "港澳台",
]

const PROVINCE_MAP: Record<string, string[]> = {
  华北:  ["北京市", "天津市", "河北省", "山西省", "内蒙古自治区"],
  东北:  ["辽宁省", "吉林省", "黑龙江省"],
  华东:  ["上海市", "江苏省", "浙江省", "安徽省", "福建省", "江西省", "山东省"],
  华中:  ["河南省", "湖北省", "湖南省"],
  华南:  ["广东省", "广西壮族自治区", "海南省"],
  西南:  ["重庆市", "四川省", "贵州省", "云南省", "西藏自治区"],
  西北:  ["陕西省", "甘肃省", "青海省", "宁夏回族自治区", "新疆维吾尔自治区"],
  港澳台: ["香港特别行政区", "澳门特别行政区", "台湾省"],
}

// ── 随机抽取 ──────────────────────────────────────────────────────────────────
function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  const result: T[] = []
  while (result.length < n && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length)
    result.push(copy.splice(idx, 1)[0])
  }
  return result
}

// ── 随机推荐卡片 ──────────────────────────────────────────────────────────────
function RecommendCard({
  city,
  onClick,
}: {
  city: CityInfo
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className="rounded-2xl p-4 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 relative overflow-hidden"
    >
      {/* 背景装饰 */}
      <div className="absolute top-2 right-3 text-5xl opacity-10 select-none pointer-events-none">
        {city.emoji}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span style={{ fontSize: 24 }}>{city.emoji}</span>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{city.name}</h3>
          <p className="text-xs text-gray-400">{city.province}</p>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-zinc-400 mb-2">
        {city.scenery[0]} · {city.food[0]}
      </p>

      <span
        className="text-xs px-2 py-0.5 rounded-full text-white"
        style={{ background: "#7c3aed" }}
      >
        去探索 →
      </span>
    </div>
  )
}

// ── 城市卡片 ──────────────────────────────────────────────────────────────────
function CityCard({
  city,
  visited,
  onClick,
}: {
  city: CityInfo
  visited: boolean
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className="rounded-2xl p-4 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800"
      style={visited ? { borderColor: "#a78bfa" } : {}}
    >
      <div className="flex items-center gap-2 mb-3">
        <span style={{ fontSize: 28 }}>{city.emoji}</span>
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-medium text-gray-900 dark:text-white">{city.name}</h3>
            {visited && (
              <span className="text-xs px-1.5 py-0.5 rounded-full text-white" style={{ background: "#7c3aed" }}>
                已打卡
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">{city.province}</p>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex gap-1 flex-wrap">
          {city.scenery.slice(0, 3).map(s => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300">
              🏔 {s}
            </span>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          {city.food.slice(0, 3).map(f => (
            <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-300">
              🍜 {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 城市详情抽屉 ──────────────────────────────────────────────────────────────
function CityDetailDrawer({
  city,
  visited,
  onClose,
  onCheckin,
}: {
  city: CityInfo
  visited: boolean
  onClose: () => void
  onCheckin: () => void
}) {
  const [checking, setChecking] = useState(false)

  const handleCheckin = async () => {
    setChecking(true)
    await onCheckin()
    setChecking(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 space-y-5 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 40 }}>{city.emoji}</span>
            <div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">{city.name}</h2>
              <p className="text-sm text-gray-400">{city.province}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {!visited ? (
          <button
            onClick={handleCheckin}
            disabled={checking}
            className="w-full py-3 rounded-2xl text-sm font-medium text-white disabled:opacity-60"
            style={{ background: "#7c3aed" }}
          >
            {checking ? "打卡中..." : "📍 打卡这座城市"}
          </button>
        ) : (
          <div className="w-full py-3 rounded-2xl text-sm font-medium text-center"
            style={{ background: "#ede9fe", color: "#7c3aed" }}>
            ✅ 已打卡
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">🏔 必游景点</h4>
          <div className="flex flex-wrap gap-2">
            {city.scenery.map(s => (
              <span key={s} className="text-sm px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300">{s}</span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">🍜 特色美食</h4>
          <div className="flex flex-wrap gap-2">
            {city.food.map(f => (
              <span key={f} className="text-sm px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-300">{f}</span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">🎭 文化特色</h4>
          <div className="flex flex-wrap gap-2">
            {city.culture.map(c => (
              <span key={c} className="text-sm px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300">{c}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 主页面 ────────────────────────────────────────────────────────────────────
function CitiesPage() {
  const { visitedCities, checkinCity } = useCityStore()
  const [search,    setSearch]    = useState("")
  const [region,    setRegion]    = useState("全部")
  const [selected,  setSelected]  = useState<CityInfo | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const visitedSet = new Set(visitedCities)

  // 未打卡城市
  const unvisited = Object.values(CITY_DATA).filter(c => !visitedSet.has(c.name))

  // 随机推荐5个（refreshKey 变化时重新随机）
  const recommended = useMemo(
    () => pickRandom(unvisited, 5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visitedCities.length, refreshKey]
  )

  // 全部城市过滤
  const cities = Object.values(CITY_DATA).filter(city => {
    const matchSearch = !search || city.name.includes(search) || city.province.includes(search)
    const matchRegion = region === "全部" || (PROVINCE_MAP[region] ?? []).includes(city.province)
    return matchSearch && matchRegion
  })

  const sorted = [...cities].sort((a, b) => {
    const va = visitedSet.has(a.name) ? 0 : 1
    const vb = visitedSet.has(b.name) ? 0 : 1
    return va - vb
  })

  const handleCheckin = async (city: CityInfo) => {
    await checkinCity(city.name, city.province)
  }

  return (
    <div className="space-y-6">
      {/* 顶부 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white">城市推荐</h1>
          <p className="text-sm text-gray-400 mt-0.5">探索中国各地的景点、美食与文化</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-medium" style={{ color: "#7c3aed" }}>
            {visitedCities.length}
            <span className="text-base text-gray-400 font-normal"> / {Object.keys(CITY_DATA).length}</span>
          </div>
          <p className="text-xs text-gray-400">已打卡</p>
        </div>
      </div>

      {/* 随机推荐区域 */}
      {recommended.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-medium text-gray-800 dark:text-white">
              ✨ 今日推荐探索
            </h2>
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="text-xs text-violet-500 hover:text-violet-700 flex items-center gap-1"
            >
              🔄 换一批
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {recommended.map(city => (
              <RecommendCard
                key={city.name}
                city={city}
                onClick={() => setSelected(city)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 分割线 */}
      <div className="border-t border-gray-100 dark:border-zinc-800" />

      {/* 搜索 + 地区筛选 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索城市或省份..."
          className="flex-1 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-100 placeholder-gray-400"
        />
        <div className="flex gap-2 flex-wrap">
          {PROVINCES.map(p => (
            <button
              key={p}
              onClick={() => setRegion(p)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                region === p ? "text-white" : "bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:bg-gray-200"
              }`}
              style={region === p ? { background: "#7c3aed" } : {}}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400">
        共 {sorted.length} 座城市，其中 {sorted.filter(c => visitedSet.has(c.name)).length} 座已打卡
      </p>

      {/* 城市网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {sorted.map(city => (
          <CityCard
            key={city.name}
            city={city}
            visited={visitedSet.has(city.name)}
            onClick={() => setSelected(city)}
          />
        ))}
      </div>

      {/* 详情弹窗 */}
      {selected && (
        <CityDetailDrawer
          city={selected}
          visited={visitedSet.has(selected.name)}
          onClose={() => setSelected(null)}
          onCheckin={() => handleCheckin(selected)}
        />
      )}
    </div>
  )
}