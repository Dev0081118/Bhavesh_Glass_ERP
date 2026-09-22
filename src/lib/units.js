/*
 * UNIT CONVERSION HELPERS
 *
 * Primary Unit = the unit a product is bought / created in
 *                (Product.unit, e.g. Sheet)
 * Convertible  = the unit inside Product.conversions
 *                (1 Sheet = 50 Piece -> Piece)
 * Stock Unit   = the unit Inventory counts in. Whenever unit
 *                conversion is enabled the convertible unit
 *                becomes the stock unit, so stock and the
 *                minimum stock level always share one unit.
 */

export const getConversion = (product) =>
  (product?.conversions || [])[0] || null;

export const getEntryUnit = (product) =>
  product?.entryUnit ||
  product?.unit ||
  "Piece";

export const getStockUnit = (product) => {
  const entryUnit = getEntryUnit(product);

  const conversion = getConversion(product);

  if (conversion) {
    const factor = Number(conversion.factor);

    const convertibleUnit = String(
      conversion.unit || ""
    );

    const canPromote =
      Boolean(product?.conversionEnabled) &&
      Boolean(convertibleUnit) &&
      Number.isFinite(factor) &&
      factor >= 1 &&
      convertibleUnit.toLowerCase() !==
        String(entryUnit).toLowerCase();

    if (canPromote) {
      return convertibleUnit;
    }
  }

  /*
   * Fall back to the unit the server already persisted.
   */
  return product?.stockUnit || entryUnit;
};

/*
 * Rate of every unit against the Primary Unit.
 * Primary Unit -> 1, Convertible Unit -> its factor.
 */
export const getUnitRates = (product) => {
  const rates = {};

  const entryUnit = String(
    getEntryUnit(product)
  ).toLowerCase();

  if (entryUnit) {
    rates[entryUnit] = 1;
  }

  (product?.conversions || []).forEach(
    (conversion) => {
      const unit = String(
        conversion?.unit || ""
      ).toLowerCase();

      const factor = Number(conversion?.factor);

      if (
        unit &&
        Number.isFinite(factor) &&
        factor > 0
      ) {
        rates[unit] = factor;
      }
    }
  );

  return rates;
};

/*
 * How many stock units 1 Primary Unit is worth.
 */
export const getStockRate = (product) => {
  const stored = Number(product?.stockFactor);

  if (Number.isFinite(stored) && stored > 0) {
    return stored;
  }

  return (
    getUnitRates(product)[
      String(getStockUnit(product)).toLowerCase()
    ] || 1
  );
};

/*
 * Any typed quantity -> stock unit.
 * 1 Sheet (rate 1) -> 1 / 1 * 50 = 50 Piece
 * 50 Piece (rate 50) -> 50 / 50 * 50 = 50 Piece
 */
export const toStockQuantity = (
  quantity,
  product,
  unit
) => {
  const value = Number(quantity);

  if (!Number.isFinite(value)) {
    return 0;
  }

  const target = String(
    unit ||
      getEntryUnit(product)
  ).toLowerCase();

  const rate = getUnitRates(product)[target];

  if (!rate) {
    return value;
  }

  return (
    (value / rate) * getStockRate(product)
  );
};

/*
 * Stock unit -> Primary Unit (500 Piece -> 10 Sheet).
 */
export const toEntryQuantity = (
  quantity,
  product
) => {
  const value = Number(quantity);

  if (!Number.isFinite(value)) {
    return 0;
  }

  return value / getStockRate(product);
};

export const formatQuantity = (value) =>
  Number(Number(value || 0).toFixed(3)).toLocaleString(
    "en-IN"
  );
