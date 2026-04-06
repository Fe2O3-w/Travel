/**
 * NodeBB SSO Store v4
 * 主站登录后自动用密码登录 NodeBB，获取真实 session
 */
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface NodeBBState {
  nbbUid:      number | null
  nbbUsername: string | null
  isLinked:    boolean

  linkAccount:  () => Promise<boolean>
  clearAccount: () => void
}

export const useNodeBBStore = create<NodeBBState>()(
  persist(
    (set) => ({
      nbbUid:      null,
      nbbUsername: null,
      isLinked:    false,

      linkAccount: async () => {
        try {
          // 1. 调用后端 SSO，获取 NodeBB 用户信息和密码
          const res = await fetch("/api/v1/nodebb/sso", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          })
          if (!res.ok) return false
          const data = await res.json()
          if (!data.success) return false

          // 2. 先获取 NodeBB 的 CSRF token
          const configRes = await fetch("/nodebb/api/config", {
            credentials: "include",
          })
          const config = await configRes.json()
          const csrfToken = config.csrf_token

          // 3. 用账号密码登录 NodeBB，种下 session cookie
          const loginRes = await fetch("/nodebb/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-csrf-token": csrfToken,
            },
            credentials: "include",
            body: JSON.stringify({
              username: data.nodebb_username,
              password: data.user_password,
            }),
          })

          if (loginRes.ok) {
            set({
              nbbUid:      data.nodebb_uid,
              nbbUsername: data.nodebb_username,
              isLinked:    true,
            })
            return true
          }

          // 登录失败也保存基本信息
          set({
            nbbUid:      data.nodebb_uid,
            nbbUsername: data.nodebb_username,
            isLinked:    false,
          })
          return false
        } catch {
          return false
        }
      },

      clearAccount: () => set({
        nbbUid: null, nbbUsername: null, isLinked: false,
      }),
    }),
    {
      name: "nodebb_account",
      partialize: (s) => ({
        nbbUid: s.nbbUid, nbbUsername: s.nbbUsername, isLinked: s.isLinked,
      }),
    }
  )
)