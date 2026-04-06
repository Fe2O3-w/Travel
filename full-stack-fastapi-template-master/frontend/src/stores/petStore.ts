import { create } from "zustand"
import { persist } from "zustand/middleware"

// ── 常量 ──────────────────────────────────────────────────────────────────────
const DECAY_INTERVAL_MS = 10 * 60 * 1000  // 10 分钟
const MAX = 100
const MIN = 0
const clamp = (v: number) => Math.max(MIN, Math.min(MAX, v))

// ── 台词库 ────────────────────────────────────────────────────────────────────
const DIALOGUES: Record<string, string[]> = {
  city_arrive:          ["哇！我们到{city}啦！听说这里的{food}超好吃！", "欢迎来到{city}！我已经迫不及待要探索了！"],
  achievement_unlock:   ["叮咚！你解锁了新成就——「{name}」！超厉害的！", "恭喜！「{name}」成就到手啦！继续加油！"],
  hungry:               ["主人……我有点饿了……", "咕咕咕……能给我点吃的吗？"],
  low_energy:           ["我有点累了，让我休息一下吧……", "打个盹儿就好……zzz"],
  happy:                ["今天过得真开心！", "有你陪着我，到哪里都不怕！", "我们一起把中国都走遍吧！"],
  feed:                 ["好好吃！谢谢主人！", "嗯嗯！最喜欢{food}了！"],
  play:                 ["耶！一起玩吧！", "哈哈哈！"],
  rest:                 ["zzz……（满足的呼噜声）", "好舒服……休息好再出发！"],
}

function pickDialogue(scene: string, vars: Record<string, string> = {}): string {
  const pool = DIALOGUES[scene] ?? DIALOGUES.happy
  let text = pool[Math.floor(Math.random() * pool.length)]
  Object.entries(vars).forEach(([k, v]) => { text = text.replace(`{${k}}`, v) })
  return text
}

// ── 类型 ──────────────────────────────────────────────────────────────────────
export type PetMood = "happy" | "normal" | "sad" | "sleepy" | "excited"

interface PetState {
  // 属性（会持久化）
  mood:     number
  hunger:   number
  energy:   number
  lastSaved: string

  // UI 状态（不持久化）
  dialogue:    string | null
  isAnimating: boolean

  // 计算
  getPetMood:          () => PetMood
  getOverallHappiness: () => number

  // 互动
  feed:   (foodName?: string) => Promise<void>
  play:   () => Promise<void>
  rest:   () => void

  // 触发器
  onCityArrive:         (city: string, food: string, scenery: string) => void
  onAchievementUnlock:  (name: string, rewardMood?: number, rewardEnergy?: number) => void

  // 内部
  say:        (text: string, duration?: number) => void
  applyDecay: () => void
  init:       () => void
}

// ── Store ─────────────────────────────────────────────────────────────────────
// persist 中间件把 mood/hunger/energy/lastSaved 自动存到 localStorage
export const usePetStore = create<PetState>()(
  persist(
    (set, get) => {
      let dialogueTimer: ReturnType<typeof setTimeout> | null = null
      let decayTimer:    ReturnType<typeof setInterval> | null = null

      return {
        // 初始值
        mood:      80,
        hunger:    70,
        energy:    90,
        lastSaved: new Date().toISOString(),
        dialogue:  null,
        isAnimating: false,

        // ── 计算 ──
        getPetMood(): PetMood {
          const { energy, hunger, mood } = get()
          if (energy < 20) return "sleepy"
          if (hunger < 20) return "sad"
          if (mood >= 80)  return "happy"
          if (mood >= 50)  return "normal"
          return "sad"
        },

        getOverallHappiness(): number {
          const { mood, hunger, energy } = get()
          return Math.round((mood + hunger + energy) / 3)
        },

        // ── 台词 ──
        say(text, duration = 4000) {
          if (dialogueTimer) clearTimeout(dialogueTimer)
          set({ dialogue: text })
          dialogueTimer = setTimeout(() => set({ dialogue: null }), duration)
        },

        // ── 互动 ──
        async feed(foodName = "") {
          const { mood, hunger, say } = get()
          set({
            hunger:      clamp(hunger + 25),
            mood:        clamp(mood + 5),
            isAnimating: true,
            lastSaved:   new Date().toISOString(),
          })
          say(pickDialogue("feed", { food: foodName || "美食" }))
          await logInteract("feed")
          setTimeout(() => set({ isAnimating: false }), 1000)
        },

        async play() {
          const { energy, mood, hunger, say } = get()
          if (energy < 10) { say("我太累了……不想动……"); return }
          set({
            mood:        clamp(mood + 20),
            energy:      clamp(energy - 15),
            isAnimating: true,
            lastSaved:   new Date().toISOString(),
          })
          say(pickDialogue("play"))
          await logInteract("play")
          setTimeout(() => set({ isAnimating: false }), 1200)
        },

        rest() {
          const { energy, mood, say } = get()
          set({
            energy:    clamp(energy + 30),
            mood:      clamp(mood + 5),
            lastSaved: new Date().toISOString(),
          })
          say(pickDialogue("rest"))
          logInteract("rest")
        },

        // ── 外部触发 ──
        onCityArrive(city, food, scenery) {
          const { mood, say } = get()
          set({ mood: clamp(mood + 10), lastSaved: new Date().toISOString() })
          say(pickDialogue("city_arrive", { city, food, scenery }), 5000)
        },

        onAchievementUnlock(name, rewardMood = 0, rewardEnergy = 0) {
          const { mood, energy, say } = get()
          set({
            mood:      clamp(mood   + rewardMood),
            energy:    clamp(energy + rewardEnergy),
            lastSaved: new Date().toISOString(),
          })
          say(pickDialogue("achievement_unlock", { name }), 5000)
        },

        // ── 离线衰减补算 ──
        applyDecay() {
          const { lastSaved, mood, hunger, energy } = get()
          const offlineMs = Date.now() - new Date(lastSaved).getTime()
          const ticks = Math.floor(offlineMs / DECAY_INTERVAL_MS)
          if (ticks <= 0) return
          set({
            mood:      clamp(mood   - ticks * 1),
            hunger:    clamp(hunger - ticks * 3),
            energy:    clamp(energy - ticks * 2),
            lastSaved: new Date().toISOString(),
          })
        },

        // ── 初始化 ──
        init() {
          get().applyDecay()

          // 每 10 分钟实时衰减
          if (decayTimer) clearInterval(decayTimer)
          decayTimer = setInterval(() => {
            const { mood, hunger, energy, say } = get()
            const newHunger = clamp(hunger - 3)
            const newEnergy = clamp(energy - 2)
            const newMood   = clamp(mood   - (newHunger < 30 ? 3 : 1))
            set({ mood: newMood, hunger: newHunger, energy: newEnergy, lastSaved: new Date().toISOString() })
            if (newHunger <= 20 && newHunger > 17) say(pickDialogue("hungry"))
            if (newEnergy <= 20 && newEnergy > 17) say(pickDialogue("low_energy"))
          }, DECAY_INTERVAL_MS)

          // 开场问候
          setTimeout(() => {
            const mood = get().getPetMood()
            if (mood === "happy") get().say(pickDialogue("happy"))
            else if (mood === "sad") get().say(pickDialogue("hungry"))
          }, 1800)
        },
      }
    },
    {
      name: "pet_state",
      // 只持久化数值，不持久化 dialogue/isAnimating
      partialize: (s) => ({
        mood: s.mood, hunger: s.hunger,
        energy: s.energy, lastSaved: s.lastSaved,
      }),
    }
  )
)

// ── 后端互动日志（供成就系统计数） ──────────────────────────────────────────
async function logInteract(type: "feed" | "play" | "rest") {
  try {
    await fetch("/api/v1/pet/interact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ type }),
    })
  } catch { /* 离线时静默失败 */ }
}