import { prisma } from '../src/prisma';

async function seedData() {
  try {
    // Clear existing data
    await prisma.item.deleteMany();

    // Add sample items
    const items = [
      {
        name: 'Gaming Laptop',
        category: 'Electronics',
        price: 1299.99,
      },
      {
        name: 'Wireless Mouse',
        category: 'Electronics',
        price: 29.99,
      },
      {
        name: 'Office Chair',
        category: 'Furniture',
        price: 249.99,
      },
      {
        name: 'Coffee Mug',
        category: 'Kitchen',
        price: 15.99,
      },
      {
        name: 'Mechanical Keyboard',
        category: 'Electronics',
        price: 149.99,
      },
    ];

    for (const item of items) {
      await prisma.item.create({
        data: item,
      });
    }

    console.log('✅ Sample data created successfully!');
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();