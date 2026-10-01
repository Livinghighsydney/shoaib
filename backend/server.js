require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: isProd ? true : ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/content', require('./routes/content'));

// In production serve the built React app and handle SPA routing
if (isProd) {
  const frontendDist = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT} [${isProd ? 'production' : 'development'}]`);
});
