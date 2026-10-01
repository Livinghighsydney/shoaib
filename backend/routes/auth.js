const router = require('express').Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.json({ token, email });
});

router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ valid: false });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user });
  } catch {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
