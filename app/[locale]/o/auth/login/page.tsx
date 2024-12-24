"use client"

import React, { useState, useContext } from "react"
import { Mail, Key, LogIn, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { AuthContext } from "@/contexts/AuthContext"
import { useError } from "@/hooks/useError"
import * as z from "zod"
import Image from "next/image"
import "../auth.css"
import { authService } from "@/services/authService"

const loginSchema = z.object({
  email: z.string().email("Veuillez entrer une adresse email valide."),
  password: z.string().min(1, "Le mot de passe est requis.")
})

const Login: React.FC = () => {
  const { showError } = useError()

  const router = useRouter()
  const authContext = useContext(AuthContext)
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [alert, setAlert] = useState<{ title: string; description: string } | null>(null)

  const validateFields = () => {
    try {
      loginSchema.parse({ email, password })
      setErrors({})
      return true
    } catch (e) {
      if (e instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {}
        e.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0]] = err.message
          }
        })
        setErrors(fieldErrors)
        return false
      }
      return false
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateFields()) {
      return
    }

    setIsLoading(true)
    try {
      await authContext.login(email, password)
      setIsLoading(false)
      router.push("/o")
    } catch (err) {
      showError(err)
      setIsLoading(false)
    }
  }

  return (
    <div className="login flex items-center justify-center h-screen bg-cover bg-center relative px-3">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-30"></div>

      {/* Form Section */}
      <div className="relative z-10 w-full max-w-md bg-white p-4 rounded-sm shadow-md">
        <form onSubmit={handleLogin} className="flex flex-col gap-6 text-center">
          <div className="flex flex-col items-center ">
            <Image src="/assets/img/logo/logo.png" alt="Logo" width={150} height={150} className="mb-2" />
            <span className="text-lg font-bold uppercase text-primary">Gastro Link</span>
          </div>
          <h2 className="text-3xl font-semibold text-gray-500">CONNEXION</h2>

          <div className="flex flex-col items-start">
            <div className="flex items-center w-full border-b rounded-l-sm border-gray-300">
              <div className="w-10 h-10 bg-primary grid place-content-center rounded-tl-sm rounded-tr-sm rounded-bl-sm rounded-br-none">
                <Mail className="text-white" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="flex-1 px-2 outline-none bg-transparent h-full"
                autoComplete="off"
              />
            </div>
            {errors.email && <span className="auth-error text-red-600 text-sm">{errors.email}</span>}
          </div>

          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center w-full border-b rounded-l-sm border-gray-300">
              <div className="w-10 h-10 bg-primary grid place-content-center rounded-tl-sm rounded-tr-sm rounded-bl-sm rounded-br-none">
                <Key className="text-white" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="flex-1 px-2 outline-none bg-transparent h-full"
                autoComplete="off"
              />
            </div>
            {errors.password && <span className="auth-error text-red-600 text-sm">{errors.password}</span>}
          </div>

          <div className="mt-4">
            {isLoading ? (
              <button disabled className="flex items-center justify-center w-full p-3 bg-primary text-white rounded-sm">
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Vérification...
              </button>
            ) : (
              <button type="submit" className="flex items-center justify-center w-full p-3 bg-primary text-white rounded-sm hover:bg-primary-dark transition duration-300">
                <LogIn className="mr-2" /> Se connecter
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
