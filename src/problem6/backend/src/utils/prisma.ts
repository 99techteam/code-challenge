import { PrismaClient } from "@prisma/client"

// Global Prisma client instance
let prisma: PrismaClient

declare global {
  var __prisma: PrismaClient | undefined
}

// Create Prisma client singleton
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({ log: ["error", "warn"] })
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient()
  }
  prisma = global.__prisma
}

// Handle graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect()
})

process.on("SIGINT", async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on("SIGTERM", async () => {
  await prisma.$disconnect()
  process.exit(0)
})

export default prisma
