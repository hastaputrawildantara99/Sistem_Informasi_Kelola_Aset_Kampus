import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        mahasiswa: true,
        dosen: true,
        staf: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      identityNumber: u.mahasiswa?.nim || u.dosen?.nip || u.staf?.nip || u.username,
      role: u.role,
      type: u.jenisUser || (u.role === 'PETUGAS' ? 'STAF' : 'MAHASISWA'),
      status: u.verified ? 'APPROVED' : 'PENDING',
      verified: u.verified,
      createdAt: u.createdAt,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
