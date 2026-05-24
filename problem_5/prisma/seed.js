const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const resources = [
    { name: 'Alpha', description: 'Seeded resource Alpha', status: 'active' },
    { name: 'Beta', description: 'Seeded resource Beta', status: 'inactive' },
    { name: 'Gamma', description: 'Seeded resource Gamma', status: 'active' },
    { name: 'Delta', description: 'Seeded resource Delta', status: 'active' },
    { name: 'Epsilon', description: 'Seeded resource Epsilon', status: 'inactive' },
    { name: 'Zeta', description: 'Seeded resource Zeta', status: 'active' },
    { name: 'Eta', description: 'Seeded resource Eta', status: 'inactive' },
    { name: 'Theta', description: 'Seeded resource Theta', status: 'active' },
    { name: 'Iota', description: 'Seeded resource Iota', status: 'active' },
    { name: 'Kappa', description: 'Seeded resource Kappa', status: 'inactive' },
    { name: 'Lambda', description: 'Seeded resource Lambda', status: 'active' },
    { name: 'Mu', description: 'Seeded resource Mu', status: 'inactive' },
    { name: 'Nu', description: 'Seeded resource Nu', status: 'active' },
    { name: 'Xi', description: 'Seeded resource Xi', status: 'active' },
    { name: 'Omicron', description: 'Seeded resource Omicron', status: 'inactive' },
    { name: 'Pi', description: 'Seeded resource Pi', status: 'active' },
    { name: 'Rho', description: 'Seeded resource Rho', status: 'inactive' },
    { name: 'Sigma', description: 'Seeded resource Sigma', status: 'active' },
    { name: 'Tau', description: 'Seeded resource Tau', status: 'active' },
    { name: 'Upsilon', description: 'Seeded resource Upsilon', status: 'inactive' },
    { name: 'Phi', description: 'Seeded resource Phi', status: 'active' },
    { name: 'Chi', description: 'Seeded resource Chi', status: 'inactive' },
    { name: 'Psi', description: 'Seeded resource Psi', status: 'active' },
    { name: 'Omega', description: 'Seeded resource Omega', status: 'active' },
  ];

  const result = await prisma.resource.createMany({
    data: resources,
    skipDuplicates: true
  });

  console.log(`Inserted ${result.count} resources (duplicates skipped).`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
