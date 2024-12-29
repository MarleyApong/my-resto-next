import { ErrorProvider } from "@/contexts/ErrorProvider"
import { I18nProviderClient } from "@/locales/client"
import { PropsWithChildren } from "react"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { AuthProvider } from "@/contexts/AuthContext"

export const Providers = (props: PropsWithChildren<{ local: string }>) => {
  return (
    <ErrorProvider>
      <AuthProvider>
        <I18nProviderClient locale={props.local}>
          <Sonner position="top-right" />
          {props.children}
        </I18nProviderClient>
      </AuthProvider>
    </ErrorProvider>
  )
}
