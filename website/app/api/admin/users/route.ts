import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, identityNumber, role = 'USER', type = 'MAHASISWA', password = 'password123' } = body;

    if (!name || !email || !identityNumber) {
      return NextResponse.json(
        { error: 'Nama, email, dan NIM/NIP/Username wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanUsername = identityNumber.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { username: cleanUsername },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email atau NIM/NIP sudah terdaftar di sistem.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);

    const validRole = ['ADMIN', 'PETUGAS', 'USER'].includes(role) ? role : 'USER';
    const validJenis = ['MAHASISWA', 'DOSEN', 'STAF'].includes(type) ? type : 'MAHASISWA';

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        username: cleanUsername,
        password: hashedPassword,
        role: validRole,
        jenisUser: validJenis,
        verified: true, // Created directly by Admin
      },
    });

    // Create child record according to civitas
    if (validJenis === 'MAHASISWA') {
      await prisma.mahasiswa.create({
        data: {
          nim: cleanUsername,
          userId: newUser.id,
        },
      });
    } else if (validJenis === 'DOSEN') {
      await prisma.dosen.create({
        data: {
          nip: cleanUsername,
          userId: newUser.id,
        },
      });
    } else if (validJenis === 'STAF') {
      await prisma.staf.create({
        data: {
          nip: cleanUsername,
          userId: newUser.id,
        },
      });
    }

    const created = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      identityNumber: cleanUsername,
      role: newUser.role,
      type: newUser.jenisUser,
      status: 'APPROVED',
      verified: newUser.verified,
      createdAt: newUser.createdAt,
    };

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menambahkan pengguna baru' },
      { status: 500 }
    );
  }
}
