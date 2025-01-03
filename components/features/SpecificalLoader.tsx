import { Loader2 } from "lucide-react"

export const SpecificalLoader = () => {
  return <Loader2 className="animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
}

export const Loader = () => {
  return <Loader2 className="animate-spin text-white" />
}