import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // bcrypt génère un sel automatique à chaque hash
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { name: 'Alice', email: 'alice@example.com', password: passwordHash },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { name: 'Bob', email: 'bob@example.com', password: passwordHash },
  });

  // On repart de zéro pour ces deux utilisateurs : le seed reste relançable
  await prisma.task.deleteMany({
    where: { userId: { in: [alice.id, bob.id] } },
  });

  await prisma.task.createMany({
    data: [
      { title: 'Préparer la démo', description: 'Slides + jeu de données', priority: 'high', completed: false, userId: alice.id },
      { title: 'Écrire le README', priority: 'medium', completed: false, userId: alice.id },
      { title: 'Corriger les tests', description: 'Cas limites de validation', priority: 'high', completed: true, userId: alice.id },
      { title: 'Ranger le bureau', priority: 'low', completed: true, userId: alice.id },
      { title: 'Réserver la salle', priority: 'medium', completed: false, userId: bob.id },
      { title: 'Relire le rapport', description: 'Chapitre 2 et 3', priority: 'low', completed: false, userId: bob.id },
      { title: 'Envoyer la facture', priority: 'high', completed: true, userId: bob.id },
    ],
  });

  console.log('Seed terminé : alice@example.com et bob@example.com (mot de passe : Password123!)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());