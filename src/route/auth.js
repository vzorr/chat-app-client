// routes/auth.js (Node.js backend)
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET_KEY = 'your_super_secret_key';

router.post('/token', (req, res) => {
  const { id, email, name, phone } = req.body;

  const payload = { id, email, name, phone };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });

  res.json({ token });
});

module.exports = router;
