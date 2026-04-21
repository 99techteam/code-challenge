import { Book } from "../modules/books/book.schema";

const data = [
  {
    _id: "507f1f77bcf86cd799439001",
    title: "Clean Code",
    author: "Robert C. Martin",
    publisher: "Prentice Hall",
    publishedDate: "2008-08-01",
    country: "US",
  },
  {
    _id: "507f1f77bcf86cd799439002",
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    publisher: "Addison-Wesley",
    publishedDate: "1999-10-20",
    country: "US",
  },
  {
    _id: "507f1f77bcf86cd799439003",
    title: "Design Patterns",
    author: "Erich Gamma",
    publisher: "Addison-Wesley",
    publishedDate: "1994-11-10",
    country: "US",
  },
  {
    _id: "507f1f77bcf86cd799439004",
    title: "The Mythical Man-Month",
    author: "Frederick P. Brooks Jr.",
    publisher: "Addison-Wesley",
    publishedDate: "1975-01-01",
    country: "US",
  },
  {
    _id: "507f1f77bcf86cd799439005",
    title: "Code Complete",
    author: "Steve McConnell",
    publisher: "Microsoft Press",
    publishedDate: "2004-06-09",
    country: "US",
  },
  {
    _id: "507f1f77bcf86cd799439006",
    title: "Refactoring",
    author: "Martin Fowler",
    publisher: "Addison-Wesley",
    publishedDate: "1999-07-08",
    country: "US",
  },
  {
    _id: "507f1f77bcf86cd799439007",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    publisher: "MIT Press",
    publishedDate: "1990-07-12",
    country: "US",
  },
  {
    _id: "507f1f77bcf86cd799439008",
    title: "The Clean Coder",
    author: "Robert C. Martin",
    publisher: "Prentice Hall",
    publishedDate: "2011-05-13",
    country: "US",
  },
  {
    _id: "507f1f77bcf86cd799439009",
    title: "Working Effectively with Legacy Code",
    author: "Michael Feathers",
    publisher: "Prentice Hall",
    publishedDate: "2004-10-02",
    country: "US",
  },
  {
    _id: "507f1f77bcf86cd799439010",
    title: "Domain-Driven Design",
    author: "Eric Evans",
    publisher: "Addison-Wesley",
    publishedDate: "2003-08-30",
    country: "US",
  },
  {
    _id: "507f1f77bcf86cd799439011",
    title: "Structure and Interpretation of Computer Programs",
    author: "Harold Abelson",
    publisher: "MIT Press",
    publishedDate: "1996-09-01",
    country: "US",
  },
  {
    _id: "507f1f77bcf86cd799439012",
    title: "The Art of Computer Programming",
    author: "Donald E. Knuth",
    publisher: "Addison-Wesley",
    publishedDate: "1968-01-01",
    country: "US",
  },
  {
    _id: "507f1f77bcf86cd799439013",
    title: "Continuous Delivery",
    author: "Jez Humble",
    publisher: "Addison-Wesley",
    publishedDate: "2010-07-27",
    country: "UK",
  },
  {
    _id: "507f1f77bcf86cd799439014",
    title: "The Phoenix Project",
    author: "Gene Kim",
    publisher: "IT Revolution Press",
    publishedDate: "2013-01-10",
    country: "US",
  },
  {
    _id: "507f1f77bcf86cd799439015",
    title: "Cracking the Coding Interview",
    author: "Gayle Laakmann McDowell",
    publisher: "CareerCup",
    publishedDate: "2015-07-01",
    country: "US",
  },
  {
    _id: "507f1f77bcf86cd799439016",
    title: "Head First Design Patterns",
    author: "Eric Freeman",
    publisher: "O'Reilly Media",
    publishedDate: "2004-10-25",
    country: "US",
  },
  {
    _id: "507f1f77bcf86cd799439017",
    title: "You Don't Know JS",
    author: "Kyle Simpson",
    publisher: "O'Reilly Media",
    publishedDate: "2015-12-27",
    country: "US",
  },
  {
    _id: "507f1f77bcf86cd799439018",
    title: "The Linux Command Line",
    author: "William Shotts",
    publisher: "No Starch Press",
    publishedDate: "2012-01-01",
    country: "US",
  },
  {
    _id: "507f1f77bcf86cd799439019",
    title: "Algorithms",
    author: "Robert Sedgewick",
    publisher: "Addison-Wesley",
    publishedDate: "2011-03-24",
    country: "US",
  },
  {
    _id: "507f1f77bcf86cd799439020",
    title: "Computer Networks",
    author: "Andrew S. Tanenbaum",
    publisher: "Prentice Hall",
    publishedDate: "2010-10-07",
    country: "NL",
  },
];

export async function seedBooks() {
  try {
    console.log("[Mongodb] Seeding");

    await Book.deleteMany({}); // clear collection
    await Book.insertMany(data); // bulk insert

    console.log("[Mongodb] Seeded");
  } catch (err) {
    console.error("[Mongodb] Seed failed", err);
  }
}
