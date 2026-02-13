import express from 'express';
import db from '../db.js'
const router = express.Router();

// CREATE user
router.post('/', (req, res) => {
  try {
    const { name, email, age, phone } = req.body;
    const stmt = db.prepare('INSERT INTO users (name, email, age, phone) VALUES (?, ?, ?, ?)');
    const result = stmt.run(name, email, age, phone);
    res.json({ id: result.lastInsertRowid, name, email, age, phone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ all users
router.get('/', (req, res) => {
  try {
    const { name, email, age, phone } = req.query;

    let query = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    if (name) {
      query += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }

    if (email) {
      query += ' AND email LIKE ?';
      params.push(`%${email}%`);
    }
    if (age) {
      query += ' AND age = ?';
      params.push(age);
    }

    if (phone) {
      query += ' AND phone LIKE ?';
      params.push(`%${phone}%`);
    }

    const stmt = db.prepare(query);
    const rows = stmt.all(...params);

    res.json(rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ one user by id
router.get('/:id', (req, res) => {
  try {
    const { fields } = req.query; // e.g. ?fields=name,email
    let query = 'SELECT * FROM users WHERE id = ?';

    if (fields) {
      const columns = fields.split(',').map(f => f.trim()).join(', ');
      query = `SELECT ${columns} FROM users WHERE id = ?`;
    }

    const stmt = db.prepare(query);
    const user = stmt.get(req.params.id);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// UPDATE user
router.put('/:id', (req, res) => {
  try {
    const { name, email, age, phone } = req.body;
    const stmt = db.prepare('UPDATE users SET name = ?, email = ?, age = ?, phone = ? WHERE id = ?');
    const result = stmt.run(name, email, age, phone, req.params.id);
    if (result.changes > 0) {
     res.json({
        message: 'User updated successfully',
        user: { id: req.params.id, name, email, age, phone }
     });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE user
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(req.params.id);
    if (result.changes > 0) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;