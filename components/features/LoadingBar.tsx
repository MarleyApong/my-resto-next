"use client"

import { useAuth } from "@/hooks/useAuth"
import { useEffect, useRef } from "react"
import LoadingBar from "react-top-loading-bar"

export const TopLoadingBar = () => {
  const { isLoading } = useAuth()
  const ref = useRef<any>(null)

  useEffect(() => {
    if (isLoading) {
      ref.current?.continuousStart()
    } else {
      ref.current?.complete()
    }
  }, [isLoading])

  return <LoadingBar color="var(--primary)" ref={ref} />
}
