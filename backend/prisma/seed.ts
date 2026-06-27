import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Creando usuarios iniciales...');

  const adminHash = await argon2.hash('Admin2024!');
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminHash,
      fullName: 'Administrador del Sistema',
      role: 'ADMIN',
      email: 'admin@rescate.gob.ve',
      organization: 'Sistema Nacional de Rescate',
    },
  });

  const rescuerHash = await argon2.hash('Rescate2024!');
  const rescuer = await prisma.user.upsert({
    where: { username: 'rescatista1' },
    update: {},
    create: {
      username: 'rescatista1',
      passwordHash: rescuerHash,
      fullName: 'Carlos Rodríguez',
      role: 'RESCUER',
      organization: 'Protección Civil Caracas',
    },
  });

  const hospitalHash = await argon2.hash('Hospital2024!');
  const hospital = await prisma.user.upsert({
    where: { username: 'hospital1' },
    update: {},
    create: {
      username: 'hospital1',
      passwordHash: hospitalHash,
      fullName: 'Dr. Ana González',
      role: 'HOSPITAL',
      organization: 'Hospital Central de Caracas',
    },
  });

  const viewerHash = await argon2.hash('Consulta2024!');
  await prisma.user.upsert({
    where: { username: 'consulta' },
    update: {},
    create: {
      username: 'consulta',
      passwordHash: viewerHash,
      fullName: 'Operador de Consulta',
      role: 'VIEWER',
    },
  });

  // Crear token de emergencia inicial
  const token = await prisma.emergencyToken.upsert({
    where: { token: 'EMERGENCIA-2024-TOKEN-INICIAL' },
    update: {},
    create: {
      token: 'EMERGENCIA-2024-TOKEN-INICIAL',
      description: 'Token inicial de emergencia para equipos de rescate',
      createdById: admin.id,
      isActive: true,
    },
  });

  console.log('Usuarios creados:');
  console.log('  admin / Admin2024!  [ADMINISTRADOR]');
  console.log('  rescatista1 / Rescate2024!  [RESCATISTA]');
  console.log('  hospital1 / Hospital2024!  [HOSPITAL]');
  console.log('  consulta / Consulta2024!  [SOLO LECTURA]');
  console.log('Token de emergencia:', token.token);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
