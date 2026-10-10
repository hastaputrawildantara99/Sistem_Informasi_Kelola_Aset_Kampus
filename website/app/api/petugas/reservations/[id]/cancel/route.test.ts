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

const petugas = { id: 7, role: "PETUGAS" };
const approvedReservation = { id: 42, status: "APPROVED" };
const cancelledReservation = {
  id: 42,
  status: "CANCELLED",
  cancelledAt: new Date("2026-10-10T00:00:00.000Z"),
  cancellationReason: "Fasilitas harus dikosongkan.",
  updatedAt: new Date("2026-10-10T00:00:00.000Z"),
};

function requestFor(id: string, body: unknown = { reason: "Fasilitas harus dikosongkan." }) {
  return new Request(`http://localhost/api/petugas/reservations/${id}/cancel`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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
  reservation?: typeof approvedReservation | null;
} = {}) {
  queryRaw.mockResolvedValue(options.locked ?? [{ id: 42 }]);
  findReservation.mockResolvedValue(
    options.reservation === undefined ? approvedReservation : options.reservation,
  );
  updateReservation.mockResolvedValue(cancelledReservation);
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
  findUser.mockResolvedValue(petugas);
  configureTransaction();
});

describe("PATCH /api/petugas/reservations/[id]/cancel", () => {
  it("returns 401 without a session", async () => {
    getCurrentUser.mockResolvedValue(null);
    const response = await PATCH(requestFor("42"), paramsFor("42"));
    expect(response.status).toBe(401);
    expect(transaction).not.toHaveBeenCalled();
  });

  it("returns 403 for a non-PETUGAS account", async () => {
    findUser.mockResolvedValue({ id: 7, role: "USER" });
    const response = await PATCH(requestFor("42"), paramsFor("42"));
    expect(response.status).toBe(403);
    expect(transaction).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid ID or empty reason", async () => {
    const invalidId = await PATCH(requestFor("abc"), paramsFor("abc"));
    expect(invalidId.status).toBe(400);
    expect(transaction).not.toHaveBeenCalled();

    const emptyReason = await PATCH(requestFor("42", { reason: "  " }), paramsFor("42"));
    expect(emptyReason.status).toBe(400);
    expect(transaction).not.toHaveBeenCalled();
  });

  it("returns 404 when the reservation does not exist", async () => {
    configureTransaction({ locked: [] });
    const response = await PATCH(requestFor("42"), paramsFor("42"));
    expect(response.status).toBe(404);
    expect(updateReservation).not.toHaveBeenCalled();
  });

  it("returns 409 when the reservation is not APPROVED", async () => {
    configureTransaction({ reservation: { id: 42, status: "PENDING" } });
    const response = await PATCH(requestFor("42"), paramsFor("42"));
    expect(response.status).toBe(409);
    expect(updateReservation).not.toHaveBeenCalled();
  });

  it("cancels an approved reservation with the supplied reason", async () => {
    const response = await PATCH(
      requestFor("42", { reason: "  Fasilitas harus dikosongkan.  " }),
      paramsFor("42"),
    );

    expect(response.status).toBe(200);
    expect(updateReservation).toHaveBeenCalledWith({
      where: { id: 42 },
      data: {
        status: "CANCELLED",
        cancelledAt: expect.any(Date),
        cancellationReason: "Fasilitas harus dikosongkan.",
      },
      select: expect.objectContaining({ id: true, status: true }),
    });
    expect((await responseBody(response)).data.status).toBe("CANCELLED");
  });

  it("returns 409 when the transaction fails with a retryable Prisma error", async () => {
    transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("serialization failure", {
        code: "P2034",
        clientVersion: "test",
      }),
    );

    const response = await PATCH(requestFor("42"), paramsFor("42"));
    expect(response.status).toBe(409);
    expect((await responseBody(response)).message).toContain("Transaksi belum berhasil");
  });
});
