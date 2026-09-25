import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ReservationRuleError,
  assertUserCanCancel,
  createOperatingSlots,
  getAvailabilitySlots,
  getCancellationDeadline,
  hasTimeOverlap,
  validateReservationTime,
} from "../lib/reservations/rules.ts";

const now = new Date("2026-09-23T00:00:00Z");
const validInput = { date: "2026-09-25", startTime: "07:00", endTime: "07:30" };
const validate = (input) => validateReservationTime(input, "Asia/Jakarta", now);
const errorCode = (code) => (error) => error instanceof ReservationRuleError && error.code === code;

test("satu slot mulai pukul 07.00 WIB disimpan sebagai UTC", () => {
  const range = validate(validInput);
  assert.equal(range.startTime.toISOString(), "2026-09-25T00:00:00.000Z");
  assert.equal(range.endTime.toISOString(), "2026-09-25T00:30:00.000Z");
});

test("reservasi boleh mencakup beberapa slot dan selesai tepat pukul 20.00", () => {
  const range = validate({ ...validInput, endTime: "20:00" });
  assert.equal(range.endTime.toISOString(), "2026-09-25T13:00:00.000Z");
});

for (const [zone, expected] of [
  ["Asia/Jakarta", "2026-09-25T00:00:00.000Z"],
  ["Asia/Makassar", "2026-09-24T23:00:00.000Z"],
  ["Asia/Jayapura", "2026-09-24T22:00:00.000Z"],
]) {
  test(`konversi zona ${zone} tidak bergantung zona waktu komputer`, () => {
    assert.equal(validateReservationTime(validInput, zone, now).startTime.toISOString(), expected);
  });
}

for (const input of [null, [], "2026-09-25", 7]) {
  test(`menolak body bukan objek: ${JSON.stringify(input)}`, () => {
    assert.throws(() => validate(input), errorCode("INVALID_INPUT"));
  });
}

for (const date of [undefined, 20260925, "2026-02-29", "2026-02-30", "2026-13-01", "2026-04-31", "25-09-2026", "2026-9-25", "2026-09-25T00:00:00Z"]) {
  test(`menolak tanggal tidak valid: ${date}`, () => {
    assert.throws(() => validate({ ...validInput, date }), errorCode("INVALID_DATE"));
  });
}

test("menerima 29 Februari pada tahun kabisat", () => {
  assert.doesNotThrow(() => validate({ ...validInput, date: "2028-02-29" }));
});

for (const time of [undefined, 7, "7:00", "24:00", "07:60", "07:00:01", "07:00:00.001", "07:00+07:00"]) {
  test(`menolak format waktu tidak valid pada kedua batas: ${time}`, () => {
    for (const field of ["startTime", "endTime"]) {
      assert.throws(() => validate({ ...validInput, [field]: time }), errorCode("INVALID_TIME"));
    }
  });
}

for (const time of ["06:30", "20:30", "00:00"]) {
  test(`menolak waktu di luar operasional: ${time}`, () => {
    for (const field of ["startTime", "endTime"]) {
      assert.throws(() => validate({ ...validInput, [field]: time }), errorCode("OUTSIDE_OPERATING_HOURS"));
    }
  });
}

for (const time of ["07:01", "07:15", "19:45"]) {
  test(`menolak waktu bukan kelipatan slot: ${time}`, () => {
    for (const field of ["startTime", "endTime"]) {
      assert.throws(() => validate({ ...validInput, [field]: time }), errorCode("INVALID_SLOT"));
    }
  });
}

for (const [startTime, endTime] of [["07:30", "07:00"], ["07:00", "07:00"], ["20:00", "20:00"], ["19:00", "07:00"]]) {
  test(`menolak rentang kosong/terbalik/lintas malam: ${startTime}–${endTime}`, () => {
    assert.throws(() => validate({ ...validInput, startTime, endTime }), errorCode("INVALID_RANGE"));
  });
}

test("waktu mulai yang sudah lewat atau tepat saat ini ditolak", () => {
  for (const date of ["2026-09-22", "2026-09-23"]) {
    assert.throws(() => validate({ ...validInput, date }), errorCode("START_NOT_IN_FUTURE"));
  }
  assert.doesNotThrow(() => validate({ ...validInput, date: "2026-09-23", startTime: "07:30", endTime: "08:00" }));
});

test("satu hari memiliki 26 slot berurutan, masing-masing 30 menit", () => {
  const slots = createOperatingSlots("2026-09-25", "Asia/Jakarta");
  assert.equal(slots.length, 26);
  assert.equal(slots[0].startLabel, "07:00");
  assert.equal(slots.at(-1).endLabel, "20:00");
  slots.forEach((slot, index) => {
    assert.equal(slot.endTime.getTime() - slot.startTime.getTime(), 30 * 60 * 1000);
    if (index > 0) assert.equal(slot.startTime.getTime(), slots[index - 1].endTime.getTime());
  });
});

test("generator slot menolak tanggal yang dinormalisasi JavaScript", () => {
  assert.throws(() => createOperatingSlots("2026-02-30", "Asia/Jakarta"), errorCode("INVALID_DATE"));
});

const existing = validate({ ...validInput, startTime: "09:00", endTime: "10:00" });
for (const [startTime, endTime, expected] of [
  ["08:00", "08:30", false],
  ["08:30", "09:00", false],
  ["10:00", "10:30", false],
  ["10:30", "11:00", false],
  ["08:30", "09:30", true],
  ["09:30", "10:30", true],
  ["09:00", "10:00", true],
  ["08:00", "11:00", true],
  ["09:00", "09:30", true],
]) {
  test(`bentrok dengan 09.00–10.00: ${startTime}–${endTime} = ${expected}`, () => {
    const requested = validate({ ...validInput, startTime, endTime });
    assert.equal(hasTimeOverlap(existing, requested), expected);
    assert.equal(hasTimeOverlap(requested, existing), expected);
  });
}

test("jam sama pada tanggal berbeda tidak bentrok", () => {
  const requested = validate({ ...validInput, date: "2026-09-26", startTime: "09:00", endTime: "10:00" });
  assert.equal(hasTimeOverlap(existing, requested), false);
});

test("hanya APPROVED memblokir slot; PENDING tetap dapat mengantre", () => {
  for (const status of ["PENDING", "REJECTED", "CANCELLED", "APPROVED"]) {
    const slots = getAvailabilitySlots("2026-09-25", "ACTIVE", [{ ...existing, status }], now);
    const unavailable = slots.filter((slot) => !slot.available).map((slot) => slot.startLabel);
    assert.deepEqual(unavailable, status === "APPROVED" ? ["09:00", "09:30"] : []);
  }
});

test("fasilitas dalam perbaikan atau nonaktif tidak memiliki slot tersedia", () => {
  for (const status of ["MAINTENANCE", "INACTIVE"]) {
    const slots = getAvailabilitySlots("2026-09-25", status, [], now);
    assert.equal(slots.length, 26);
    assert.ok(slots.every((slot) => !slot.available));
  }
});

test("slot yang sudah mulai tidak tersedia untuk pengajuan baru", () => {
  const slots = getAvailabilitySlots("2026-09-25", "ACTIVE", [], new Date("2026-09-25T00:30:00Z"));
  assert.deepEqual(slots.filter((slot) => !slot.available).map((slot) => slot.startLabel), ["07:00", "07:30"]);
});

test("hasil ketersediaan tidak membocorkan detail reservasi", () => {
  const slots = getAvailabilitySlots("2026-09-25", "ACTIVE", [{
    ...existing, status: "APPROVED", userId: 123, purpose: "Tujuan rahasia", user: { name: "Pemohon" },
  }], now);
  for (const slot of slots) {
    assert.deepEqual(Object.keys(slot).sort(), ["available", "endLabel", "endTime", "startLabel", "startTime"]);
  }
});

const reservation = { userId: 1, status: "PENDING", startTime: new Date("2026-09-25T03:00:00Z") };
const deadline = new Date("2026-09-24T03:00:00Z");

test("batas pembatalan tepat 24 jam sebelum mulai", () => {
  assert.equal(getCancellationDeadline(reservation.startTime).getTime(), deadline.getTime());
  for (const status of ["PENDING", "APPROVED"]) {
    for (const milliseconds of [-1, 0]) {
      assert.doesNotThrow(() => assertUserCanCancel({ ...reservation, status }, 1, new Date(deadline.getTime() + milliseconds)));
    }
  }
});

test("pembatalan satu milidetik setelah batas dan setelah mulai ditolak", () => {
  for (const value of [new Date(deadline.getTime() + 1), reservation.startTime]) {
    assert.throws(() => assertUserCanCancel(reservation, 1, value), errorCode("CANCELLATION_DEADLINE"));
  }
});

test("pengguna tidak dapat membatalkan reservasi orang lain", () => {
  assert.throws(() => assertUserCanCancel(reservation, 2, now), errorCode("FORBIDDEN"));
});

test("reservasi yang sudah ditolak atau dibatalkan tidak dapat dibatalkan lagi", () => {
  for (const status of ["REJECTED", "CANCELLED", "UNKNOWN"]) {
    assert.throws(() => assertUserCanCancel({ ...reservation, status }, 1, now), errorCode("NOT_CANCELLABLE"));
  }
});

test("Date internal tidak valid tidak boleh lolos sebagai tidak bentrok/boleh dibatalkan", () => {
  assert.throws(() => hasTimeOverlap(existing, { ...existing, startTime: new Date("invalid") }), TypeError);
  assert.throws(() => hasTimeOverlap(existing, { startTime: existing.endTime, endTime: existing.startTime }), TypeError);
  assert.throws(() => assertUserCanCancel(reservation, 1, new Date("invalid")), TypeError);
  assert.throws(() => validateReservationTime(validInput, "Asia/Jakarta", new Date("invalid")), TypeError);
});
