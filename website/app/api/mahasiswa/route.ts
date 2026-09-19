import { NextRequest, NextResponse } from "next/server";

const API_URL =
  "https://xg1kctvm70.execute-api.ap-southeast-1.amazonaws.com/mahasiswa_undip";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("query");

    if(!query || query.trim() === "" || query.trim().length === 13) {
      return NextResponse.json(
        {
          message: "NIM harus 14 karakter",
        },
        {
          status: 400,
        },
      );
    }

    if (!query) {
      return NextResponse.json(
        {
          message: "Query wajib diisi",
        },
        {
          status: 400,
        },
      );
    }

    const response = await fetch(`${API_URL}?query=${query}&page=0`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },

      // optional agar tidak cache
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          message: "Gagal mengambil data mahasiswa",
        },
        {
          status: response.status,
        },
      );
    }

    const ress = await response.json();

    const data = {
        "code" : ress.code,
        "message" : ress.message,
        "data" : {
            "name" : ress.payload[0].name,
            "nim" : ress.payload[0].nim_jur,
            "prodi" : ress.payload[0].prodi,
            "status" : ress.payload[0].status,
            "jenis_kelamin" : ress.payload[0].jenis_kelamin,
            "jenjang" : ress.payload[0].jenjang,
        }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
