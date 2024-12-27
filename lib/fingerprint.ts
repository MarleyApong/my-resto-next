import { headers } from "next/headers"
import { createHash } from "crypto"

export function generateFingerprint(request: Request): string {
  const headersList = headers()

  const components = {
    userAgent: headersList.get("user-agent") || "",
    accept: headersList.get("accept") || "",
    acceptLanguage: headersList.get("accept-language") || "",
    acceptEncoding: headersList.get("accept-encoding") || "",
    ip: (headersList.get("x-forwarded-for") || "::1").split(",")[0],
    platform: headersList.get("sec-ch-ua-platform") || ""
  }

  const fingerprintString = Object.values(components).join("|")
  return createHash("sha256").update(fingerprintString).digest("hex")
}
