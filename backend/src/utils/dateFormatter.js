const pad = (n) => String(n).padStart(2, "0");

const parseDateParts = (dateValue) => {
  if (!dateValue) return null;

  let str = dateValue.trim();

  // DD/MM/YYYY or DD-MM-YYYY (with optional time)
  let m = str.match(
    /^(\d{2})[\/-](\d{2})[\/-](\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (m) {
    const [, day, month, year, hh, mm, ss] = m;
    return {
      year,
      month,
      day,
      hour: hh || "00",
      minute: mm || "00",
      second: ss || "00",
    };
  }

  // YYYY/MM/DD or YYYY-MM-DD (with optional time)
  m = str.match(
    /^(\d{4})[\/-](\d{2})[\/-](\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (m) {
    const [, year, month, day, hh, mm, ss] = m;
    return {
      year,
      month,
      day,
      hour: hh || "00",
      minute: mm || "00",
      second: ss || "00",
    };
  }

  // ISO 8601: YYYY-MM-DDTHH:mm:ss.sssZ or with timezone offset
  m = str.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/
  );
  if (m) {
    const [, year, month, day, hh, mm, ss] = m;
    return {
      year,
      month,
      day,
      hour: hh || "00",
      minute: mm || "00",
      second: ss || "00",
    };
  }

  return null;
};

export const formatCreatedAt = (dateValue) => {
  const parts = parseDateParts(dateValue);
  if (!parts) return dateValue;

  const { year, month, day, hour, minute, second } = parts;

  // Return as "YYYY-MM-DD HH:mm:ss" (local time preserved, no timezone shift)
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};