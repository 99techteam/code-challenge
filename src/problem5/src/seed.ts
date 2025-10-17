// src/seed.ts
import Resource, { IResource } from './models/Resource';

const initialData: Partial<IResource>[] = [
  { name: 'Resource 1', description: 'First resource', value: 100 },
  { name: 'Resource 2', description: 'Second resource', value: 200 },
  { name: 'Resource 3', description: 'Third resource', value: 300 },
  { name: 'Resource 4', description: 'Fourth resource', value: 400 },
  { name: 'Resource 5', description: 'Fifth resource', value: 500 },
  { name: 'Resource 6', description: 'Sixth resource', value: 600 },
  { name: 'Resource 7', description: 'Seventh resource', value: 700 },
  { name: 'Resource 8', description: 'Eighth resource', value: 800 },
  { name: 'Resource 9', description: 'Ninth resource', value: 900 },
  { name: 'Resource 10', description: 'Tenth resource', value: 1000 }
];

export const seedData = async (): Promise<void> => {
  try {
    const count = await Resource.countDocuments();
    if (count === 0) {
      await Resource.insertMany(initialData);
      console.log('Seed data inserted successfully');
    }
  } catch (err) {
    console.error('Error seeding data:', err);
  }
};