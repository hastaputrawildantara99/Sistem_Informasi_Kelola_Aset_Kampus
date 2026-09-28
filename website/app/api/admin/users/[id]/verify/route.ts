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

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (action === 'approve') {
      await prisma.user.update({
        where: { id: userId },
        data: { verified: true },
      });
    } else {
      await prisma.user.delete({
        where: { id: userId },
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `User #${id} berhasil di-${action === 'approve' ? 'setujui' : 'tolak'}` 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
