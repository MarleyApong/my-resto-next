import { NextResponse } from "next/server"
import { errorHandler } from "./errorHandler"

type RouteHandler = (request: Request, context: any) => Promise<NextResponse> | NextResponse

export function withErrorHandler(handler: RouteHandler) {
  return async (request: Request, context: any) => {
    try {
      return await handler(request, context)
    } catch (err: any) {
      return await errorHandler(err)
    }
  }
}
