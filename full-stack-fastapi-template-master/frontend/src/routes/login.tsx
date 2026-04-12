import { zodResolver } from "@hookform/resolvers/zod"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Body_login_login_access_token as AccessToken } from "@/client"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"

// 修正图片导入路径（所有图片均位于 resources 根目录）
import fisbg from "../resources/fisbg.png"
import logoImg from "../resources/logo.png"
import mumuBg from "../resources/mumu.png"
import cutewormIcon from "../resources/cutewormlogo.png"
import keyIcon from "../resources/keylogo.png"
import loginBtnImg from "../resources/loginbu.png"

const formSchema = z.object({
  username: z.email(),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
}) satisfies z.ZodType<AccessToken>

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/login")({
  component: Login,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({ to: "/" })
    }
  },
  head: () => ({
    meta: [{ title: "蛄蛹者 · 云游中国 | 登录" }],
  }),
})

function Login() {
  const { loginMutation } = useAuth()
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: { username: "", password: "" },
  })

  const onSubmit = (data: FormData) => {
    if (loginMutation.isPending) return
    loginMutation.mutate(data)
  }

  // 内联样式
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      gap: "5px",
      width: "100%",
      maxWidth: "600px",
      margin: "0 auto",
    },
    logoWrapper: {
      textAlign: "center" as const,
      marginBottom: "-110px",
      zIndex: 15,
    },
    logo: {
      width: "420px",
      maxWidth: "85vw",
      height: "auto",
      filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.1))",
    },
    card: {
      width: "100%",
      backgroundImage: `url(${mumuBg})`,
      backgroundSize: "100% 100%",
      borderRadius: "20px",
      padding: "40px 30px 45px",
      marginTop: "-100px",
    },
    inputRow: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "20px",
      marginTop: "30px",
    },
    inputIcon: {
      flexShrink: 0,
      width: "48px",
      textAlign: "center" as const,
    },
    iconImg: {
      width: "48px",
      height: "48px",
      display: "block",
    },
    inputField: {
      flex: 1,
    },
    input: {
      width: "85%",
      padding: "12px 16px",
      fontSize: "1rem",
      border: "2px solid #dacfb4",
      borderRadius: "40px",
      background: "#ffffff",
      outline: "none",
      fontFamily: "'Gaegu', 'Segoe UI', '楷体', cursive",
    },
    inputFocus: {
      borderColor: "#b0cf8c",
      boxShadow: "0 0 0 3px #e2f0d4",
    },
    button: {
      background: `url(${loginBtnImg}) no-repeat center center`,
      backgroundSize: "contain",
      border: "none",
      width: "100%",
      height: "60px",
      cursor: "pointer",
      marginTop: "15px",
      transition: "transform 0.08s linear",
    },
    extraLinks: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "18px",
      fontSize: "1rem",
      color: "#f0e6d2",
    },
    link: {
      color: "#f0e6d2",
      textDecoration: "none",
      borderBottom: "1px dotted #dacfb4",
    },
    errorMsg: {
      color: "#d9534f",
      fontSize: "0.8rem",
      marginTop: "4px",
    },
  }

  const bodyStyle = {
    backgroundImage: `url(${fisbg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    margin: 0,
  }

  return (
    <div style={bodyStyle}>
      <div style={styles.container}>
        <div style={styles.logoWrapper}>
          <img src={logoImg} alt="蛄蛹者·云游中国" style={styles.logo} />
        </div>
        <div style={styles.card}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div style={styles.inputRow}>
              <div style={styles.inputIcon}>
                <img src={cutewormIcon} alt="用户" style={styles.iconImg} />
              </div>
              <div style={styles.inputField}>
                <input
                  type="email"
                  placeholder="输入邮箱"
                  style={styles.input}
                  {...form.register("username")}
                  onFocus={(e) => {
                    e.target.style.borderColor = styles.inputFocus.borderColor
                    e.target.style.boxShadow = styles.inputFocus.boxShadow
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#dacfb4"
                    e.target.style.boxShadow = "none"
                  }}
                />
                {form.formState.errors.username && (
                  <div style={styles.errorMsg}>{form.formState.errors.username.message}</div>
                )}
              </div>
            </div>
            <div style={styles.inputRow}>
              <div style={styles.inputIcon}>
                <img src={keyIcon} alt="密码" style={styles.iconImg} />
              </div>
              <div style={styles.inputField}>
                <input
                  type="password"
                  placeholder="输入密码"
                  style={styles.input}
                  {...form.register("password")}
                  onFocus={(e) => {
                    e.target.style.borderColor = styles.inputFocus.borderColor
                    e.target.style.boxShadow = styles.inputFocus.boxShadow
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#dacfb4"
                    e.target.style.boxShadow = "none"
                  }}
                />
                {form.formState.errors.password && (
                  <div style={styles.errorMsg}>{form.formState.errors.password.message}</div>
                )}
              </div>
            </div>
            <button
              type="submit"
              style={styles.button}
              disabled={loginMutation.isPending}
              onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(4px)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            />
            <div style={styles.extraLinks}>
              <RouterLink to="/recover-password" style={styles.link}>
                忘记密码？
              </RouterLink>
              <RouterLink to="/signup" style={styles.link}>
                注册账号
              </RouterLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}