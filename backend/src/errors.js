// Error yang "aman ditampilkan" ke client. Error lain dianggap bug (500).
class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

module.exports = { AppError };
