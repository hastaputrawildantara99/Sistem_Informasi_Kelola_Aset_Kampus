import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUser, findUser, findMany, findUnique, updateMany } = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  findUser: vi.fn(),
  findMany: vi.fn(),
  findUnique: vi.fn(),
  updateMany: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ getCurrentUser }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: findUser },
    report: { findMany, findUnique, updateMany },
  },
}));

import { GET, PATCH } from "./route";

function patchRequest(body: unknown) {
  return new Request("http://localhost/api/petugas/reports", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  getCurrentUser.mockResolvedValue({ id: 7 });
  findUser.mockResolvedValue({ role: "PETUGAS" });
  findMany.mockResolvedValue([]);
  findUnique.mockResolvedValue({ status: "PENDING" });
  updateMany.mockResolvedValue({ count: 1 });
});

describe("/api/petugas/reports", () => {
  it("menolak GET tanpa sesi", async () => {
    getCurrentUser.mockResolvedValue(null);
    expect((await GET()).status).toBe(401);
    expect(findMany).not.toHaveBeenCalled();
  });

  it("menolak PATCH untuk role yang salah", async () => {
    findUser.mockResolvedValue({ role: "USER" });
    expect((await PATCH(patchRequest({ id: 1, status: "IN_PROGRESS" }))).status).toBe(403);
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("mengambil daftar laporan dari database", async () => {
    findMany.mockResolvedValue([{ id: 1, status: "PENDING" }]);
    const response = await GET();
    expect(response.status).toBe(200);
    expect((await response.json()).data).toEqual([{ id: 1, status: "PENDING" }]);
  });

  it("menolak status yang tidak ada di enum", async () => {
    const response = await PATCH(patchRequest({ id: 1, status: "DITOLAK" }));
    expect(response.status).toBe(400);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("menolak body JSON yang rusak", async () => {
    const response = await PATCH(new Request("http://localhost/api/petugas/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: "{",
    }));
    expect(response.status).toBe(400);
  });

  it("mewajibkan catatan saat laporan diselesaikan", async () => {
    findUnique.mockResolvedValue({ status: "IN_PROGRESS" });
    const response = await PATCH(patchRequest({ id: 1, status: "RESOLVED" }));
    expect(response.status).toBe(400);
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("menyimpan transisi PENDING ke IN_PROGRESS", async () => {
    findUnique
      .mockResolvedValueOnce({ status: "PENDING" })
      .mockResolvedValueOnce({ id: 1, status: "IN_PROGRESS", notes: null });
    const response = await PATCH(patchRequest({ id: 1, status: "IN_PROGRESS" }));
    expect(response.status).toBe(200);
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 1, status: "PENDING" },
      data: { status: "IN_PROGRESS" },
    });
  });

  it("menolak update jika status berubah bersamaan", async () => {
    updateMany.mockResolvedValue({ count: 0 });
    const response = await PATCH(patchRequest({ id: 1, status: "IN_PROGRESS" }));
    expect(response.status).toBe(409);
  });
});
