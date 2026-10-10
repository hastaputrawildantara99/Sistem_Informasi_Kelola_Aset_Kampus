import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const { getCurrentUser, findUser, queryRaw, findReservation, updateReservation, transaction } = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  findUser: vi.fn(),
  queryRaw: vi.fn(),
  findReservation: vi.fn(),
  updateReservation: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ getCurrentUser }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: findUser },
    $transaction: transaction,
  },
}));

import { PATCH } from "./route";

const user = { id: 7, role: "USER" };
const reservation = {
  id: 42,
  userId: 7,
  status: "PENDING",
  startTime: new Date("2026-10-20T03:00:00.000Z"),
};
const cancelled = {
  id: 42,
  facilityId: 3,
  startTime: reservation.startTime,
  endTime: new Date("2026-10-20T04:00:00.000Z"),
  purpose: "Rapat",
  status: "CANCELLED",
  cancelledAt: new Date("2026-10-10T00:00:00.000Z"),
  cancellationReason: "Dibatalkan oleh pemilik reservasi.",
  updatedAt: new Date("2026-10-10T00:00:00.000Z"),
};

function requestFor(id: string) {
  return new Request(`http://localhost/api/reservations/${id}/cancel`, { method: "PATCH" });
}

function paramsFor(id: string) {
  return { params: Promise.resolve({ id }) };
}

function configureTransaction(options: { locked?: { id: number }[]; current?: typeof reservation | null } = {}) {
  queryRaw.mockResolvedValue(options.locked ?? [{ id: 42 }]);
  findReservation.mockResolvedValue(options.current === undefined ? reservation : options.current);
  updateReservation.mockResolvedValue(cancelled);
  transaction.mockImplementation(async (callback: (tx: unknown) => Promise<Response>) => callback({
    $queryRaw: queryRaw,
    reservation: { findFirst: findReservation, update: updateReservation },
  }));
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-10T00:00:00.000Z"));
  vi.clearAllMocks();
  getCurrentUser.mockResolvedValue({ id: 7 });
  findUser.mockResolvedValue(user);
  configureTransaction();
});

afterEach(() => vi.useRealTimers());

describe("PATCH /api/reservations/[id]/cancel", () => {
  it("menolak tanpa sesi", async () => {
    getCurrentUser.mockResolvedValue(null);
    const response = await PATCH(requestFor("42"), paramsFor("42"));
    expect(response.status).toBe(401);
    expect(transaction).not.toHaveBeenCalled();
  });

  it("menolak role selain USER", async () => {
    findUser.mockResolvedValue({ id: 7, role: "PETUGAS" });
    const response = await PATCH(requestFor("42"), paramsFor("42"));
    expect(response.status).toBe(403);
    expect(transaction).not.toHaveBeenCalled();
  });

  it("tidak membuka reservasi milik pengguna lain", async () => {
    configureTransaction({ locked: [] });
    const response = await PATCH(requestFor("42"), paramsFor("42"));
    expect(response.status).toBe(404);
    expect(updateReservation).not.toHaveBeenCalled();
  });

  it.each(["0", "-1", "1.5", "abc", "2147483648"])("menolak ID tidak valid %s", async (id) => {
    const response = await PATCH(requestFor(id), paramsFor(id));
    expect(response.status).toBe(400);
    expect(transaction).not.toHaveBeenCalled();
  });

  it("menolak status yang tidak dapat dibatalkan", async () => {
    configureTransaction({ current: { ...reservation, status: "REJECTED" } });
    const response = await PATCH(requestFor("42"), paramsFor("42"));
    expect(response.status).toBe(409);
    expect(updateReservation).not.toHaveBeenCalled();
  });

  it("menolak pembatalan setelah batas 24 jam", async () => {
    vi.setSystemTime(new Date("2026-10-19T03:00:00.001Z"));
    const response = await PATCH(requestFor("42"), paramsFor("42"));
    expect(response.status).toBe(409);
    expect(updateReservation).not.toHaveBeenCalled();
  });

  it("menyimpan pembatalan yang valid", async () => {
    const response = await PATCH(requestFor("42"), paramsFor("42"));
    expect(response.status).toBe(200);
    expect(updateReservation).toHaveBeenCalledWith({
      where: { id: 42 },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date("2026-10-10T00:00:00.000Z"),
        cancellationReason: "Dibatalkan oleh pemilik reservasi.",
      },
      select: expect.objectContaining({ id: true, status: true, cancelledAt: true }),
    });
    expect((await response.json()).data.status).toBe("CANCELLED");
  });
});
