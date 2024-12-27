import { ErrorProvider } from "@/contexts/ErrorProvider"
import { I18nProviderClient } from "@/locales/client"
import { PropsWithChildren } from "react"
import { Toaster } from "react-hot-toast"

export const Providers = (props: PropsWithChildren<{ local: string }>) => {
  return (
    <ErrorProvider>
      <I18nProviderClient locale={props.local}>
        <Toaster position="top-center" reverseOrder={true} />
        {props.children}
      </I18nProviderClient>
    </ErrorProvider>
  )
}
