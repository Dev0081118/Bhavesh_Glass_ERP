const normalizePhone = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  let digits = String(value).replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  /*
   * Indian mobile numbers:
   *
   * 9904099441       -> 919904099441
   * 09904099441      -> 919904099441
   * 919904099441     -> 919904099441
   * +91 9904099441   -> 919904099441
   */
  if (
    digits.length === 11 &&
    digits.startsWith("0")
  ) {
    digits = digits.slice(1);
  }

  if (digits.length === 10) {
    digits = `91${digits}`;
  }

  /*
   * E.164 numbers are max 15 digits.
   * We keep international numbers intact.
   */
  if (
    digits.length < 10 ||
    digits.length > 15
  ) {
    return "";
  }

  return digits;
};

const isValidPhone = (value) => {
  return Boolean(normalizePhone(value));
};

module.exports = {
  normalizePhone,
  isValidPhone,
};