// Aturan bersama untuk layanan reservasi di server. Tidak mengakses database.
export const OPENING_MINUTES = 7 * 60;
export const CLOSING_MINUTES = 20 * 60;
export const SLOT_MINUTES = 30;
export const CANCELLATION_NOTICE_MS = 24 * 60 * 60 * 1000;

const CAMPUS_OFFSETS = {
  "Asia/Jakarta": "+07:00",
  "Asia/Makassar": "+08:00",
  "Asia/Jayapura": "+09:00",
} as const;

export type CampusTimeZone = keyof typeof CAMPUS_OFFSETS;
export type TimeRange = { startTime: Date; endTime: Date };
export const CAMPUS_TIME_ZONE: CampusTimeZone = "Asia/Jakarta";
export const BLOCKING_RESERVATION_STATUSES = ["APPROVED"] as const;

export type ReservationRuleCode =
  | "INVALID_INPUT"
  | "INVALID_DATE"
  | "INVALID_TIME"
  | "OUTSIDE_OPERATING_HOURS"
  | "INVALID_SLOT"
  | "INVALID_RANGE"
  | "START_NOT_IN_FUTURE"
  | "FORBIDDEN"
  | "NOT_CANCELLABLE"
  | "CANCELLATION_DEADLINE";

export class ReservationRuleError extends Error {
  readonly code: ReservationRuleCode;

  constructor(code: ReservationRuleCode, message: string) {
    super(message);
    this.name = "ReservationRuleError";
    this.code = code;
  }
}

function timestamp(value: Date): number {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new TypeError("Nilai waktu internal harus berupa Date yang valid.");
  }
  return value.getTime();
}

function validateDate(value: unknown): string {
  if (typeof value !== "string" || !/^[1-9]\d{3}-\d{2}-\d{2}$/.test(value)) {
    throw new ReservationRuleError("INVALID_DATE", "Tanggal harus berformat YYYY-MM-DD.");
  }
  const date = new Date(`${value}T00:00:00Z`);
  // Date dapat menormalkan 30 Februari menjadi Maret; tolak normalisasi tersebut.
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new ReservationRuleError("INVALID_DATE", "Tanggal reservasi tidak valid.");
  }
  return value;
}

function timeToMinutes(value: unknown): number {
  // Input API menggunakan HH:mm, sehingga detik/milidetik tidak bisa disisipkan.
  if (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new ReservationRuleError("INVALID_TIME", "Waktu harus berformat HH:mm.");
  }
  const [hour, minute] = value.split(":").map(Number);
  const total = hour * 60 + minute;
  if (total < OPENING_MINUTES || total > CLOSING_MINUTES) {
    throw new ReservationRuleError("OUTSIDE_OPERATING_HOURS", "Jam operasional adalah 07.00–20.00.");
  }
  if (total % SLOT_MINUTES !== 0) {
    throw new ReservationRuleError("INVALID_SLOT", "Waktu harus mengikuti slot 30 menit (menit 00 atau 30).");
  }
  return total;
}

function minutesToTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function toUtc(date: string, minutes: number, timeZone: CampusTimeZone): Date {
  if (!Object.hasOwn(CAMPUS_OFFSETS, timeZone)) {
    throw new TypeError("Zona waktu kampus belum dikonfigurasi dengan benar.");
  }
  return new Date(`${date}T${minutesToTime(minutes)}:00${CAMPUS_OFFSETS[timeZone]}`);
}

/** Zona waktu dipilih server, bukan diambil dari body permintaan pengguna. */
export function validateReservationTime(
  input: unknown,
  timeZone: CampusTimeZone = CAMPUS_TIME_ZONE,
  now: Date = new Date(),
): TimeRange {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new ReservationRuleError("INVALID_INPUT", "Data reservasi harus berupa objek.");
  }
  const fields = input as Record<string, unknown>;
  const date = validateDate(fields.date);
  const startMinutes = timeToMinutes(fields.startTime);
  const endMinutes = timeToMinutes(fields.endTime);

  if (endMinutes <= startMinutes) {
    throw new ReservationRuleError("INVALID_RANGE", "Waktu selesai harus sesudah waktu mulai pada tanggal yang sama.");
  }

  const startTime = toUtc(date, startMinutes, timeZone);
  const endTime = toUtc(date, endMinutes, timeZone);
  if (startTime.getTime() <= timestamp(now)) {
    throw new ReservationRuleError("START_NOT_IN_FUTURE", "Waktu mulai harus berada di masa mendatang.");
  }
  return { startTime, endTime };
}

/** Menghasilkan 26 slot. Ketersediaannya nanti dihitung dari fasilitas/reservasi. */
export function createOperatingSlots(dateInput: unknown, timeZone: CampusTimeZone = CAMPUS_TIME_ZONE) {
  const date = validateDate(dateInput);
  return Array.from({ length: (CLOSING_MINUTES - OPENING_MINUTES) / SLOT_MINUTES }, (_, index) => {
    const start = OPENING_MINUTES + index * SLOT_MINUTES;
    const end = start + SLOT_MINUTES;
    return {
      startLabel: minutesToTime(start),
      endLabel: minutesToTime(end),
      startTime: toUtc(date, start, timeZone),
      endTime: toUtc(date, end, timeZone),
    };
  });
}

/** Kedua rentang harus milik fasilitas yang sama; filter status dilakukan layanan DB. */
export function hasTimeOverlap(existing: TimeRange, requested: TimeRange): boolean {
  const existingStart = timestamp(existing.startTime);
  const existingEnd = timestamp(existing.endTime);
  const requestedStart = timestamp(requested.startTime);
  const requestedEnd = timestamp(requested.endTime);
  if (existingEnd <= existingStart || requestedEnd <= requestedStart) {
    throw new TypeError("Pengecekan bentrok membutuhkan rentang waktu yang valid.");
  }
  // Batas akhir tidak termasuk: 07.00–07.30 boleh diikuti 07.30–08.00.
  return existingStart < requestedEnd && existingEnd > requestedStart;
}

/** Panggil dengan reservasi dari SATU fasilitas. Hasil tidak memuat data pemohon. */
export function getAvailabilitySlots(
  date: unknown,
  facilityStatus: string,
  reservations: readonly (TimeRange & { status: string })[],
  now: Date = new Date(),
) {
  const currentTime = timestamp(now);
  const blocking = reservations.filter((reservation) =>
    BLOCKING_RESERVATION_STATUSES.some((status) => status === reservation.status),
  );
  return createOperatingSlots(date).map((slot) => ({
    ...slot,
    available: facilityStatus === "ACTIVE"
      && slot.startTime.getTime() > currentTime
      && !blocking.some((reservation) => hasTimeOverlap(reservation, slot)),
  }));
}

export function getCancellationDeadline(startTime: Date): Date {
  return new Date(timestamp(startTime) - CANCELLATION_NOTICE_MS);
}

/** actorUserId wajib berasal dari sesi login; now memakai waktu server. */
export function assertUserCanCancel(
  reservation: { userId: number; status: string; startTime: Date },
  actorUserId: number,
  now: Date = new Date(),
): void {
  if (!Number.isSafeInteger(actorUserId) || actorUserId <= 0 || reservation.userId !== actorUserId) {
    throw new ReservationRuleError("FORBIDDEN", "Kamu hanya boleh membatalkan reservasi milik sendiri.");
  }
  if (reservation.status !== "PENDING" && reservation.status !== "APPROVED") {
    throw new ReservationRuleError("NOT_CANCELLABLE", "Status reservasi ini tidak dapat dibatalkan.");
  }
  if (timestamp(now) > getCancellationDeadline(reservation.startTime).getTime()) {
    throw new ReservationRuleError("CANCELLATION_DEADLINE", "Pembatalan paling lambat 24 jam sebelum reservasi dimulai.");
  }
}
