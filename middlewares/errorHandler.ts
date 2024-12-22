import { NextApiRequest, NextApiResponse } from "next"
import { errors } from "@/lib/errors"
import { getI18n } from "@/locales/server"

export const errorHandler = async (err: Error, req: NextApiRequest, res: NextApiResponse) => {
  const t = await getI18n()
  const debugLevel: number = 1
  const debugMessage: string = "Limit error return by the supervisor. Contact him for more details on the problem!"

  let status = 500
  let message = t("api.errors.internalServerError")

  // Déclarez le type de `err.name` comme une clé d'`errors`
  const errorName = err.name as keyof typeof errors;

  // Vérifiez si l'erreur est connue
  if (errorName in errors) {
    status = errors[errorName].status
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
