import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import { seedProducts } from "../src/data/seedProducts.js";
import { seedUsers } from "../src/data/seedUsers.js";

const prisma = new PrismaClient();

async function seedProductTable() {
  for (const product of seedProducts) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product
    });
  }
}

async function seedUserTable() {
  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        phone: user.phone,
        displayName: user.displayName,
        passwordHash: user.passwordHash,
        role: user.role as UserRole
      },
      create: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        displayName: user.displayName,
        passwordHash: user.passwordHash,
        role: user.role as UserRole
      }
    });
  }
}

async function main() {
  await seedProductTable();
  await seedUserTable();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
