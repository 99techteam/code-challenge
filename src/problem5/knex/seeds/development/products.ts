import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Delete existing entries
  await knex("product").del();

  // Insert sample products
  await knex("product").insert([
    {
      name: "iPhone 15 Pro",
      description: "Latest iPhone with advanced camera system",
      price: 999.99,
      publish_date: "2025-09-15",
      manufacturer: "Apple",
      image_url: "https://example.com/iphone15.jpg",
    },
    {
      name: "Galaxy S25",
      description: "Premium Android smartphone with AI features",
      price: 899.99,
      publish_date: "2025-02-01",
      manufacturer: "Samsung",
      image_url: "https://example.com/galaxy-s25.jpg",
    },
    {
      name: "MacBook Air M3",
      description: "Ultra-thin laptop with amazing battery life",
      price: 1299.99,
      publish_date: "2025-03-20",
      manufacturer: "Apple",
      image_url: "https://example.com/macbook-air.jpg",
    },
    {
      name: "PlayStation 6",
      description: "Next-gen gaming console with 8K support",
      price: 499.99,
      publish_date: "2025-11-11",
      manufacturer: "Sony",
      image_url: "https://example.com/ps6.jpg",
    },
    {
      name: "AirPods Pro 3",
      description: "Wireless earbuds with enhanced noise cancellation",
      price: 249.99,
      publish_date: "2025-10-01",
      manufacturer: "Apple",
      image_url: "https://example.com/airpods-pro-3.jpg",
    },
  ]);
}
