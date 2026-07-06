// backend/src/seed.ts
import prisma from './config/db';

async function main() {
  console.log("🌱 Seeding database...");

  // Créer des utilisateurs + prestataires
  const prov1 = await prisma.user.upsert({
    where: { email: 'mamadou.diallo@gmail.com' },
    update: {},
    create: {
      email: 'mamadou.diallo@gmail.com',
      phone: '+223 76 54 32 10',
      password: '$2a$12$dummyhashforseed', // mot de passe simulé
      name: 'Mamadou Diallo',
      role: 'PROVIDER',
      city: 'Bamako'
    }
  });

  await prisma.provider.upsert({
    where: { userId: prov1.id },
    update: {},
    create: {
      userId: prov1.id,
      category: 'bricolage',
      specialties: 'plomberie,électricité,dépannage',
      hourlyRate: 5000,
      description: 'Plombier expérimenté avec 12 ans d\'expérience',
      verified: true,
      isAvailable: true,
      walletBalance: 42000
    }
  });

  console.log("✅ Données de test ajoutées avec succès !");
}

main()
  .catch(e => console.error(e))
  .finally(() => process.exit());