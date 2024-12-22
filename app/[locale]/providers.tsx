"use client"

import { I18nProviderClient } from "@/locales/client"
import { PropsWithChildren } from "react"

export const Providers = (props: PropsWithChildren<{ local: string }>) => {
  return <I18nProviderClient locale={props.local}>{props.children}</I18nProviderClient>
}
