// backend/src/routes/provider.routes.ts
import express from 'express';
import prisma from '../config/db';

const router = express.Router();

// GET /api/providers - Tous les prestataires
router.get('/', async (req, res) => {
  try {
    const providers = await prisma.provider.findMany({
      include: {
        user: true,
        reviews: true
      }
    });
    res.json(providers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/providers/:id - Un prestataire spécifique
router.get('/:id', async (req, res) => {
  try {
    const provider = await prisma.provider.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        reviews: true
      }
    });

    if (!provider) {
      return res.status(404).json({ error: "Prestataire non trouvé" });
    }

    res.json(provider);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;