import { useRef, useState, useEffect } from "react"
import { useIdleTimer, IIdleTimer } from "react-idle-timer"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import { usePathname, useRouter } from "next/navigation"
import { authService } from "@/services/authService"
import { useAuth } from "@/hooks/useAuth"
import { useTokenRefresh } from "@/hooks/useTokenRefresh"

// Initialize SweetAlert with React
const MySwal = withReactContent(Swal)

const InactivityHandler = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  const [isUserActive, setIsUserActive] = useState<boolean>(false)
  const [isPromptVisible, setIsPromptVisible] = useState<boolean>(false)
  const idleTimerRef = useRef<IIdleTimer | null>(null)
  const timeout = 10 * 60 * 1000 // 10-minute inactivity timeout
  const alertTimeout = 20 * 1000 // 20-second alert timeout

  useEffect(() => {
    if (!isAuthenticated) {
      setIsUserActive(false)
    } else {
      setIsUserActive(true)
    }
  }, [pathname])

  useEffect(() => {
    if (isUserActive) {
      useTokenRefresh()
    }
  }, [isUserActive])

  const handleOnIdle = () => {
    if (isUserActive && !isPromptVisible) {
      setIsPromptVisible(true)
      MySwal.fire({
        title: "Are you still there?",
        text: "You will be logged out automatically if no action is taken.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, I'm here",
        cancelButtonText: "No, log me out",
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        timer: alertTimeout,
        timerProgressBar: true
      }).then((result) => {
        setIsPromptVisible(false)
        if (result.dismiss === Swal.DismissReason.timer || result.isDismissed) {
          handleLogout() // Log out user if no response
        } else if (result.isConfirmed) {
          resetIdleTimer() // Reset idle timeout if user is still there
        }
      })
    }
  }

  const resetIdleTimer = () => {
    if (idleTimerRef.current) {
      idleTimerRef.current.reset() // Reset idle timeout
    }
  }

  const handleLogout = async () => {
    sessionStorage.clear()
    router.push("/auth/login")
    await authService.logout()
    setIsUserActive(false)
  }

  useIdleTimer({
    timeout,
    onIdle: handleOnIdle, // Call handleOnIdle when user is idle
    debounce: 500,
    ref: idleTimerRef,
    events: ["mousemove", "keydown", "mousedown", "touchstart"] // Events that reset idle timeout
  })

  if (!isUserActive) {
    return null
  }

  return null
}

export default InactivityHandler
