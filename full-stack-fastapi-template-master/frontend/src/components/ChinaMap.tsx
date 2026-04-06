import { useEffect, useRef, useState, useCallback } from "react"
import * as echarts from "echarts"
import { useCityStore, type AchievementOut } from "../stores/cityStore"
import { usePetStore } from "../stores/petStore"
import { CITY_DATA, type CityInfo } from "../data/cityData"
import AchievementToast from "./AchievementToast"

type TabKey = "景点" | "美食" | "文化"

// ── 城市信息抽屉 ──────────────────────────────────────────────────────────────
function CityDrawer({
  city,
  isVisited,
  onClose,
  onCheckin,
}: {
  city: CityInfo
  isVisited: boolean
  onClose: () => void
  onCheckin: () => void
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("景点")
  const tabs: TabKey[] = ["景点", "美食", "文化"]
  const tabItems: Record<TabKey, string[]> = {
    景点: city.scenery,
    美食: city.food,
    文化: city.culture,
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-2xl p-5 shadow-2xl z-10 animate-slide-up">
      <button
        onClick={onClose}
        className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
      >
        ×
      </button>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{city.emoji}</span>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{city.name}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{city.province}</p>
        </div>
        <button
          onClick={onCheckin}
          disabled={isVisited}
          className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
            isVisited
              ? "bg-violet-600 border-violet-600 text-white cursor-default"
              : "border-violet-600 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950"
          }`}
        >
          {isVisited ? "✓ 已打卡" : "📍 打卡"}
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              activeTab === tab
                ? "bg-violet-100 text-violet-700 font-medium dark:bg-violet-950 dark:text-violet-300"
                : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {tabItems[activeTab].map((item) => (
          <span
            key={item}
            className="px-3 py-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-zinc-300"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── 主组件 ────────────────────────────────────────────────────────────────────
interface ChinaMapProps {
  onCityCheckin?: (cityName: string) => void
}

export default function ChinaMap({ onCityCheckin }: ChinaMapProps) {
  const chartRef  = useRef<HTMLDivElement>(null)
  const chartInst = useRef<echarts.ECharts | null>(null)
  const [selectedCity, setSelectedCity] = useState<CityInfo | null>(null)
  const [popupAchv,    setPopupAchv]    = useState<AchievementOut | null>(null)
  const [mapReady,     setMapReady]     = useState(false)

  const { visitedCities, fetchVisited, checkinCity } = useCityStore()
  const petStore = usePetStore()

  // ── 加载地图 JSON ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/assets/china.json")
      .then((r) => r.json())
      .then((json) => {
        echarts.registerMap("china", { geoJSON: json } as any)
        setMapReady(true)
      })
      .catch(() => console.error("china.json 未找到，请放到 public/assets/china.json"))
  }, [])

  // ── 构建地图配置 ───────────────────────────────────────────────────────────
  const buildOption = useCallback(() => {
    const mapData = Object.values(CITY_DATA).map((c) => ({
      name:     c.province,
      value:    visitedCities.includes(c.name) ? 1 : 0,
      cityName: c.name,
    }))
    return {
      backgroundColor: "transparent",
      tooltip: { trigger: "item", formatter: (p: { name: string }) => p.name },
      visualMap: {
        show: false, min: 0, max: 1,
        inRange: { color: ["#ede9fe", "#7c3aed"] },
      },
      series: [{
        type: "map", map: "china",
        roam: true, zoom: 1.2,
        scaleLimit: { min: 0.8, max: 4 },
        data: mapData,
        label:     { show: true, fontSize: 10, color: "#6b7280" },
        emphasis:  { label: { color: "#7c3aed", fontWeight: "bold" }, itemStyle: { areaColor: "#c4b5fd" } },
        itemStyle: { borderColor: "#fff", borderWidth: 0.8 },
        select:    { itemStyle: { areaColor: "#7c3aed" } },
      }],
    }
  }, [visitedCities])

  // ── 初始化 ECharts ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !chartRef.current) return
    if (!chartInst.current) {
      chartInst.current = echarts.init(chartRef.current, undefined, { renderer: "svg" })
      chartInst.current.on("click", (params) => {
        const city = Object.values(CITY_DATA).find((c) => c.province === params.name)
        if (city) setSelectedCity(city)
      })
    }
    chartInst.current.setOption(buildOption())
  }, [mapReady, buildOption])

  // ── 响应窗口缩放 ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => chartInst.current?.resize()
    window.addEventListener("resize", onResize)
    fetchVisited()
    return () => {
      window.removeEventListener("resize", onResize)
      chartInst.current?.dispose()
    }
  }, [fetchVisited])

  // ── 打卡逻辑 ──────────────────────────────────────────────────────────────
  const handleCheckin = useCallback(async (city: CityInfo) => {
    if (visitedCities.includes(city.name)) return
    const result = await checkinCity(city.name, city.province)

    // 通知桌宠
    petStore.onCityArrive(city.name, city.food[0] ?? "", city.scenery[0] ?? "")

    // 打卡成功后触发社区面板回调
    onCityCheckin?.(city.name)

    // 逐个显示成就弹窗
    for (const achv of result.newly_unlocked) {
      petStore.onAchievementUnlock(achv.name, achv.reward_mood ?? 0, achv.reward_energy ?? 0)
      setPopupAchv(achv)
      await new Promise((res) => setTimeout(res, 2800))
      setPopupAchv(null)
      await new Promise((res) => setTimeout(res, 400))
    }
  }, [visitedCities, checkinCity, petStore, onCityCheckin])

  return (
    <div className="relative w-full h-full">
      <div ref={chartRef} className="w-full h-full min-h-[480px]" />

      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          地图加载中…
        </div>
      )}

      {selectedCity && (
        <CityDrawer
          city={selectedCity}
          isVisited={visitedCities.includes(selectedCity.name)}
          onClose={() => setSelectedCity(null)}
          onCheckin={() => handleCheckin(selectedCity)}
        />
      )}

      <AchievementToast
        achievement={popupAchv}
        onDone={() => setPopupAchv(null)}
      />
    </div>
  )
}