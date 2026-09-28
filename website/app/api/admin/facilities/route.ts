import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const facilities = await prisma.facility.findMany({
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(facilities);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, building, floor, capacity, type, status, description } = body;

    const facility = await prisma.facility.create({
      data: {
        name,
        code: code || `FAC-${Date.now()}`,
        building: building || 'Gedung B',
        floor: floor || 'Lantai 1',
        capacity: capacity ? Number(capacity) : 30,
        type: type || 'RUANGAN',
        status: status || 'ACTIVE',
        description,
      },
    });

    return NextResponse.json({ success: true, message: 'Fasilitas berhasil ditambahkan', data: facility }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambahkan fasilitas' }, { status: 500 });
  }
}
