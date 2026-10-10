import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FacilityType, FacilityStatus } from '@prisma/client';

export async function GET() {
  try {
    const facilities = await prisma.facility.findMany({
      orderBy: { id: 'asc' },
    });

    const formatted = facilities.map((f) => {
      // Map Prisma enum back to readable frontend type
      let displayType = f.type as string;
      if (f.type === 'CLASSROOM') displayType = 'RUANGAN';
      else if (f.type === 'LABORATORY') displayType = 'LABORATORIUM';
      else if (f.type === 'HALL') displayType = 'AUDITORIUM';

      return {
        id: f.id,
        name: f.name,
        code: f.code,
        building: f.building,
        floor: f.floor,
        capacity: f.capacity,
        type: displayType,
        rawType: f.type,
        status: f.status,
        location: f.location,
        description: f.description,
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('Error fetching admin facilities:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, building, floor, location, capacity, type, status, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nama fasilitas wajib diisi' }, { status: 400 });
    }

    // Map UI type to FacilityType enum
    let mappedType: FacilityType = FacilityType.CLASSROOM;
    if (type === 'LABORATORIUM' || type === 'LABORATORY') mappedType = FacilityType.LABORATORY;
    else if (type === 'AUDITORIUM' || type === 'AULA' || type === 'HALL') mappedType = FacilityType.HALL;
    else if (type === 'EQUIPMENT') mappedType = FacilityType.EQUIPMENT;
    else if (type === 'FIELD' || type === 'LAPANGAN') mappedType = FacilityType.FIELD;
    else if (type === 'RUANGAN' || type === 'CLASSROOM') mappedType = FacilityType.CLASSROOM;

    const autoCode = code?.trim() || `FAC-${Date.now().toString().slice(-4)}`;
    const cleanBuilding = building?.trim() || 'Gedung B';
    const cleanFloor = floor?.trim() || '1';

    // Check code duplication
    const existingCode = await prisma.facility.findUnique({
      where: { code: autoCode },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: `Kode fasilitas "${autoCode}" sudah digunakan.` },
        { status: 400 }
      );
    }

    const facility = await prisma.facility.create({
      data: {
        name: name.trim(),
        code: autoCode,
        building: cleanBuilding,
        floor: cleanFloor,
        location: (body.location || `${cleanBuilding}, Lt. ${cleanFloor}`).trim(),
        capacity: capacity ? Number(capacity) : 30,
        type: mappedType,
        status: (status as FacilityStatus) || 'ACTIVE',
        description: description?.trim() || null,
      },
    });

    let displayType = facility.type as string;
    if (facility.type === 'CLASSROOM') displayType = 'RUANGAN';
    else if (facility.type === 'LABORATORY') displayType = 'LABORATORIUM';
    else if (facility.type === 'HALL') displayType = 'AUDITORIUM';

    return NextResponse.json(
      {
        success: true,
        message: 'Fasilitas berhasil ditambahkan',
        data: {
          ...facility,
          type: displayType,
          rawType: facility.type,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating facility:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menambahkan fasilitas' },
      { status: 500 }
    );
  }
}
