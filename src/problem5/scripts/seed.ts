import 'reflect-metadata';
import { AppDataSource, initializeDatabase } from '../src/config/data-source';
import { Book } from '../src/entity/Book';

const sampleBooks = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    publishedYear: 1925,
    description: 'A classic American novel set in the Jazz Age',
    genre: 'Fiction'
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    publishedYear: 1960,
    description: 'A gripping tale of racial injustice and childhood innocence',
    genre: 'Fiction'
  },
  {
    title: '1984',
    author: 'George Orwell',
    publishedYear: 1949,
    description: 'A dystopian social science fiction novel',
    genre: 'Science Fiction'
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    publishedYear: 1813,
    description: 'A romantic novel of manners',
    genre: 'Romance'
  },
  {
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    publishedYear: 1951,
    description: 'A controversial novel about teenage rebellion',
    genre: 'Fiction'
  },
  {
    title: 'Lord of the Flies',
    author: 'William Golding',
    publishedYear: 1954,
    description: 'A novel about British boys stranded on an uninhabited island',
    genre: 'Fiction'
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    publishedYear: 1937,
    description: 'A fantasy novel and children\'s book',
    genre: 'Fantasy'
  },
  {
    title: 'Fahrenheit 451',
    author: 'Ray Bradbury',
    publishedYear: 1953,
    description: 'A dystopian novel about a future where books are banned',
    genre: 'Science Fiction'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Initialize database connection
    await initializeDatabase();
    
    const bookRepository = AppDataSource.getRepository(Book);
    
    // Check if data already exists
    const existingCount = await bookRepository.count();
    if (existingCount > 0) {
      console.log(`📚 Database already contains ${existingCount} books. Skipping seed.`);
      console.log('💡 To re-seed, delete the database file and run this script again.');
      return;
    }
    
    // Create and save sample books
    const books = bookRepository.create(sampleBooks);
    await bookRepository.save(books);
    
    console.log(`✅ Successfully seeded ${books.length} books to the database!`);
    console.log('📖 Sample books added:');
    books.forEach((book, index) => {
      console.log(`   ${index + 1}. "${book.title}" by ${book.author} (${book.publishedYear})`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    console.log('🔚 Database connection closed.');
  }
}

// Run the seed function
seedDatabase();
