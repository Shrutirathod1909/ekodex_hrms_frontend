import React from "react";

// Parses SQL Server date strings which can come in multiple formats:
// 1. "2026-07-14 12:20 36"   (ISO-like but seconds separated by space)
// 2. "2026-07-18 11:27:43"   (standard ISO with T or space)
// 3. "Jul 18 2026  5:43AM"   (SQL Server default datetime display)
const parseSqlDate = (str) => {
  if (!str) return null;
  const s = String(str).trim();

  // Format 1 & 2: starts with YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    // Replace space with T for ISO, then fix space-separated seconds
    // "2026-07-14 12:20 36" -> "2026-07-14T12:20:36"
    // "2026-07-18 11:27:43" -> "2026-07-18T11:27:43"
    let iso = s.replace(" ", "T");
    // Fix "T12:20 36" -> "T12:20:36"
    iso = iso.replace(/T(\d{2}:\d{2}) (\d{2})$/, "T$1:$2");
    const d = new Date(iso);
    return isNaN(d) ? null : d;
  }

  // Format 3: "Jul 18 2026  5:43AM" or "Jul 18 2026 11:17AM"
  const monthMap = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const m = s.match(/^([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})\s+(\d{1,2}):(\d{2})(AM|PM)$/i);
  if (m) {
    const mon = monthMap[m[1]];
    if (mon === undefined) return null;
    let hr = parseInt(m[4], 10);
    const min = parseInt(m[5], 10);
    const ampm = m[6].toUpperCase();
    if (ampm === "AM" && hr === 12) hr = 0;
    if (ampm === "PM" && hr !== 12) hr += 12;
    return new Date(parseInt(m[3], 10), mon, parseInt(m[2], 10), hr, min, 0);
  }

  // Format 4: "23-07-2026 10:14:52" (DD-MM-YYYY)
  const ddmmyyyy = s.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (ddmmyyyy) {
    const day = parseInt(ddmmyyyy[1], 10);
    const month = parseInt(ddmmyyyy[2], 10) - 1;
    const year = parseInt(ddmmyyyy[3], 10);
    const hr = ddmmyyyy[4] ? parseInt(ddmmyyyy[4], 10) : 0;
    const min = ddmmyyyy[5] ? parseInt(ddmmyyyy[5], 10) : 0;
    const sec = ddmmyyyy[6] ? parseInt(ddmmyyyy[6], 10) : 0;
    return new Date(year, month, day, hr, min, sec);
  }

  // Fallback: try native JS parse
  const d = new Date(s);
  return isNaN(d) ? null : d;
};

export const formatAuditDate = (dateString, byName) => {
  const date = parseSqlDate(dateString);
  if (!date) return null;

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const HH = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");

  const formattedDate = `${yyyy}-${mm}-${dd} ${HH}-${min}-${ss}`;

  if (byName !== undefined && byName !== null) {
    const nameStr = String(byName).trim();
    if (nameStr !== "") {
      return `${formattedDate} (${nameStr})`;
    }
  }
  return formattedDate;
};

const AuditTrail = ({
  createdOn,
  createdByName,
  modifiedOn,
  modifiedByName,
  disabledOn,
  disabledByName,
  isActive, // true = Active tab (hide D:), false = Inactive tab (show D:)
}) => {
  const createdStr = formatAuditDate(createdOn, createdByName);
  const modifiedStr = formatAuditDate(modifiedOn, modifiedByName);
  const disabledStr = formatAuditDate(disabledOn, disabledByName);

  return (
    <div
      style={{
        fontSize: "9.5px",
        lineHeight: "1.4",
        color: "#6c757d",
        whiteSpace: "nowrap",
      }}
    >
      {createdStr && (
        <div>
          <span style={{ fontWeight: 600 }}>C:</span> {createdStr}
        </div>
      )}
      {modifiedStr && (
        <div style={{ marginTop: "2px" }}>
          <span style={{ fontWeight: 600 }}>M:</span> {modifiedStr}
        </div>
      )}
      {isActive === false && disabledStr && (
        <div style={{ marginTop: "2px" }}>
          <span style={{ fontWeight: 600, color: "#dc3545" }}>D:</span>{" "}
          {disabledStr}
        </div>
      )}
    </div>
  );
};

export default AuditTrail;
