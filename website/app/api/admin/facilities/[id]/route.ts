import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FacilityStatus, FacilityType } from '@prisma/client';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const facilityId = Number(id);

    if (isNaN(facilityId)) {
      return NextResponse.json({ error: 'ID fasilitas tidak valid' }, { status: 400 });
    }

    const body = await request.json();
    const { status, name, code, capacity, building, floor, location, type, description } = body;

    const dataToUpdate: any = {};

    if (status !== undefined) {
      if (!['ACTIVE', 'INACTIVE', 'MAINTENANCE'].includes(status)) {
        return NextResponse.json({ error: 'Status fasilitas tidak valid' }, { status: 400 });
      }
      dataToUpdate.status = status as FacilityStatus;
    }

    if (name !== undefined) dataToUpdate.name = name.trim();
    if (code !== undefined) {
      // Check if new code conflicts with another facility
      const cleanCode = code.trim();
      const duplicate = await prisma.facility.findFirst({
        where: {
          code: cleanCode,
          NOT: { id: facilityId },
        },
      });
      if (duplicate) {
        return NextResponse.json({ error: `Kode fasilitas "${cleanCode}" sudah digunakan oleh fasilitas lain.` }, { status: 400 });
      }
      dataToUpdate.code = cleanCode;
    }

    if (capacity !== undefined) dataToUpdate.capacity = Number(capacity);
    if (building !== undefined) dataToUpdate.building = building.trim();
    if (floor !== undefined) dataToUpdate.floor = String(floor).trim();
    if (location !== undefined) dataToUpdate.location = location.trim();
    else if (building !== undefined || floor !== undefined) {
      dataToUpdate.location = `${dataToUpdate.building || building || 'Gedung B'}, Lt. ${dataToUpdate.floor || floor || '1'}`;
    }

    if (type !== undefined) {
      let mappedType: FacilityType = FacilityType.CLASSROOM;
      if (type === 'LABORATORIUM' || type === 'LABORATORY') mappedType = FacilityType.LABORATORY;
      else if (type === 'AUDITORIUM' || type === 'AULA' || type === 'HALL') mappedType = FacilityType.HALL;
      else if (type === 'EQUIPMENT') mappedType = FacilityType.EQUIPMENT;
      else if (type === 'FIELD' || type === 'LAPANGAN') mappedType = FacilityType.FIELD;
      else if (type === 'RUANGAN' || type === 'CLASSROOM') mappedType = FacilityType.CLASSROOM;
      dataToUpdate.type = mappedType;
    }

    if (description !== undefined) dataToUpdate.description = description ? description.trim() : null;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'Tidak ada data yang diperbarui' }, { status: 400 });
    }

    const updated = await prisma.facility.update({
      where: { id: facilityId },
      data: dataToUpdate,
    });

    let displayType = updated.type as string;
    if (updated.type === 'CLASSROOM') displayType = 'RUANGAN';
    else if (updated.type === 'LABORATORY') displayType = 'LABORATORIUM';
    else if (updated.type === 'HALL') displayType = 'AUDITORIUM';

    return NextResponse.json({
      success: true,
      message: 'Data fasilitas berhasil diperbarui',
      data: {
        ...updated,
        type: displayType,
        rawType: updated.type,
      },
    });
  } catch (error: any) {
    console.error('Error updating facility:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memperbarui fasilitas' },
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
    const facilityId = Number(id);

    if (isNaN(facilityId)) {
      return NextResponse.json({ error: 'ID fasilitas tidak valid' }, { status: 400 });
    }

    const existing = await prisma.facility.findUnique({
      where: { id: facilityId },
      include: {
        _count: {
          select: {
            reservations: true,
            reports: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Fasilitas tidak ditemukan' }, { status: 404 });
    }

    if (existing._count.reservations > 0 || existing._count.reports > 0) {
      return NextResponse.json(
        {
          error: `Tidak dapat menghapus fasilitas karena masih terkait dengan ${existing._count.reservations} riwayat reservasi dan ${existing._count.reports} laporan kerusakan.`,
        },
        { status: 400 }
      );
    }

    await prisma.facility.delete({
      where: { id: facilityId },
    });

    return NextResponse.json({
      success: true,
      message: 'Fasilitas berhasil dihapus dari database',
    });
  } catch (error: any) {
    console.error('Error deleting facility:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menghapus fasilitas' },
      { status: 500 }
    );
  }
}
