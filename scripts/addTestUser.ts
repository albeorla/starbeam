import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

import dotenv from 'dotenv'

dotenv.config()

// print out the environment variables
console.log(process.env.DATABASE_URL)

const prisma = new PrismaClient()

async function main() {
  const password = await hash('testpassword', 12)
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password,
    },
  })
  console.log({ user })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })