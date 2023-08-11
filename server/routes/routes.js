const express = require('express');
const router = express.Router();
const db = require('../src/db_config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Route to login user
router.post('/login', async (req, res) => {
  const { username, password_hash } = req.body;

  try {
    const connection = await db;
    const [results, fields] = await connection.query(
      'SELECT * FROM login WHERE username = ?',
      [username]
    );

    if (results.length === 1) {
      const user = results[0];
      const passwordMatches = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (passwordMatches) {
        const token = jwt.sign(
          { id: user.id, username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        res.json({ token });
      } else {
        res.status(401).json({ error: 'Invalid login data' });
      }
    } else {
      res.status(401).json({ error: 'Invalid login data' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get all users
router.get('/users', async (req, res) => {
  try {
    const connection = await db;
    const [results, fields] = await connection.query('SELECT * FROM Users');
    res.json(results); // Grąžiname duomenis JSON formatu
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to create a new user
router.post('/api/register', async (req, res) => {
  const { first_name, last_name, email, age } = req.body;
  const query =
    'INSERT INTO Users (first_name, last_name, email, age) VALUES (?, ?, ?, ?)';
  try {
    const connection = await db;
    const [result] = await connection.query(query, [
      first_name,
      last_name,
      email,
      age,
    ]);
    res.json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.put('/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { first_name, last_name, email, age } = req.body;
  const query =
    'UPDATE Users SET first_name = ?, last_name = ?, email = ?, age = ? WHERE id = ?';
  try {
    const connection = await db;
    const [result] = await connection.query(query, [
      first_name,
      last_name,
      email,
      age,
      userId,
    ]);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to delete user
router.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;
  const query = 'DELETE FROM Users WHERE id = ?';
  try {
    const connection = await db;
    const [result] = await connection.query(query, [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
