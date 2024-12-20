import { NextApiRequest, NextApiResponse } from "next"
import i18next from "i18next"
import { errors } from "@/lib/errors"

export const errorHandler = (err: Error, req: NextApiRequest, res: NextApiResponse) => {
  const debugLevel: number = 1
  const debugMessage: string = "Limit error return by the supervisor. Contact him for more details on the problem!"

  const language = req.headers["accept-language"] || "en"

  let status = 500
  let message = i18next.t("backend:internal_server_error", { lng: language })

  // Vérifiez si l'erreur est connue
  if (err.name in errors) {
    status = errors[err.name].status
    message = err.message || message
  }

  console.error("New error:", err)

  res.status(status).json({
    success: false,
    message,
    name: err.name,
    error: debugLevel === 0 ? "" : err,
    infos: debugLevel === 0 ? debugMessage : ""
  })
}
