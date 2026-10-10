import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;
    const userId = Number(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'ID pengguna tidak valid' }, { status: 400 });
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Aksi tidak valid (harus approve atau reject)' }, { status: 400 });
    }

    if (action === 'approve') {
      await prisma.user.update({
        where: { id: userId },
        data: { verified: true },
      });
    } else {
      // Delete child relations first to prevent foreign key errors
      await prisma.mahasiswa.deleteMany({ where: { userId } });
      await prisma.dosen.deleteMany({ where: { userId } });
      await prisma.staf.deleteMany({ where: { userId } });
      await prisma.user.delete({
        where: { id: userId },
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Pengguna #${id} berhasil di-${action === 'approve' ? 'setujui' : 'tolak'}` 
    });
  } catch (error: any) {
    console.error('Error verifying user:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat memproses verifikasi' },
      { status: 500 }
    );
  }
}
