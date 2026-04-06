import { create } from "zustand"
import { CITY_DATA } from "../data/cityData"

export interface AchievementOut {
  id: number
  code: string
  name: string
  description: string
  category: string
  rarity: "common" | "rare" | "epic" | "legendary"
  icon_url: string | null
  unlocked_at: string | null
  reward_mood?: number
  reward_energy?: number
}

export interface CheckinResult {
  visited_cities: string[]
  newly_unlocked: AchievementOut[]
  total_city_count: number
}

interface CityState {
  visitedCities: string[]
  isLoading: boolean
  locatedCity: string | null
  fetchVisited: () => Promise<void>
  checkinCity: (cityName: string, province: string) => Promise<CheckinResult>
  autoCheckinByIP: () => Promise<typeof CITY_DATA[string] | null>
}

export const useCityStore = create<CityState>((set, get) => ({
  visitedCities: [],
  isLoading: false,
  locatedCity: null,

  fetchVisited: async () => {
    try {
      const res = await fetch("/api/v1/achievements/visited-cities", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      })
      if (!res.ok) return
      const data = await res.json()
      set({ visitedCities: data.cities })
    } catch { }
  },

  checkinCity: async (cityName, province) => {
    set({ isLoading: true })
    const res = await fetch("/api/v1/achievements/checkin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ city_name: cityName, province, source: "manual" }),
    })
    const data: CheckinResult = await res.json()
    set({ visitedCities: data.visited_cities, isLoading: false })
    return data
  },

  autoCheckinByIP: async () => {
    try {
      // ip-api.com 免费接口，返回中文省份和城市
      const res  = await fetch("http://ip-api.com/json/?lang=zh-CN&fields=status,regionName,city")
      const data = await res.json()
      if (data.status !== "success") return null

      const { city, regionName } = data as { status: string; city: string; regionName: string }

      // 先按城市名精确匹配，再按省份模糊匹配
      const match =
        Object.values(CITY_DATA).find(c => c.name === city) ??
        Object.values(CITY_DATA).find(c => c.province.includes(regionName))

      if (!match) return null

      // 已打卡不重复打
      if (get().visitedCities.includes(match.name)) {
        set({ locatedCity: match.name })
        return match
      }

      // 自动打卡（来源标记为 gps）
      const checkinRes = await fetch("/api/v1/achievements/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          city_name: match.name,
          province: match.province,
          source: "gps",
        }),
      })
      const checkinData: CheckinResult = await checkinRes.json()
      set({ visitedCities: checkinData.visited_cities, locatedCity: match.name })
      return match
    } catch {
      return null
    }
  },
}))