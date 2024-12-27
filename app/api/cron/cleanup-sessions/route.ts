import { NextResponse } from "next/server"
import { cleanupExpiredSessions } from "@/lib/session"

export async function GET() {
  await cleanupExpiredSessions()
  return NextResponse.json({ success: true })
}

