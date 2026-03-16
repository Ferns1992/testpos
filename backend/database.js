const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = process.env.DB_PATH || '/data/quickmart.db';
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'cashier',
      token TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      icon TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT,
      image TEXT,
      stock INTEGER DEFAULT 100,
      barcode TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      total REAL NOT NULL,
      paymentMethod TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (categoryCount.count === 0) {
    seedData();
  }
}

function seedData() {
  const users = [
    { id: uuidv4(), username: 'admin', password: 'admin123', name: 'Store Manager', role: 'manager' },
    { id: uuidv4(), username: 'cashier', password: 'cashier123', name: 'John Cashier', role: 'cashier' }
  ];

  const insertUser = db.prepare('INSERT INTO users (id, username, password, name, role) VALUES (?, ?, ?, ?, ?)');
  users.forEach(user => insertUser.run(user.id, user.username, user.password, user.name, user.role));

  const categories = [
    { id: uuidv4(), name: 'Beverages', icon: '🥤' },
    { id: uuidv4(), name: 'Snacks', icon: '🍟' },
    { id: uuidv4(), name: 'Food', icon: '🍔' },
    { id: uuidv4(), name: 'Coffee', icon: '☕' },
    { id: uuidv4(), name: 'Essentials', icon: '🧴' }
  ];

  const insertCategory = db.prepare('INSERT INTO categories (id, name, icon) VALUES (?, ?, ?)');
  categories.forEach(cat => insertCategory.run(cat.id, cat.name, cat.icon));

  const products = [
    { name: 'Cola Classic', price: 1.99, category: 'Beverages', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200', stock: 50, barcode: '490000000001' },
    { name: 'Orange Juice', price: 2.49, category: 'Beverages', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200', stock: 40, barcode: '490000000002' },
    { name: 'Energy Drink', price: 3.99, category: 'Beverages', image: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=200', stock: 30, barcode: '490000000003' },
    { name: 'Mineral Water', price: 0.99, category: 'Beverages', image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=200', stock: 100, barcode: '490000000004' },
    { name: 'Iced Tea', price: 1.79, category: 'Beverages', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200', stock: 35, barcode: '490000000005' },
    { name: 'Potato Chips', price: 1.49, category: 'Snacks', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200', stock: 60, barcode: '490000000010' },
    { name: 'Chocolate Bar', price: 1.29, category: 'Snacks', image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=200', stock: 80, barcode: '490000000011' },
    { name: 'Pretzels', price: 1.99, category: 'Snacks', image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=200', stock: 45, barcode: '490000000012' },
    { name: 'Cookie Pack', price: 2.29, category: 'Snacks', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200', stock: 50, barcode: '490000000013' },
    { name: 'Trail Mix', price: 3.49, category: 'Snacks', image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=200', stock: 25, barcode: '490000000014' },
    { name: 'Hot Dog', price: 2.99, category: 'Food', image: 'https://images.unsplash.com/photo-1612392062631-94dd858cba88?w=200', stock: 20, barcode: '490000000020' },
    { name: 'Pizza Slice', price: 3.49, category: 'Food', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200', stock: 15, barcode: '490000000021' },
    { name: 'Burger', price: 4.99, category: 'Food', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200', stock: 12, barcode: '490000000022' },
    { name: 'Chicken Nuggets', price: 3.99, category: 'Food', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=200', stock: 18, barcode: '490000000023' },
    { name: 'Taco', price: 2.49, category: 'Food', image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=200', stock: 22, barcode: '490000000024' },
    { name: 'Hot Coffee', price: 1.99, category: 'Coffee', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200', stock: 100, barcode: '490000000030' },
    { name: 'Iced Coffee', price: 2.49, category: 'Coffee', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200', stock: 80, barcode: '490000000031' },
    { name: 'Latte', price: 3.49, category: 'Coffee', image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=200', stock: 60, barcode: '490000000032' },
    { name: 'Cappuccino', price: 3.29, category: 'Coffee', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200', stock: 55, barcode: '490000000033' },
    { name: 'Mocha', price: 3.79, category: 'Coffee', image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=200', stock: 45, barcode: '490000000034' },
    { name: 'Toothpaste', price: 2.99, category: 'Essentials', image: 'https://images.unsplash.com/photo-1585456815956-3ab6a9b6c224?w=200', stock: 40, barcode: '490000000040' },
    { name: 'Shampoo', price: 4.49, category: 'Essentials', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200', stock: 30, barcode: '490000000041' },
    { name: 'Soap Bar', price: 1.29, category: 'Essentials', image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=200', stock: 70, barcode: '490000000042' },
    { name: 'Batteries', price: 5.99, category: 'Essentials', image: 'https://images.unsplash.com/photo-1619641805634-98e5c083f1a3?w=200', stock: 25, barcode: '490000000043' },
    { name: 'Tissue Pack', price: 0.99, category: 'Essentials', image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=200', stock: 100, barcode: '490000000044' }
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (id, name, price, category, image, stock, barcode)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  products.forEach(p => {
    insertProduct.run(uuidv4(), p.name, p.price, p.category, p.image, p.stock, p.barcode);
  });
}

module.exports = { db, initializeDatabase };
