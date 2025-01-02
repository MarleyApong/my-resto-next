import React from "react"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { ArrowBigLeftDash } from "lucide-react"

interface Level2Props {
  path?: string
  children?: React.ReactNode
}

export const Level2 = ({ path, children }: Level2Props) => {
  const router = useRouter()

  const handleBack = () => {
    if (path) {
      router.push(path)
    } else {
      router.back()
    }
  }

  return (
    <div className="mb-2 flex justify-between">
      <Button variant="outline" onClick={handleBack}>
        <ArrowBigLeftDash/>
        Back
      </Button>
      {children}
    </div>
  )
}
