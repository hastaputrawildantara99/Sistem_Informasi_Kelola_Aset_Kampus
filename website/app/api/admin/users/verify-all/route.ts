import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const result = await prisma.user.updateMany({
      where: { verified: false },
      data: { verified: true },
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil menyetujui ${result.count} pengguna pending`,
      count: result.count,
    });
  } catch (error: any) {
    console.error('Error verifying all users:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menyetujui semua pengguna' },
      { status: 500 }
    );
  }
}
