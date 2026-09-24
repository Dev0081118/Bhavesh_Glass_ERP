const bcrypt = require("bcrypt");

const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Default password format:
 * LAST 5 DIGITS OF PHONE + DDMMYYYY
 *
 * Example:
 * phone: +91 98765 43210
 * dob:   2005-06-05
 *
 * result:
 * 4321005062005
 */
const createInitialPassword = (phone, dob) => {
  const phoneDigits = String(phone || "").replace(/\D/g, "");

  if (phoneDigits.length < 5) {
    return null;
  }

  if (!dob) {
    return null;
  }

  const date = new Date(dob);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${phoneDigits.slice(-5)}${day}${month}${year}`;
};

const hashPassword = async (password) =>
  bcrypt.hash(password, BCRYPT_ROUNDS);

const comparePassword = async (plainPassword, hashedPassword) =>
  bcrypt.compare(plainPassword, hashedPassword);

const validatePassword = (password) => {
  if (typeof password !== "string") {
    return {
      valid: false,
      message: "Password is required.",
    };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      message: `Password must contain at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }

  return {
    valid: true,
    message: "",
  };
};

module.exports = {
  BCRYPT_ROUNDS,
  MIN_PASSWORD_LENGTH,
  createInitialPassword,
  hashPassword,
  comparePassword,
  validatePassword,
};