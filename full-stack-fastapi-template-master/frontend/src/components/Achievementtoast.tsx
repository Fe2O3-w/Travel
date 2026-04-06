import { useEffect, useState } from "react"
import { AchievementIcon, RARITY_COLORS } from "./AchievementIcons"

interface Achievement {
  code: string
  name: string
  description: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

interface Props {
  achievement: Achievement | null
  onDone: () => void
}

/**
 * 成就解锁弹窗
 * 用专属图标替代一贯的奖杯，配合稀有度颜色主题
 */
export default function AchievementToast({ achievement, onDone }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!achievement) { setVisible(false); return }
    setVisible(true)
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300)
    }, 2800)
    return () => clearTimeout(t)
  }, [achievement, onDone])

  if (!achievement) return null
  const rarity = RARITY_COLORS[achievement.rarity]

  return (
    <div
      className="pointer-events-none"
      style={{
        position: "absolute",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        transition: "opacity .3s, transform .3s",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateX(-50%) scale(1)"
          : "translateX(-50%) scale(0.8)",
      }}
    >
      <div
        className="flex flex-col items-center px-6 py-4 rounded-2xl shadow-2xl min-w-[200px]"
        style={{
          background: rarity.bg,
          border: `2px solid ${rarity.stroke}`,
        }}
      >
        {/* 专属图标 */}
        <div className="mb-2">
          <AchievementIcon code={achievement.code} size={64} unlocked />
        </div>

        <p className="text-xs mb-1" style={{ color: rarity.text, opacity: 0.7 }}>
          成就解锁！
        </p>
        <p className="text-base font-medium" style={{ color: rarity.text }}>
          {achievement.name}
        </p>
        <p className="text-xs mt-1 text-center leading-relaxed" style={{ color: rarity.text, opacity: 0.75 }}>
          {achievement.description}
        </p>

        {/* 稀有度标签 */}
        <span
          className="mt-2 text-xs px-2 py-0.5 rounded-full"
          style={{ background: rarity.stroke, color: "#fff" }}
        >
          {rarity.label}
        </span>
      </div>
    </div>
  )
}