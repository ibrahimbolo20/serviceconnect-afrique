// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import providerRoutes from './routes/provider.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000', // Autorise le frontend React
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: "✅ ServiceConnect Backend est en ligne !",
    status: "OK",
    version: "1.0.0"
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: "healthy", database: "SQLite" });
});
// ... après app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
// Auth routes
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 ServiceConnect Backend démarré sur http://localhost:${PORT}`);
  console.log(`📍 Auth routes disponibles sur /api/auth/register et /api/auth/login`);
});