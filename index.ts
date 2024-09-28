import dotenv from 'dotenv';
import prisma from './lib/prisma';

// Load environment variables from .env file
dotenv.config();

async function main() {
  try {
    // Your application logic here
    console.log("Prisma connected to the database");

    // Example query
    const linkCount = await prisma.link.count();
    console.log(`Number of links in the database: ${linkCount}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();