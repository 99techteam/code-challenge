import { PrismaClient, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.task.deleteMany({});

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the API',
        status: TaskStatus.TODO,
      },
      {
        title: 'Review pull requests',
        description: 'Review and merge pending pull requests',
        status: TaskStatus.IN_PROGRESS,
      },
      {
        title: 'Setup CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing',
        status: TaskStatus.TODO,
      },
      {
        title: 'Fix authentication bug',
        description: null,
        status: TaskStatus.DONE,
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
