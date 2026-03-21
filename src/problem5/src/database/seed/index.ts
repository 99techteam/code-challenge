import 'reflect-metadata';
import { AppDataSource } from '../../config/database';
import { Resource } from '../../modules/resource/resource.model';

async function seed() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Resource);

  const seeds = [
    { name: 'Laptop', description: 'High performance laptop', price: 999.99 },
    { name: 'Keyboard', description: 'Mechanical keyboard', price: 149.99 },
    { name: 'Monitor', description: '4K display', price: 499.99 },
  ];

  for (const data of seeds) {
    const resource = repo.create(data);
    await repo.save(resource);
  }

  console.log('Seed completed.');
  await AppDataSource.destroy();
}

seed().catch(console.error);
