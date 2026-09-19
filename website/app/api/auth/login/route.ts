import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { identifier, password } = body;

    // cari berdasarkan email atau username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: identifier,
          },
          {
            username: identifier,
          },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User tidak ditemukan",
        },
        {
          status: 404,
        },
      );
    }

    // cek password
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return NextResponse.json(
        {
          message: "Password salah",
        },
        {
          status: 401,
        },
      );
    }

    // buat JWT
    const token = await createToken({
      id: user.id,
      role: user.role,
      name: user.name,
      identifier: user.username,
      jenisUser: user.jenisUser,
    });

    const response = NextResponse.json({
      message: "Login berhasil",

      user: {
        name: user.name,
        role: user.role,
        identifier: user.username,
        jenisUser: user.jenisUser,
      },
    });

    // simpan JWT ke cookie
    response.cookies.set("token", token, {
      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      maxAge: 60 * 60 * 24 * 7,

      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        message: "Terjadi kesalahan server",
      },
      {
        status: 500,
      },
    );
  }
}
