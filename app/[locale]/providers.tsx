import { AuthProvider } from "@/contexts/AuthContext"
import { ErrorProvider } from "@/contexts/ErrorProvider"
import { I18nProviderClient } from "@/locales/client"
import { PropsWithChildren } from "react"

export const Providers = (props: PropsWithChildren<{ local: string }>) => {
  return (
    <ErrorProvider>
      <I18nProviderClient locale={props.local}>
        <AuthProvider>
          {props.children}
        </AuthProvider>
      </I18nProviderClient>
    </ErrorProvider>
  )
}