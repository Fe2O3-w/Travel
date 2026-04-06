import { useEffect, useRef, useState } from "react"
import { usePetStore, type PetMood } from "../stores/petStore"

// ── 属性进度条 ────────────────────────────────────────────────────────────────
function StatBar({ label, value, color, emoji }: {
  label: string; value: number; color: string; emoji: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-base w-5">{emoji}</span>
      <span className="text-xs text-gray-500 dark:text-zinc-400 w-6">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-gray-400 w-6 text-right">{value}</span>
    </div>
  )
}

// ── 心情 → 颜色 & emoji ────────────────────────────────────────────────────────
const MOOD_MAP: Record<PetMood, { dot: string; face: string }> = {
  happy:   { dot: "#a855f7", face: "😄" },
  excited: { dot: "#f59e0b", face: "🤩" },
  normal:  { dot: "#60a5fa", face: "😊" },
  sad:     { dot: "#6b7280", face: "😢" },
  sleepy:  { dot: "#94a3b8", face: "😴" },
}

// ── 主组件 ────────────────────────────────────────────────────────────────────
export default function PetWidget() {
  const [panelOpen, setPanelOpen] = useState(false)
  const lottieRef  = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  const {
    mood, hunger, energy,
    dialogue, isAnimating,
    getPetMood, getOverallHappiness,
    feed, play, rest, init,
  } = usePetStore()

  const petMood = getPetMood()
  const { dot, face } = MOOD_MAP[petMood]

  // ── 初始化 store + Lottie ─────────────────────────────────────────────────
  useEffect(() => {
  if (initialized.current) return
  initialized.current = true
  init()
  // 直接用 SVG 动画，不需要 lottie 文件
  if (lottieRef.current) {
    lottieRef.current.innerHTML = `
      <svg width="64" height="64" viewBox="0 0 64 64">
        <style>
          @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
          @keyframes blink { 0%,90%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.1)} }
          .body { animation: bob 2s ease-in-out infinite; transform-origin: 32px 32px; }
          .eye  { animation: blink 3s ease-in-out infinite; transform-origin: center; }
        </style>
        <g class="body">
          <circle cx="32" cy="36" r="20" fill="#c4b5fd"/>
          <circle cx="32" cy="22" r="14" fill="#c4b5fd"/>
          <circle class="eye" cx="27" cy="20" r="3" fill="#4c1d95"/>
          <circle class="eye" cx="37" cy="20" r="3" fill="#4c1d95"/>
          <circle cx="28" cy="19" r="1" fill="white"/>
          <circle cx="38" cy="19" r="1" fill="white"/>
          <path d="M28 25 Q32 28 36 25" fill="none" stroke="#4c1d95" stroke-width="1.5" stroke-linecap="round"/>
          <ellipse cx="22" cy="36" rx="6" ry="4" fill="#ddd6fe" transform="rotate(-20,22,36)"/>
          <ellipse cx="42" cy="36" rx="6" ry="4" fill="#ddd6fe" transform="rotate(20,42,36)"/>
        </g>
      </svg>`
  }
}, [init])

  return (
    <>
      {/* ── 悬浮按钮 ── */}
      <div
        className={`fixed bottom-20 right-5 z-50 cursor-pointer select-none transition-transform duration-200 ${isAnimating ? "scale-110" : "hover:scale-105"}`}
        onClick={() => setPanelOpen((o) => !o)}
        title="点击与我互动"
      >
        {/* Lottie 容器 */}
        <div ref={lottieRef} className="w-16 h-16 flex items-center justify-center" />

        {/* 状态指示点 */}
        <div
          className="absolute bottom-1.5 right-1.5 w-3 h-3 rounded-full border-2 border-white"
          style={{ backgroundColor: dot }}
        />

        {/* 台词气泡 */}
        {dialogue && (
          <div className="absolute bottom-20 right-0 max-w-[180px] bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl rounded-br-none px-3 py-2 text-xs text-gray-700 dark:text-zinc-200 shadow-lg leading-relaxed whitespace-pre-wrap pointer-events-none animate-fade-in">
            {dialogue}
          </div>
        )}
      </div>

      {/* ── 操作面板 ── */}
      {panelOpen && (
        <div className="fixed bottom-40 right-4 w-56 bg-white dark:bg-zinc-900 rounded-2xl p-4 z-50 shadow-2xl border border-gray-100 dark:border-zinc-800 animate-fade-up">
          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-800 dark:text-zinc-100">旅行小伙伴</span>
            <button
              onClick={() => setPanelOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* 属性条 */}
          <div className="space-y-2 mb-4">
            <StatBar label="心情" value={mood}   color="#a855f7" emoji="😊" />
            <StatBar label="饱腹" value={hunger} color="#f97316" emoji="🍜" />
            <StatBar label="活力" value={energy} color="#22c55e" emoji="⚡" />
          </div>

          {/* 互动按钮 */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {([
              { icon: "🍡", label: "喂食", action: () => feed() },
              { icon: "🎮", label: "玩耍", action: () => play() },
              { icon: "💤", label: "休息", action: () => rest() },
            ] as const).map(({ icon, label, action }) => (
              <button
                key={label}
                onClick={action}
                className="flex flex-col items-center gap-1 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-600 dark:text-zinc-300 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all"
              >
                <span className="text-xl">{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* 综合幸福度 */}
          <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100 dark:border-zinc-800">
            综合幸福度 {getOverallHappiness()} / 100
          </div>
        </div>
      )}
    </>
  )
}