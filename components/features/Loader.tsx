import React from "react"
import Lottie from "lottie-react"
import loaderAnimation from "@/public/animations/loader.json"
export const Loader = () => {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Lottie animationData={loaderAnimation} loop={true} style={{ width: 200, height: 200 }} />
    </div>
  )
}
