const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database SIKAK...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const hashedUserPass = await bcrypt.hash('user123', 10);

  // 1. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kampus.ac.id' },
    update: {},
    create: {
      name: 'Djuan Setyo Jati',
      email: 'admin@kampus.ac.id',
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      verified: true,
    },
  });

  // 2. Create Petugas User
  const petugas = await prisma.user.upsert({
    where: { email: 'petugas@kampus.ac.id' },
    update: {},
    create: {
      name: 'Siti Nurhaliza, S.Kom.',
      email: 'petugas@kampus.ac.id',
      username: 'petugas',
      password: hashedPassword,
      role: 'PETUGAS',
      jenisUser: 'STAF',
      verified: true,
      staf: {
        create: {
          nip: '199105242018032002',
        },
      },
    },
  });

  // 3. Create Unverified Users for US 16 queue
  const user1 = await prisma.user.upsert({
    where: { email: 'm.farhanpratama@kampus.ac.id' },
    update: {},
    create: {
      name: 'Muhammad Farhan Pratama',
      email: 'm.farhanpratama@kampus.ac.id',
      username: '2108561042',
      password: hashedUserPass,
      role: 'USER',
      jenisUser: 'MAHASISWA',
      verified: false,
      mahasiswa: {
        create: {
          nim: '2108561042',
        },
      },
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'maya.sartika@kampus.ac.id' },
    update: {},
    create: {
      name: 'Dr. Maya Sartika, M.T.',
      email: 'maya.sartika@kampus.ac.id',
      username: '198403122001012001',
      password: hashedUserPass,
      role: 'USER',
      jenisUser: 'DOSEN',
      verified: false,
      dosen: {
        create: {
          nip: '198403122001012001',
        },
      },
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'dimas.aditya@student.kampus.ac.id' },
    update: {},
    create: {
      name: 'Dimas Aditya Kusuma',
      email: 'dimas.aditya@student.kampus.ac.id',
      username: '2208561019',
      password: hashedUserPass,
      role: 'USER',
      jenisUser: 'MAHASISWA',
      verified: false,
      mahasiswa: {
        create: {
          nim: '2208561019',
        },
      },
    },
  });

  // 4. Create Master Facilities
  const facilities = [
    {
      name: 'Lab Rekayasa Perangkat Lunak',
      code: 'LAB-RPL-01',
      building: 'Gedung B',
      floor: 'Lantai 2',
      capacity: 45,
      type: 'LABORATORIUM',
      status: 'ACTIVE',
      description: 'Laboratorium untuk praktikum software engineering dan web dev.',
    },
    {
      name: 'Auditorium Utama Rektorat',
      code: 'AUD-REK-01',
      building: 'Gedung Rektorat',
      floor: 'Lantai 3',
      capacity: 300,
      type: 'AUDITORIUM',
      status: 'ACTIVE',
      description: 'Auditorium besar untuk seminar nasional dan acara wisuda.',
    },
    {
      name: 'Smart Classroom E.201',
      code: 'SMT-C201',
      building: 'Gedung E',
      floor: 'Lantai 2',
      capacity: 40,
      type: 'RUANGAN',
      status: 'MAINTENANCE',
      description: 'Ruang kelas multimedia (dalam perbaikan proyektor).',
    },
    {
      name: 'Lab Komputer E',
      code: 'LAB-KOMP-E',
      building: 'Gedung E',
      floor: 'Lantai 1',
      capacity: 35,
      type: 'LABORATORIUM',
      status: 'ACTIVE',
      description: 'Laboratorium komputer umum.',
    },
  ];

  for (const fac of facilities) {
    await prisma.facility.upsert({
      where: { code: fac.code },
      update: {},
      create: fac,
    });
  }

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
