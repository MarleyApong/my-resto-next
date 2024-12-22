import { NextApiRequest, NextApiResponse } from "next"
import { errorHandler } from "./errorHandler"

// wrapper
export function withErrorHandler(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Normal
      await handler(req, res)
    } catch (err: any) {
      // Error
      await errorHandler(err, req, res)
    }
  }
}
