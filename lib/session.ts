import prisma from "@/lib/db"

export const SESSION_CONFIGS = {
  SHORT_TIMEOUT: 30 * 60 * 1000, // 30 minutes inactivity timeout
  MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours maximum lifetime
  CLEANUP_INTERVAL: 15 * 60 * 1000 // Run cleanup every 15 minutes
}

export async function cleanupExpiredSessions() {
  try {
    const result = await prisma.session.updateMany({
      where: {
        OR: [
          // Sessions that have reached their absolute expiry time
          { expiresAt: { lt: new Date() } },
          // Sessions that have been inactive for too long
          {
            lastActivity: {
              lt: new Date(Date.now() - SESSION_CONFIGS.SHORT_TIMEOUT)
            }
          }
        ]
      },
      data: {
        valid: false
      }
    })

    console.log(`Cleaned up ${result.count} expired sessions`)
  } catch (error) {
    console.error("Failed to cleanup sessions:", error)
  }
}
