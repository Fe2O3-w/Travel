/**
 * 成就专属 SVG 图标
 * 每个成就 code 对应一个与解锁条件相关的图标
 */

interface BadgeProps {
  size?: number
  unlocked?: boolean
}

// ── 稀有度颜色 ─────────────────────────────────────────────────────────────────
export const RARITY_COLORS = {
  common:    { bg: "#EEEDFE", stroke: "#AFA9EC", text: "#534AB7", label: "普通" },
  rare:      { bg: "#E6F1FB", stroke: "#85B7EB", text: "#185FA5", label: "稀有" },
  epic:      { bg: "#E1F5EE", stroke: "#5DCAA5", text: "#085041", label: "史诗" },
  legendary: { bg: "#FAEEDA", stroke: "#EF9F27", text: "#633806", label: "传说" },
} as const

// ── 各成就专属图标 SVG ────────────────────────────────────────────────────────

function Backpack({ size = 64, unlocked = true }: BadgeProps) {
  const op = unlocked ? 1 : 0.35
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" opacity={op}>
      <circle cx="50" cy="50" r="46" fill="#EEEDFE" stroke="#AFA9EC" strokeWidth="1.5"/>
      <rect x="28" y="30" width="44" height="36" rx="6" fill="#7F77DD"/>
      <rect x="33" y="24" width="34" height="10" rx="4" fill="#534AB7"/>
      <rect x="38" y="20" width="24" height="6" rx="3" fill="#534AB7"/>
      <rect x="34" y="44" width="32" height="14" rx="3" fill="#AFA9EC"/>
      <line x1="50" y1="30" x2="50" y2="44" stroke="#EEEDFE" strokeWidth="1.5"/>
    </svg>
  )
}

function Compass({ size = 64, unlocked = true }: BadgeProps) {
  const op = unlocked ? 1 : 0.35
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" opacity={op}>
      <circle cx="50" cy="50" r="46" fill="#E6F1FB" stroke="#85B7EB" strokeWidth="1.5"/>
      <circle cx="50" cy="50" r="28" fill="none" stroke="#378ADD" strokeWidth="2"/>
      <circle cx="50" cy="50" r="4" fill="#185FA5"/>
      <polygon points="50,26 46,50 50,44 54,50" fill="#E24B4A"/>
      <polygon points="50,74 46,50 50,56 54,50" fill="#888780"/>
      <line x1="26" y1="50" x2="74" y2="50" stroke="#B5D4F4" strokeWidth="1"/>
    </svg>
  )
}

function Globe({ size = 64, unlocked = true }: BadgeProps) {
  const op = unlocked ? 1 : 0.35
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" opacity={op}>
      <circle cx="50" cy="50" r="46" fill="#E1F5EE" stroke="#5DCAA5" strokeWidth="1.5"/>
      <circle cx="50" cy="50" r="28" fill="#9FE1CB" stroke="#1D9E75" strokeWidth="1.5"/>
      <ellipse cx="50" cy="50" rx="12" ry="28" fill="none" stroke="#0F6E56" strokeWidth="1.2"/>
      <line x1="22" y1="50" x2="78" y2="50" stroke="#0F6E56" strokeWidth="1.2"/>
      <path d="M26 38 Q50 32 74 38" fill="none" stroke="#0F6E56" strokeWidth="1"/>
      <path d="M26 62 Q50 68 74 62" fill="none" stroke="#0F6E56" strokeWidth="1"/>
      <line x1="50" y1="22" x2="50" y2="16" stroke="#1D9E75" strokeWidth="2"/>
      <circle cx="50" cy="14" r="4" fill="#1D9E75"/>
    </svg>
  )
}

function MapStamp({ size = 64, unlocked = true }: BadgeProps) {
  const op = unlocked ? 1 : 0.35
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" opacity={op}>
      <circle cx="50" cy="50" r="46" fill="#FAEEDA" stroke="#EF9F27" strokeWidth="1.5"/>
      <rect x="24" y="28" width="52" height="44" rx="4" fill="#FAC775" stroke="#BA7517" strokeWidth="1.2"/>
      <line x1="40" y1="28" x2="40" y2="72" stroke="#BA7517" strokeWidth="0.8"/>
      <line x1="55" y1="28" x2="55" y2="72" stroke="#BA7517" strokeWidth="0.8"/>
      <line x1="24" y1="44" x2="76" y2="44" stroke="#BA7517" strokeWidth="0.8"/>
      <line x1="24" y1="58" x2="76" y2="58" stroke="#BA7517" strokeWidth="0.8"/>
      <circle cx="62" cy="62" r="12" fill="#E24B4A" opacity={0.9}/>
      <text x="62" y="66" textAnchor="middle" fontSize="10" fill="white" fontWeight="500">印</text>
    </svg>
  )
}

function Hotpot({ size = 64, unlocked = true }: BadgeProps) {
  const op = unlocked ? 1 : 0.35
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" opacity={op}>
      <circle cx="50" cy="50" r="46" fill="#FAECE7" stroke="#F0997B" strokeWidth="1.5"/>
      <ellipse cx="50" cy="62" rx="24" ry="10" fill="#D85A30"/>
      <rect x="26" y="44" width="48" height="20" rx="6" fill="#993C1D"/>
      <ellipse cx="50" cy="44" rx="24" ry="7" fill="#D85A30"/>
      <line x1="34" y1="30" x2="30" y2="44" stroke="#D85A30" strokeWidth="2" strokeLinecap="round"/>
      <line x1="44" y1="26" x2="42" y2="44" stroke="#D85A30" strokeWidth="2" strokeLinecap="round"/>
      <line x1="56" y1="26" x2="58" y2="44" stroke="#D85A30" strokeWidth="2" strokeLinecap="round"/>
      <line x1="66" y1="30" x2="70" y2="44" stroke="#D85A30" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function Bridge({ size = 64, unlocked = true }: BadgeProps) {
  const op = unlocked ? 1 : 0.35
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" opacity={op}>
      <circle cx="50" cy="50" r="46" fill="#E6F1FB" stroke="#85B7EB" strokeWidth="1.5"/>
      <rect x="16" y="60" width="68" height="8" rx="2" fill="#378ADD"/>
      <path d="M20 60 Q50 30 80 60" fill="#B5D4F4" stroke="#185FA5" strokeWidth="2"/>
      <rect x="18" y="48" width="8" height="16" rx="2" fill="#185FA5"/>
      <rect x="74" y="48" width="8" height="16" rx="2" fill="#185FA5"/>
      <path d="M24 60 Q50 40 76 60" fill="none" stroke="#0C447C" strokeWidth="1.5"/>
      <line x1="16" y1="68" x2="84" y2="68" stroke="#B5D4F4" strokeWidth="3"/>
    </svg>
  )
}

function Chili({ size = 64, unlocked = true }: BadgeProps) {
  const op = unlocked ? 1 : 0.35
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" opacity={op}>
      <circle cx="50" cy="50" r="46" fill="#FCEBEB" stroke="#F09595" strokeWidth="1.5"/>
      <path d="M50 72 Q38 60 36 46 Q34 32 44 28 Q52 26 56 34 Q64 30 66 38 Q68 52 58 64 Z" fill="#E24B4A"/>
      <path d="M50 72 Q44 60 43 48 Q42 36 48 32" fill="none" stroke="#A32D2D" strokeWidth="1.2"/>
      <path d="M56 34 Q60 28 58 22 Q54 16 56 12" fill="none" stroke="#639922" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="44" cy="44" r="3" fill="#F7C1C1" opacity={0.7}/>
    </svg>
  )
}

function PaperPlane({ size = 64, unlocked = true }: BadgeProps) {
  const op = unlocked ? 1 : 0.35
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" opacity={op}>
      <circle cx="50" cy="50" r="46" fill="#E1F5EE" stroke="#5DCAA5" strokeWidth="1.5"/>
      <polygon points="18,62 82,40 46,74" fill="#1D9E75"/>
      <polygon points="18,62 82,40 42,54" fill="#9FE1CB"/>
      <line x1="46" y1="54" x2="46" y2="74" stroke="#0F6E56" strokeWidth="1"/>
    </svg>
  )
}

function StarHeart({ size = 64, unlocked = true }: BadgeProps) {
  const op = unlocked ? 1 : 0.35
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" opacity={op}>
      <circle cx="50" cy="50" r="46" fill="#FBEAF0" stroke="#ED93B1" strokeWidth="1.5"/>
      <path d="M50 28 L54 42 L68 42 L57 51 L61 65 L50 56 L39 65 L43 51 L32 42 L46 42 Z" fill="#D4537E"/>
      <path d="M36 68 Q40 61 44 68 Q40 75 36 68Z" fill="#ED93B1"/>
      <path d="M56 68 Q60 61 64 68 Q60 75 56 68Z" fill="#ED93B1"/>
    </svg>
  )
}

function Camel({ size = 64, unlocked = true }: BadgeProps) {
  const op = unlocked ? 1 : 0.35
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" opacity={op}>
      <circle cx="50" cy="50" r="46" fill="#FAEEDA" stroke="#EF9F27" strokeWidth="1.5"/>
      <path d="M20 68 Q30 48 40 56 Q42 42 48 40 Q50 34 56 36 Q62 34 64 42 Q70 44 72 56 Q78 50 82 60" fill="none" stroke="#BA7517" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="34" cy="70" rx="10" ry="5" fill="#EF9F27"/>
      <ellipse cx="66" cy="70" rx="10" ry="5" fill="#EF9F27"/>
      <circle cx="66" cy="36" r="5" fill="#FAC775" stroke="#BA7517" strokeWidth="1"/>
    </svg>
  )
}

// ── 图标映射表 ─────────────────────────────────────────────────────────────────
export const ACHIEVEMENT_ICONS: Record<string, React.FC<BadgeProps>> = {
  explorer_3:      Backpack,
  explorer_10:     Compass,
  explorer_30:     Globe,
  explorer_all:    MapStamp,
  region_chuanyu:  Hotpot,
  region_jiangnan: Bridge,
  region_northwest: Camel,
  foodie_spicy:    Chili,
  social_first:    PaperPlane,
  social_first_post: PaperPlane,
  companion_10:    StarHeart,
}

export function AchievementIcon({
  code,
  size = 64,
  unlocked = true,
}: {
  code: string
  size?: number
  unlocked?: boolean
}) {
  const Icon = ACHIEVEMENT_ICONS[code]
  if (!Icon) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" opacity={unlocked ? 1 : 0.35}>
        <circle cx="50" cy="50" r="46" fill="#F1EFE8" stroke="#B4B2A9" strokeWidth="1.5"/>
        <text x="50" y="56" textAnchor="middle" fontSize="28" fill="#888780">?</text>
      </svg>
    )
  }
  return <Icon size={size} unlocked={unlocked} />
}