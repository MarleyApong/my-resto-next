import { NextResponse } from "next/server"
import { errorHandler } from "./errorHandler"

type RouteHandler = (request: Request) => Promise<NextResponse> | NextResponse

export function withErrorHandler(handler: RouteHandler) {
  return async (request: Request) => {
    try {
      return await handler(request)
    } catch (err: any) {
      return await errorHandler(err)
    }
  }
}
