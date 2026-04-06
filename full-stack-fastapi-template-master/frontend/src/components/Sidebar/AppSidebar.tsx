import { Briefcase, Home, Map, Trophy, Users, ExternalLink } from "lucide-react"

import { SidebarAppearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import { type Item, Main } from "./Main"
import { User } from "./User"

const baseItems: Item[] = [
  { icon: Home,      title: "Dashboard", path: "/" },
  { icon: Briefcase, title: "Items",     path: "/items" },
  { icon: Map,       title: "云游中国",  path: "/map" },
  { icon: Trophy,    title: "城市推荐",  path: "/cities" },
  { icon: Trophy,    title: "成就图鉴",  path: "/achievements" },

]

export function AppSidebar() {
  const { user: currentUser } = useAuth()

  const items = currentUser?.is_superuser
    ? [...baseItems, { icon: Users, title: "Admin", path: "/admin" }]
    : baseItems

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
        <Logo variant="responsive" />
      </SidebarHeader>

      <SidebarContent>
        <Main items={items} />

        {/* 旅行社区外链 */}
        <div className="px-3 mt-2">
          <a
            href="http://localhost:4567"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors group"
          >
            <span style={{ fontSize: 16 }}>💬</span>
            <span className="group-data-[collapsible=icon]:hidden">旅行社区</span>
            <ExternalLink
              size={12}
              className="ml-auto opacity-40 group-data-[collapsible=icon]:hidden"
            />
          </a>
        </div>
      </SidebarContent>

      <SidebarFooter>
        <SidebarAppearance />
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar