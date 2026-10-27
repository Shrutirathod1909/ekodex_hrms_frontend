// ============================================================
// FRONTEND LOGGER UTILITY
// Consistent error/info/warn logging for all pages
// ============================================================

const isProd = import.meta.env.MODE === "production";

const formatMsg = (level, context, args) => {
  const time = new Date().toLocaleTimeString();
  const prefix = `[${time}] [${level}] [${context}]`;
  return { prefix, args };
};

const clientLogger = {
  // ---- INFO ----
  info: (context, ...args) => {
    const { prefix } = formatMsg("INFO", context, args);
    console.info(`%c${prefix}`, "color: #17a2b8; font-weight:bold", ...args);
  },

  // ---- SUCCESS ----
  success: (context, ...args) => {
    const { prefix } = formatMsg("SUCCESS", context, args);
    console.log(`%c${prefix}`, "color: #28a745; font-weight:bold", ...args);
  },

  // ---- WARN ----
  warn: (context, ...args) => {
    const { prefix } = formatMsg("WARN", context, args);
    console.warn(`%c${prefix}`, "color: #ffc107; font-weight:bold", ...args);
  },

  // ---- ERROR ----
  // Logs to console with stack trace.
  // Returns a user-friendly error message string.
  error: (context, err) => {
    const time = new Date().toLocaleTimeString();
    const prefix = `[${time}] [ERROR] [${context}]`;

    // Full technical log for developer
    console.group(`%c${prefix}`, "color:#dc3545; font-weight:bold");
    if (err?.response) {
      console.error("STATUS  :", err.response.status);
      console.error("URL     :", err.response.config?.url);
      console.error("SERVER  :", err.response.data);
    }
    if (err?.message) {
      console.error("MESSAGE :", err.message);
    }
    if (err?.stack && !isProd) {
      console.error("STACK   :", err.stack);
    }
    console.groupEnd();

    // Return clear user-facing message
    if (err?.response?.data?.message) return err.response.data.message;
    if (err?.response?.status === 401) return "Session expired. Please login again.";
    if (err?.response?.status === 403) return "You do not have permission to perform this action.";
    if (err?.response?.status === 404) return "Resource not found.";
    if (err?.response?.status === 500) return "Server error. Please contact support.";
    if (err?.message) return err.message;
    return "An unexpected error occurred.";
  },

  // ---- IMAGE ERROR ----
  // For <img onError> usage
  imgError: (context, src) => {
    const time = new Date().toLocaleTimeString();
    console.warn(
      `%c[${time}] [IMG_ERROR] [${context}]`,
      "color:#e67e22; font-weight:bold",
      `\nFailed to load image: ${src}`
    );
  },
};

export default clientLogger;
