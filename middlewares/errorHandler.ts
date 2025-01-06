import { errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"
import { NextResponse } from "next/server"

export async function errorHandler(err: Error): Promise<NextResponse> {
  const t = await getI18n()
  const debugLevel: number = 1
  const debugMessage: string = "Limit error return by the supervisor. Contact him for more details on the problem!"

  let status = 500
  let message = t("api.errors.internalServerError")

  const errorName = err.name as keyof typeof errors

  console.log("Finale point", err);
  

  if (errorName in errors) {
    status = errors[errorName].status
    message = err.message || message
  }

  console.error("New error:", err)

  return NextResponse.json(
    {
      success: false,
      message,
      name: err.name,
      error: debugLevel === 0 ? "" : err,
      infos: debugLevel === 0 ? debugMessage : ""
    },
    { status }
  )
}
