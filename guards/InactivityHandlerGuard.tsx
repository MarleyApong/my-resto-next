import { useRef, useState, useEffect } from "react"
import { useIdleTimer, IIdleTimer } from "react-idle-timer"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"

const MySwal = withReactContent(Swal)

export const InactivityHandler = () => {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  const [isUserActive, setIsUserActive] = useState<boolean>(false)
  const idleTimerRef = useRef<IIdleTimer | null>(null)
  const timeout = 2 * 60 * 1000 // 2 minutes inactivity timeout
  const alertTimeout = 20 * 1000 // 20-second alert timeout

  // Synchroniser l'état `isUserActive` avec l'authentification
  useEffect(() => {
    setIsUserActive(isAuthenticated)
  }, [isAuthenticated])

  const handleOnIdle = () => {
    if (isUserActive) {
      MySwal.fire({
        title: "Êtes-vous toujours là ?",
        text: "Vous serez déconnecté automatiquement si aucune action n'est prise.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Oui, je suis là",
        cancelButtonText: "Non, déconnectez-moi",
        timer: alertTimeout,
        timerProgressBar: true
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer || result.isDismissed) {
          handleLogout()
        } else if (result.isConfirmed) {
          resetIdleTimer()
        }
      })
    }
  }

  const resetIdleTimer = () => {
    if (idleTimerRef.current) {
      idleTimerRef.current.reset()
    }
  }

  const handleLogout = async () => {
    sessionStorage.clear()
    router.push("/o/auth/login")
    setIsUserActive(false)
  }

  useIdleTimer({
    timeout,
    onIdle: handleOnIdle,
    debounce: 500,
    ref: idleTimerRef,
    events: ["mousemove", "keydown", "mousedown", "touchstart"]
  })

  if (!isUserActive) {
    return null
  }

  return null
}