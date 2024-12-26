export type AuthError = {
  type: "AUTH_ERROR" | "NETWORK_ERROR" | "API_ERROR" | "UNKNOWN_ERROR"
  status?: number
  message: string
  requiresRedirect?: boolean
}
