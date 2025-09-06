-- Example Product Data for Problem 5 Database
-- This script inserts sample products across various categories

-- Clear existing data (optional - uncomment if needed)
-- DELETE FROM products;

-- Insert example products with realistic data
INSERT INTO products (name, description, price, sku, category, is_active, created_at, updated_at) VALUES

-- Electronics Category
('iPhone 15 Pro Max', 'Latest flagship smartphone with A17 Pro chip, titanium build, and advanced camera system', 1199.99, 'APPLE-IP15PM-256', 'electronics', true, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
('MacBook Air M2', '13-inch laptop with M2 chip, 8GB RAM, 256GB SSD - perfect for productivity and creativity', 1299.00, 'APPLE-MBA-M2-256', 'electronics', true, NOW() - INTERVAL '25 days', NOW() - INTERVAL '10 days'),
('Sony WH-1000XM5', 'Industry-leading wireless noise canceling headphones with exceptional sound quality', 399.99, 'SONY-WH1000XM5-BLK', 'electronics', true, NOW() - INTERVAL '20 days', NOW() - INTERVAL '5 days'),
('Samsung 55" 4K Smart TV', 'QLED display with HDR10+ support and smart TV features', 899.99, 'SAMSUNG-Q60B-55', 'electronics', true, NOW() - INTERVAL '15 days', NOW() - INTERVAL '3 days'),

-- Clothing Category  
('Levi''s 501 Original Jeans', 'Classic straight-leg denim jeans in medium wash - size 32x32', 69.99, 'LEVIS-501-MW-32X32', 'clothing', true, NOW() - INTERVAL '12 days', NOW() - INTERVAL '2 days'),
('Nike Air Force 1 Low', 'Iconic basketball sneakers in white leather - size 10.5', 90.00, 'NIKE-AF1-LOW-WHT-105', 'clothing', true, NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day'),
('Patagonia Fleece Jacket', 'Lightweight fleece jacket perfect for outdoor activities - size Medium', 129.99, 'PATAGONIA-FLEECE-M-GRY', 'clothing', false, NOW() - INTERVAL '45 days', NOW() - INTERVAL '40 days'),

-- Books Category
('The Pragmatic Programmer', 'Essential guide for software developers - 20th Anniversary Edition', 49.99, 'BOOK-PRAGPROG-20ED', 'books', true, NOW() - INTERVAL '18 days', NOW() - INTERVAL '1 day'),
('Clean Code', 'A handbook of agile software craftsmanship by Robert C. Martin', 44.99, 'BOOK-CLEANCODE-RCM', 'books', true, NOW() - INTERVAL '22 days', NOW() - INTERVAL '4 days'),
('Dune: Complete Series Box Set', 'Frank Herbert''s epic science fiction saga - hardcover collection', 199.99, 'BOOK-DUNE-BOXSET-HC', 'books', true, NOW() - INTERVAL '35 days', NOW() - INTERVAL '30 days'),

-- Home & Garden Category
('Dyson V15 Detect Vacuum', 'Cordless vacuum with laser dust detection and powerful suction', 749.99, 'DYSON-V15-DETECT-YLW', 'home', true, NOW() - INTERVAL '14 days', NOW() - INTERVAL '2 days'),
('Instant Pot Duo 7-in-1', '8-quart electric pressure cooker with multiple cooking functions', 119.99, 'INSTPOT-DUO-8QT-BLK', 'home', true, NOW() - INTERVAL '28 days', NOW() - INTERVAL '15 days'),
('IKEA Lack Coffee Table', 'Simple white coffee table perfect for modern living rooms', 29.99, 'IKEA-LACK-CTBL-WHT', 'home', true, NOW() - INTERVAL '40 days', NOW() - INTERVAL '35 days'),

-- Sports & Recreation Category
('Wilson Pro Staff Tennis Racquet', 'Professional-grade tennis racquet used by top players', 249.99, 'WILSON-PROSTAFF-V13', 'sports', true, NOW() - INTERVAL '16 days', NOW() - INTERVAL '3 days'),
('Yeti Rambler 20oz Tumbler', 'Insulated stainless steel tumbler that keeps drinks cold for hours', 34.99, 'YETI-RAMBLER-20OZ-SS', 'sports', true, NOW() - INTERVAL '11 days', NOW() - INTERVAL '1 day'),
('Peloton Bike+', 'Premium indoor cycling bike with rotating HD touchscreen', 2495.00, 'PELOTON-BIKEPLUS-BLK', 'sports', false, NOW() - INTERVAL '60 days', NOW() - INTERVAL '55 days');