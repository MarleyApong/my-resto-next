"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
// import Swal from "sweetalert2"
import { Mail, Key, LogIn, Loader2 } from "lucide-react"

const Login: React.FC = () => {
  const router = useRouter()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const showAlert = (title: string, text: string) => {
    // Swal.fire({
    //   icon: "error",
    //   title: title,
    //   text: text,
    //   confirmButtonText: "Ok",
    // })
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (email === "" || password === "") {
      showAlert("Erreur", "Veuillez remplir tous les champs !")
    } else if (!validateEmail(email)) {
      showAlert("Erreur", "Veuillez entrer une adresse email valide !")
    } else {
      setIsLoading(true)
      try {
        // Simule l'appel d'API et vérifie les informations d'identification
        setTimeout(() => {
          setIsLoading(false)
          router.push("/dashboard") // Redirige vers le tableau de bord
        }, 1500)
      } catch (err) {
        setIsLoading(false)
        showAlert("Erreur", "Vérifiez votre connexion ou réessayez plus tard !")
      }
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="flex h-[80%] w-[80%] rounded-lg shadow-lg overflow-hidden bg-white">
        <div
          className="relative hidden md:flex flex-col items-center justify-center w-3/5 text-white p-6 text-center bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/img/auth/login.jpg')" }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black opacity-60"></div>

          {/* Contenu */}
          <h1 className="relative z-10 text-4xl font-semibold">Bienvenue sur Gastro Link</h1>
          <p className="relative z-10 mt-2">Connectez-vous pour continuer</p>
          <span className="z-10 absolute bottom-4 text-sm">Copyright &#xa9; Gastro Link 2024</span>
        </div>

        <div className="flex flex-col justify-center w-full md:w-2/5 p-8">
          <form onSubmit={handleLogin} className="flex flex-col gap-6 text-center">
            <div className="flex flex-col items-center mb-4">
              <Image src="/assets/img/logo/logo.png" alt="Logo" width={100} height={100} className="mb-2" />
              <span className="text-lg font-bold uppercase text-primary">Gastro Link</span>
            </div>
            <h2 className="text-3xl font-semibold text-primary">CONNEXION</h2>

            <div className="flex items-center border-b rounded-l-lg border-gray-300">
              <div className="w-10 h-10 bg-primary grid place-content-center rounded-lg">
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

            <div className="flex items-center border-b rounded-l-lg border-gray-300">
              <div className="w-10 h-10 bg-primary grid place-content-center rounded-lg">
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

            <div className="mt-4">
              {isLoading ? (
                <button disabled className="flex items-center justify-center w-full p-3 bg-primary text-white rounded-lg">
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Vérification...
                </button>
              ) : (
                <button type="submit" className="flex items-center justify-center w-full p-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition duration-300">
                  <LogIn className="mr-2" /> Se connecter
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
