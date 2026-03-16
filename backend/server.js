const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { db, initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

initializeDatabase();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = uuidv4();
    db.prepare('UPDATE users SET token = ? WHERE id = ?').run(token, user.id);
    
    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  try {
    const { token } = req.body;
    if (token) {
      db.prepare('UPDATE users SET token = NULL WHERE token = ?').run(token);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const user = db.prepare('SELECT id, username, name, role FROM users WHERE token = ?').get(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM products';
    const params = [];
    const conditions = [];

    if (category && category !== 'All') {
      conditions.push('category = ?');
      params.push(category);
    }

    if (search) {
      conditions.push('(name LIKE ? OR barcode LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY name';
    const products = db.prepare(query).all(...params);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const { name, price, category, image, stock, barcode } = req.body;
    const id = uuidv4();
    db.prepare(`
      INSERT INTO products (id, name, price, category, image, stock, barcode)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, price, category || 'General', image || '', stock || 100, barcode || '');
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const { name, price, category, image, stock, barcode } = req.body;
    db.prepare(`
      UPDATE products SET name = ?, price = ?, category = ?, image = ?, stock = ?, barcode = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, price, category, image, stock, barcode, req.params.id);
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', (req, res) => {
  try {
    const { name, icon } = req.body;
    const id = uuidv4();
    db.prepare('INSERT INTO categories (id, name, icon) VALUES (?, ?, ?)').run(id, name, icon || '📦');
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/transactions', (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const transactions = db.prepare(`
      SELECT * FROM transactions ORDER BY createdAt DESC LIMIT ?
    `).all(parseInt(limit));
    res.json(transactions.map(t => ({ ...t, items: JSON.parse(t.items) })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transactions', (req, res) => {
  try {
    const { items, subtotal, tax, total, paymentMethod } = req.body;
    const id = uuidv4();
    db.prepare(`
      INSERT INTO transactions (id, items, subtotal, tax, total, paymentMethod)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, JSON.stringify(items), subtotal, tax, total, paymentMethod);

    items.forEach(item => {
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.id);
    });

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    res.status(201).json({ ...transaction, items: JSON.parse(transaction.items) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/transactions/today', (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT * FROM transactions 
      WHERE date(createdAt) = date('now')
      ORDER BY createdAt DESC
    `).all();
    res.json(transactions.map(t => ({ ...t, items: JSON.parse(t.items) })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    const todayStats = db.prepare(`
      SELECT 
        COUNT(*) as transactionCount,
        COALESCE(SUM(total), 0) as totalRevenue
      FROM transactions 
      WHERE date(createdAt) = date('now')
    `).get();

    const topProducts = db.prepare(`
      SELECT p.name, SUM(ti.quantity) as totalSold
      FROM transactions t
      JOIN json_each(t.items) ti
      JOIN products p ON p.id = ti.value->>'id'
      WHERE date(t.createdAt) = date('now')
      GROUP BY p.id
      ORDER BY totalSold DESC
      LIMIT 5
    `).all();

    res.json({
      transactionCount: todayStats.transactionCount,
      totalRevenue: todayStats.totalRevenue,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`QuickMart POS API running on port ${PORT}`);
});
