import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getCurrentUser,
  findUser,
  queryRaw,
  findReservation,
  updateReservation,
  transaction,
} = vi.hoisted(() => ({
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

const user = { id: 7, role: "PETUGAS" };
const pendingReservation = { id: 42, status: "PENDING" };
const rejectedReservation = {
  id: 42,
  userId: 11,
  facilityId: 3,
  startTime: new Date("2026-01-10T08:00:00.000Z"),
  endTime: new Date("2026-01-10T10:00:00.000Z"),
  purpose: "Rapat",
  status: "REJECTED",
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

function requestFor(id: string) {
  return new Request(`http://localhost/api/petugas/reservations/${id}`, {
    method: "PATCH",
  });
}

function paramsFor(id: string) {
  return { params: Promise.resolve({ id }) };
}

async function responseBody(response: Response) {
  return response.json();
}

function configureTransaction(options: {
  locked?: { id: number }[];
  reservation?: typeof pendingReservation | null;
} = {}) {
  queryRaw.mockResolvedValue(options.locked ?? [{ id: 42 }]);
  findReservation.mockResolvedValue(
    options.reservation === undefined ? pendingReservation : options.reservation,
  );
  updateReservation.mockResolvedValue(rejectedReservation);
  transaction.mockImplementation(async (callback: (tx: unknown) => Promise<Response>) =>
    callback({
      $queryRaw: queryRaw,
      reservation: {
        findUnique: findReservation,
        update: updateReservation,
      },
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  getCurrentUser.mockResolvedValue({ id: 7 });
  findUser.mockResolvedValue(user);
  configureTransaction();
});

describe("PATCH /api/petugas/reservations/[id]/reject", () => {
  it("returns 401 when there is no authenticated user", async () => {
    getCurrentUser.mockResolvedValue(null);

    const response = await PATCH(requestFor("42"), paramsFor("42"));

    expect(response.status).toBe(401);
    expect(findUser).not.toHaveBeenCalled();
    expect(updateReservation).not.toHaveBeenCalled();
  });

  it("returns 401 when the account no longer exists", async () => {
    findUser.mockResolvedValue(null);

    const response = await PATCH(requestFor("42"), paramsFor("42"));

    expect(response.status).toBe(401);
    expect((await responseBody(response)).message).toContain("Akun tidak ditemukan");
    expect(updateReservation).not.toHaveBeenCalled();
  });

  it("returns 403 for a non-PETUGAS account", async () => {
    findUser.mockResolvedValue({ id: 7, role: "USER" });

    const response = await PATCH(requestFor("42"), paramsFor("42"));

    expect(response.status).toBe(403);
    expect(updateReservation).not.toHaveBeenCalled();
  });

  it.each(["0", "-1", "1.5", "abc", "2147483648"]) (
    "returns 400 for invalid reservation ID %s",
    async (id) => {
      const response = await PATCH(requestFor(id), paramsFor(id));

      expect(response.status).toBe(400);
      expect(transaction).not.toHaveBeenCalled();
      expect(updateReservation).not.toHaveBeenCalled();
    },
  );

  it("returns 404 when the locked reservation does not exist", async () => {
    configureTransaction({ locked: [] });

    const response = await PATCH(requestFor("42"), paramsFor("42"));

    expect(response.status).toBe(404);
    expect(findReservation).not.toHaveBeenCalled();
    expect(updateReservation).not.toHaveBeenCalled();
  });

  it("returns 404 when the reservation disappears before lookup", async () => {
    configureTransaction({ reservation: null });

    const response = await PATCH(requestFor("42"), paramsFor("42"));

    expect(response.status).toBe(404);
    expect(updateReservation).not.toHaveBeenCalled();
  });

  it("returns 409 when the reservation is not PENDING", async () => {
    configureTransaction({ reservation: { id: 42, status: "APPROVED" } });

    const response = await PATCH(requestFor("42"), paramsFor("42"));

    expect(response.status).toBe(409);
    expect(updateReservation).not.toHaveBeenCalled();
  });

  it("rejects a pending reservation successfully", async () => {
    const response = await PATCH(requestFor("42"), paramsFor("42"));

    expect(response.status).toBe(200);
    expect(updateReservation).toHaveBeenCalledWith({
      where: { id: 42 },
      data: { status: "REJECTED" },
      select: expect.objectContaining({ id: true, status: true }),
    });
    expect((await responseBody(response)).data).toEqual({
      ...rejectedReservation,
      startTime: rejectedReservation.startTime.toISOString(),
      endTime: rejectedReservation.endTime.toISOString(),
      updatedAt: rejectedReservation.updatedAt.toISOString(),
    });
  });

  it("returns 409 when the transaction fails with a retryable Prisma error", async () => {
    const error = new Prisma.PrismaClientKnownRequestError("serialization failure", {
      code: "P2034",
      clientVersion: "test",
    });
    transaction.mockRejectedValue(error);

    const response = await PATCH(requestFor("42"), paramsFor("42"));

    expect(response.status).toBe(409);
    expect((await responseBody(response)).message).toContain("Transaksi belum berhasil");
    expect(updateReservation).not.toHaveBeenCalled();
  });
});
