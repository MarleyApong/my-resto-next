"use client"

import { AuthProvider } from "@/contexts/AuthContext"
import { I18nProviderClient } from "@/locales/client"
import { PropsWithChildren } from "react"

export const Providers = (props: PropsWithChildren<{ local: string }>) => {
  return (
    <I18nProviderClient locale={props.local}>
      <AuthProvider>{props.children}</AuthProvider>
    </I18nProviderClient>
  )
}
