import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("token")?.value;

  /*
    Jika user membuka halaman login
    tetapi sudah memiliki token
  */
  if (pathname === "/login") {
    if (token) {
      try {
        const user: any = await verifyToken(token);

        if (user.role === "ADMIN") {
          return NextResponse.redirect(new URL("/dashboard/admin", req.url));
        }

        if (user.role === "PETUGAS") {
          return NextResponse.redirect(new URL("/dashboard/petugas", req.url));
        }

        return NextResponse.redirect(new URL("/", req.url));
      } catch {
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  }

  /*
    Semua dashboard wajib login
  */
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const user: any = await verifyToken(token);

      const role = user.role;

      /*
        Mapping akses dashboard
      */

      const accessRules = {
        "/dashboard/admin": ["ADMIN", "USER"], // TODO: hapus "USER" setelah testing

        "/dashboard/petugas": ["PETUGAS"],

        "/dashboard/user": ["USER"],
      };

      for (const path in accessRules) {
        if (pathname.startsWith(path)) {
          const allowedRoles = accessRules[path as keyof typeof accessRules];

          if (!allowedRoles.includes(role)) {
            /*
              Redirect sesuai role asli user
            */

            if (role === "ADMIN") {
              return NextResponse.redirect(
                new URL("/dashboard/admin", req.url),
              );
            }

            if (role === "PETUGAS") {
              return NextResponse.redirect(
                new URL("/dashboard/petugas", req.url),
              );
            }

            return NextResponse.redirect(new URL("/", req.url));
          }
        }
      }

      return NextResponse.next();
    } catch (error) {
      const response = NextResponse.redirect(new URL("/login", req.url));

      /*
        Hapus token invalid
      */

      response.cookies.delete("token");

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
