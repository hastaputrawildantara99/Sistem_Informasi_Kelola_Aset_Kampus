import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUser, findUser, findUnique, update } = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  findUser: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ getCurrentUser }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: findUser },
    facility: { findUnique, update },
  },
}));

import { PATCH } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/petugas/facilities/3", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function params(id = "3") {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  getCurrentUser.mockResolvedValue({ id: 7 });
  findUser.mockResolvedValue({ role: "PETUGAS" });
  findUnique.mockResolvedValue({ id: 3 });
  update.mockResolvedValue({ id: 3, status: "MAINTENANCE" });
});

describe("PATCH /api/petugas/facilities/[id]", () => {
  it("menolak tanpa sesi", async () => {
    getCurrentUser.mockResolvedValue(null);
    expect((await PATCH(request({ status: "MAINTENANCE" }), params())).status).toBe(401);
  });

  it("menolak role yang salah", async () => {
    findUser.mockResolvedValue({ role: "USER" });
    expect((await PATCH(request({ status: "MAINTENANCE" }), params())).status).toBe(403);
  });

  it("menolak status yang tidak valid", async () => {
    expect((await PATCH(request({ status: "INACTIVE" }), params())).status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it("mengembalikan 404 untuk fasilitas yang tidak ada", async () => {
    findUnique.mockResolvedValue(null);
    expect((await PATCH(request({ status: "MAINTENANCE" }), params())).status).toBe(404);
    expect(update).not.toHaveBeenCalled();
  });

  it("menyimpan status fasilitas yang valid", async () => {
    const response = await PATCH(request({ status: "MAINTENANCE" }), params());
    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { status: "MAINTENANCE" },
      select: { id: true, status: true },
    });
  });
});
