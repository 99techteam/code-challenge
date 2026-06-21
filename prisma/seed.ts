import { prisma } from "@/problem5/src/lib/prisma.js";

async function main() {
  console.log('Cleaning database...');
  await prisma.resource.deleteMany({});
    
  console.log('Seeding data...');

  for (let i = 1; i <= 20; i++) {
    await prisma.resource.upsert({
      where: { id: i }, // Assumes your ID is a standard auto-incrementing integer
      update: {},
      create: {
        name: `Resource Item ${i}`,
        description: `This is the description for resource number ${i}. It is perfect for testing filters and pagination!`,
      },
    });
  }

  console.log('Successfully seeded 20 resources.');
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });