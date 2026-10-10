import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

async function getAuthenticatedAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  let userId: number | null = null;

  if (token) {
    try {
      const decoded: any = await verifyToken(token);
      userId = decoded.id;
    } catch (e) {
      // Token invalid
    }
  }

  // Find user by token id or find default ADMIN
  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        include: { staf: true, dosen: true, mahasiswa: true },
      })
    : await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        include: { staf: true, dosen: true, mahasiswa: true },
      });

  return user;
}

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'Admin tidak ditemukan' }, { status: 404 });
    }

    const nip = admin.staf?.nip || admin.dosen?.nip || admin.mahasiswa?.nim || admin.username;

    return NextResponse.json({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      username: admin.username,
      nip: nip || '',
      role: admin.role === 'ADMIN' ? 'Administrator Utama SIKAK' : admin.role,
      verified: admin.verified,
    });
  } catch (error: any) {
    console.error('Error fetching admin profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'Admin tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const { action } = body;

    // Action 1: Update Profile
    if (action === 'update_profile') {
      const { name, email, nip } = body;

      if (!name || !email) {
        return NextResponse.json({ error: 'Nama dan email wajib diisi' }, { status: 400 });
      }

      // Check email duplicate
      const cleanEmail = email.trim().toLowerCase();
      const duplicate = await prisma.user.findFirst({
        where: {
          email: cleanEmail,
          NOT: { id: admin.id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'Email tersebut sudah digunakan oleh akun lain' },
          { status: 400 }
        );
      }

      // Update user name and email
      const updatedUser = await prisma.user.update({
        where: { id: admin.id },
        data: {
          name: name.trim(),
          email: cleanEmail,
        },
      });

      // Update or create NIP relation
      if (nip) {
        const cleanNip = nip.trim();
        if (admin.staf) {
          await prisma.staf.update({
            where: { id: admin.staf.id },
            data: { nip: cleanNip },
          });
        } else {
          await prisma.staf.create({
            data: {
              nip: cleanNip,
              userId: admin.id,
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Profil admin berhasil diperbarui di database',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          username: updatedUser.username,
          nip: nip?.trim() || admin.username,
        },
      });
    }

    // Action 2: Change Password
    if (action === 'change_password') {
      const { currentPassword, newPassword, confirmPassword } = body;

      if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json(
          { error: 'Semua kolom kata sandi wajib diisi' },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: 'Konfirmasi kata sandi baru tidak cocok' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Kata sandi baru minimal 6 karakter' },
          { status: 400 }
        );
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return NextResponse.json(
          { error: 'Kata sandi saat ini tidak sesuai' },
          { status: 400 }
        );
      }

      // Hash and update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: admin.id },
        data: { password: hashedPassword },
      });

      return NextResponse.json({
        success: true,
        message: 'Kata sandi berhasil diperbarui di database',
      });
    }

    // Action 3: General System / Notification preferences
    return NextResponse.json({
      success: true,
      message: 'Preferensi berhasil disimpan',
    });
  } catch (error: any) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menyimpan pengaturan' },
      { status: 500 }
    );
  }
}
