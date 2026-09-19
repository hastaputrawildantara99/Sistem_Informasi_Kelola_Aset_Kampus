import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, username, password, jenisUser } = body;

    if (!name || !email || !username || !password || !jenisUser) {
      return NextResponse.json(
        {
          message: "Data belum lengkap",
        },
        {
          status: 400,
        },
      );
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email,
          },
          {
            username,
          },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          message: "Email atau NIM/NIP sudah digunakan",
        },
        {
          status: 400,
        },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,

        email,

        username,

        password: hashedPassword,

        role: "USER",

        jenisUser,
      },
    });

    /*
      Membuat profile sesuai civitas
    */

    if (jenisUser === "MAHASISWA") {
      await prisma.mahasiswa.create({
        data: {
          nim: username,

          userId: user.id,
        },
      });
    }

    if (jenisUser === "DOSEN") {
      await prisma.dosen.create({
        data: {
          nip: username,

          userId: user.id,
        },
      });
    }

    if (jenisUser === "STAF") {
      await prisma.staf.create({
        data: {
          nip: username,

          userId: user.id,
        },
      });
    }

    return NextResponse.json(
      {
        message: "Register berhasil",

        user: {
          id: user.id,

          name: user.name,

          role: user.role,

          jenisUser: user.jenisUser,
        },
      },

      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan server",
        error: String(error),
      },
      {
        status: 500,
      },
    );
  }
}
