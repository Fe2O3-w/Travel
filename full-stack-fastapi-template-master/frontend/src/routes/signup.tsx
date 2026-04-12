import { zodResolver } from "@hookform/resolvers/zod"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"

// 修正图片导入路径
import fisbg from "../resources/fisbg.png"
import logoImg from "../resources/logo.png"
import mumuBg from "../resources/mumu.png"
import cutewormIcon from "../resources/cutewormlogo.png"
import mailIcon from "../resources/maillogo.png"
import keyIcon from "../resources/keylogo.png"
import signupBtnImg from "../resources/signinbu.png"

const formSchema = z
  .object({
    email: z.string().email(),
    full_name: z.string().min(1, { message: "Full Name is required" }),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" }),
    confirm_password: z
      .string()
      .min(1, { message: "Password confirmation is required" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "The passwords don't match",
    path: ["confirm_password"],
  })

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/signup")({
  component: SignUp,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({ to: "/" })
    }
  },
  head: () => ({
    meta: [{ title: "蛄蛹者 · 云游中国 | 注册" }],
  }),
})

function SignUp() {
  const { signUpMutation } = useAuth()
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
      confirm_password: "",
    },
  })

  const onSubmit = (data: FormData) => {
    if (signUpMutation.isPending) return
    const { confirm_password: _confirm_password, ...submitData } = data
    signUpMutation.mutate(submitData)
  }

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
    },
    inputRow: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "20px",
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
      background: `url(${signupBtnImg}) no-repeat center center`,
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
      justifyContent: "center",
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
                <img src={cutewormIcon} alt="昵称" style={styles.iconImg} />
              </div>
              <div style={styles.inputField}>
                <input
                  type="text"
                  placeholder="输入昵称"
                  style={styles.input}
                  {...form.register("full_name")}
                  onFocus={(e) => {
                    e.target.style.borderColor = styles.inputFocus.borderColor
                    e.target.style.boxShadow = styles.inputFocus.boxShadow
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#dacfb4"
                    e.target.style.boxShadow = "none"
                  }}
                />
                {form.formState.errors.full_name && (
                  <div style={styles.errorMsg}>{form.formState.errors.full_name.message}</div>
                )}
              </div>
            </div>
            <div style={styles.inputRow}>
              <div style={styles.inputIcon}>
                <img src={mailIcon} alt="邮箱" style={styles.iconImg} />
              </div>
              <div style={styles.inputField}>
                <input
                  type="email"
                  placeholder="输入邮箱"
                  style={styles.input}
                  {...form.register("email")}
                  onFocus={(e) => {
                    e.target.style.borderColor = styles.inputFocus.borderColor
                    e.target.style.boxShadow = styles.inputFocus.boxShadow
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#dacfb4"
                    e.target.style.boxShadow = "none"
                  }}
                />
                {form.formState.errors.email && (
                  <div style={styles.errorMsg}>{form.formState.errors.email.message}</div>
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
            <div style={styles.inputRow}>
              <div style={styles.inputIcon}>
                <img src={keyIcon} alt="确认密码" style={styles.iconImg} />
              </div>
              <div style={styles.inputField}>
                <input
                  type="password"
                  placeholder="确认密码"
                  style={styles.input}
                  {...form.register("confirm_password")}
                  onFocus={(e) => {
                    e.target.style.borderColor = styles.inputFocus.borderColor
                    e.target.style.boxShadow = styles.inputFocus.boxShadow
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#dacfb4"
                    e.target.style.boxShadow = "none"
                  }}
                />
                {form.formState.errors.confirm_password && (
                  <div style={styles.errorMsg}>{form.formState.errors.confirm_password.message}</div>
                )}
              </div>
            </div>
            <button
              type="submit"
              style={styles.button}
              disabled={signUpMutation.isPending}
              onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(4px)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            />
            <div style={styles.extraLinks}>
              <RouterLink to="/login" style={styles.link}>
                已有账号？去登录
              </RouterLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}