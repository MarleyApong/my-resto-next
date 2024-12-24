import { useRef, useState, useEffect } from "react"
import { useIdleTimer, IdleTimerProps } from "react-idle-timer"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import { useNavigate, useLocation } from "react-router-dom"

// Initialize SweetAlert with React
const MySwal = withReactContent(Swal)

const InactivityHandler = () => {
  const [isUserActive, setIsUserActive] = useState<boolean>(false)
  const [isPromptVisible, setIsPromptVisible] = useState<boolean>(false)
  const idleTimerRef = useRef<IdleTimerProps | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const timeout = 100 * 60 * 1000 // 10-minute inactivity timeout
  const alertTimeout = 20 * 1000 // 20-second alert timeout

  useEffect(() => {
    // Check if the user is on an authenticated route
    if (location.pathname.startsWith("/auth") || location.pathname.startsWith("/page")) {
      setIsUserActive(false)
    } else {
      setIsUserActive(true)
    }
  }, [location.pathname])

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
        timerProgressBar: true,
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

  const handleLogout = () => {
    sessionStorage.clear() // Clear session data
    navigate("/auth/login") // Redirect to login page
    setIsUserActive(false) // Update user activity status
  }

  useIdleTimer({
    timeout,
    onIdle: handleOnIdle, // Call handleOnIdle when user is idle
    debounce: 500,
    ref: idleTimerRef,
    events: ["mousemove", "keydown", "mousedown", "touchstart"], // Events that reset idle timeout
  })

  // Render nothing if user is not active
  if (!isUserActive) {
    return null
  }

  return null // Render null even if user is active
}

export default InactivityHandler
