// lib/prisma.ts - Debug versiyasi
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Debug uchun log qo'shdim
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database connection'ni test qilish
prisma.$connect()
  .then(() => console.log('✅ Database connected successfully'))
  .catch((error) => console.error('❌ Database connection failed:', error))