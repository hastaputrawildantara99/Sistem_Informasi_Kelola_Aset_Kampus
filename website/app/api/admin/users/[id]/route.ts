import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'ID pengguna tidak valid' }, { status: 400 });
    }

    const body = await request.json();
    const { role, verified } = body;

    const dataToUpdate: any = {};

    if (role !== undefined) {
      if (!['ADMIN', 'PETUGAS', 'USER'].includes(role)) {
        return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 });
      }
      dataToUpdate.role = role;
    }

    if (verified !== undefined) {
      dataToUpdate.verified = Boolean(verified);
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'Tidak ada data yang diperbarui' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      include: {
        mahasiswa: true,
        dosen: true,
        staf: true,
      },
    });

    const formatted = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      identityNumber: updatedUser.mahasiswa?.nim || updatedUser.dosen?.nip || updatedUser.staf?.nip || updatedUser.username,
      role: updatedUser.role,
      type: updatedUser.jenisUser || (updatedUser.role === 'PETUGAS' ? 'STAF' : 'MAHASISWA'),
      status: updatedUser.verified ? 'APPROVED' : 'PENDING',
      verified: updatedUser.verified,
      createdAt: updatedUser.createdAt,
    };

    return NextResponse.json({
      success: true,
      message: 'Data pengguna berhasil diperbarui',
      user: formatted,
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memperbarui pengguna' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'ID pengguna tidak valid' }, { status: 400 });
    }

    // Check if user exists and check related reservations or reports
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            Reservation: true,
            Report: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    // Prevent deletion if user has reservations or reports linked
    if (existing._count.Reservation > 0 || existing._count.Report > 0) {
      return NextResponse.json(
        {
          error: `Pengguna tidak dapat dihapus karena memiliki riwayat ${existing._count.Reservation} reservasi dan ${existing._count.Report} laporan fasilitas.`,
        },
        { status: 400 }
      );
    }

    // Delete relation records first (Mahasiswa, Dosen, Staf)
    await prisma.mahasiswa.deleteMany({ where: { userId } });
    await prisma.dosen.deleteMany({ where: { userId } });
    await prisma.staf.deleteMany({ where: { userId } });

    // Delete the user record
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: 'Pengguna berhasil dihapus dari database',
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menghapus pengguna' },
      { status: 500 }
    );
  }
}
