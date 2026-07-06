// src/routes/index.ts
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: "ServiceConnect API - Routes disponibles" });
});

export default router;