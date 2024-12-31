import { NextResponse } from "next/server"
import logger from "@/lib/logger"

type RouteHandler = (request: Request, context: any) => Promise<NextResponse> | NextResponse

export function withLogging(handler: RouteHandler) {
  return async (request: Request, context: any) => {
    const startTime = Date.now()
    const ip = request.headers.get("x-forwarded-for") || "::1"

    logger.info(`Incoming request: ${request.method} ${request.url} - IP: ${ip}`)

    try {
      const response = await handler(request, context)
      const duration = Date.now() - startTime

      if (response.status >= 200 && response.status < 300) {
        logger.info(`Successful response: ${response.status} - ${request.method} ${request.url} (${duration}ms) - IP: ${ip}`)
      } else {
        logger.warn(`Client error response: ${response.status} - ${request.method} ${request.url} (${duration}ms) - IP: ${ip}`)
      }

      return response
    } catch (err: any) {
      const duration = Date.now() - startTime
      const errorDetails = {
        message: err.message,
        stack: err.stack,
        url: request.url,
        method: request.method,
        ip
      }

      logger.error(`Server error occurred: ${errorDetails.message} - ${errorDetails.method} ${errorDetails.url} (${duration}ms) - IP: ${errorDetails.ip}`, {
        stack: errorDetails.stack,
        requestBody: await request.json().catch(() => null)
      })

      throw err
    }
  }
}
