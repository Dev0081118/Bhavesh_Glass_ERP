import {
  useEffect,
  useState,
} from "react";

import {
  FileText,
  Image,
  Package,
  Plus,
  Save,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";

const UNITS = [
  "Piece",
  "Sheet",
  "Pack",
  "Box",
  "Kg",
  "Gram",
  "Meter",
  "Feet",
  "Roll",
];

const defaultForm = {
  name: "",
  sku: "",
  category: "",
  subCategory: "",

  type:
    "Finished Product",

  material: "",

  unit: "Piece",

  conversionEnabled:
    false,

  convertibleUnit:
    "Piece",

  conversionFactor: "",

  conversionDescription:
    "",

  isFrame: false,

  frameWidth: "",
  frameHeight: "",
  frameUnit: "inch",

  dimensionLength: "",
  dimensionWidth: "",
  dimensionHeight: "",
  dimensionUnit: "cm",

  weightValue: "",
  weightUnit: "kg",

  media: [],

  minimumStockLevel:
    "",

  location:
    "Main Warehouse",

  assignedTo: "",

  purchasePrice: "",
  sellingPrice: "",
  wholesalePrice: "",
  gst: "18",
  hsnCode: "",

  openingStock: "",

  description: "",

  status: "Active",
};

const numberOrNull = (
  value
) =>
  value === "" ||
  value === null ||
  value === undefined
    ? null
    : Number(value);

export default function ProductForm({
  product,
  staff = [],
  onClose,
  onSave,
}) {
  const [
    form,
    setForm,
  ] = useState(
    defaultForm
  );

  const [
    fileError,
    setFileError,
  ] = useState("");

  useEffect(() => {
    if (!product) {
      setForm(
        defaultForm
      );

      return;
    }

    const conversion =
      product.conversions?.[0];

    setForm({
      ...defaultForm,

      name:
        product.name || "",

      sku:
        product.sku || "",

      category:
        product.category ||
        "",

      subCategory:
        product.subCategory ||
        "",

      type:
        product.type ||
        "Finished Product",

      material:
        product.material ||
        "",

      unit:
        product.unit ||
        "Piece",

      conversionEnabled:
        Boolean(
          product.conversionEnabled
        ),

      convertibleUnit:
        conversion?.unit ||
        "Piece",

      conversionFactor:
        conversion?.factor ??
        "",

      conversionDescription:
        conversion?.description ||
        "",

      isFrame:
        Boolean(
          product.isFrame
        ),

      frameWidth:
        product.frameSize
          ?.width ?? "",

      frameHeight:
        product.frameSize
          ?.height ?? "",

      frameUnit:
        product.frameSize
          ?.unit ||
        "inch",

      dimensionLength:
        product.dimensions
          ?.length ?? "",

      dimensionWidth:
        product.dimensions
          ?.width ?? "",

      dimensionHeight:
        product.dimensions
          ?.height ?? "",

      dimensionUnit:
        product.dimensions
          ?.unit || "cm",

      weightValue:
        product.weight
          ?.value ?? "",

      weightUnit:
        product.weight
          ?.unit || "kg",

      media:
        product.media || [],

      minimumStockLevel:
        product.minimumStockLevel ??
        "",

      location:
        product.location ||
        "Main Warehouse",

      assignedTo:
        product.assignedTo
          ?._id ||
        product.assignedTo ||
        "",

      purchasePrice:
        product.purchasePrice ??
        "",

      sellingPrice:
        product.sellingPrice ??
        "",

      wholesalePrice:
        product.wholesalePrice ??
        "",

      gst:
        product.gst ?? "18",

      hsnCode:
        product.hsnCode || "",

      description:
        product.description ||
        "",

      status:
        product.status ||
        "Active",

      openingStock: "",
    });
  }, [product]);

  const change = (
    name,
    value
  ) => {
    setForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  };

  const handleInput =
    (event) => {
      const {
        name,
        value,
        type,
        checked,
      } = event.target;

      change(
        name,
        type === "checkbox"
          ? checked
          : value
      );
    };

  const readFile = (
    file
  ) =>
    new Promise(
      (
        resolve,
        reject
      ) => {
        const reader =
          new FileReader();

        reader.onload = () =>
          resolve(
            reader.result
          );

        reader.onerror =
          reject;

        reader.readAsDataURL(
          file
        );
      }
    );

  const handleFiles =
    async (event) => {
      setFileError("");

      const files =
        Array.from(
          event.target.files ||
            []
        );

      const totalExisting =
        form.media.reduce(
          (total, item) =>
            total +
            Math.ceil(
              (
                item.dataUrl
                  ?.length ||
                0
              ) *
                0.75
            ),
          0
        );

      let newTotal =
        totalExisting;

      const newMedia = [];

      for (const file of files) {
        if (
          file.size >
          3 * 1024 * 1024
        ) {
          setFileError(
            `${file.name} is larger than 3 MB.`
          );

          continue;
        }

        newTotal +=
          file.size;

        if (
          newTotal >
          8 * 1024 * 1024
        ) {
          setFileError(
            "Total product files cannot exceed approximately 8 MB."
          );

          break;
        }

        const dataUrl =
          await readFile(
            file
          );

        let mediaType =
          "document";

        if (
          file.type.startsWith(
            "image/"
          )
        ) {
          mediaType =
            "image";
        } else if (
          file.type.startsWith(
            "video/"
          )
        ) {
          mediaType =
            "video";
        }

        newMedia.push({
          type: mediaType,
          fileName:
            file.name,
          mimeType:
            file.type ||
            "application/octet-stream",
          dataUrl,
        });
      }

      setForm(
        (current) => ({
          ...current,

          media: [
            ...current.media,
            ...newMedia,
          ],
        })
      );

      event.target.value =
        "";
    };

  const removeMedia = (
    index
  ) => {
    setForm(
      (current) => ({
        ...current,

        media:
          current.media.filter(
            (_, mediaIndex) =>
              mediaIndex !==
              index
          ),
      })
    );
  };

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.sku.trim() ||
      !form.category.trim()
    ) {
      return;
    }

    if (
      form.conversionEnabled &&
      (!form.convertibleUnit ||
        Number(
          form.conversionFactor
        ) <= 0)
    ) {
      setFileError(
        "Enter a valid conversion factor."
      );

      return;
    }

    if (
      form.isFrame &&
      (!form.frameWidth ||
        !form.frameHeight)
    ) {
      setFileError(
        "Frame width and height are required for frame products."
      );

      return;
    }

    const payload = {
      name:
        form.name.trim(),

      sku:
        form.sku
          .trim()
          .toUpperCase(),

      category:
        form.category.trim(),

      subCategory:
        form.subCategory.trim(),

      type: form.type,

      material:
        form.material.trim(),

      unit: form.unit,

      conversionEnabled:
        form.conversionEnabled,

      conversions:
        form.conversionEnabled
          ? [
              {
                unit:
                  form.convertibleUnit,

                factor:
                  Number(
                    form.conversionFactor
                  ),

                description:
                  form.conversionDescription.trim(),
              },
            ]
          : [],

      isFrame:
        form.isFrame,

      frameSize:
        form.isFrame
          ? {
              width:
                numberOrNull(
                  form.frameWidth
                ),

              height:
                numberOrNull(
                  form.frameHeight
                ),

              unit:
                form.frameUnit,
            }
          : {
              width: null,
              height: null,
              unit:
                form.frameUnit,
            },

      dimensions: {
        length:
          numberOrNull(
            form.dimensionLength
          ),

        width:
          numberOrNull(
            form.dimensionWidth
          ),

        height:
          numberOrNull(
            form.dimensionHeight
          ),

        unit:
          form.dimensionUnit,
      },

      weight: {
        value:
          numberOrNull(
            form.weightValue
          ),

        unit:
          form.weightUnit,
      },

      media:
        form.media,

      minimumStockLevel:
        Number(
          form.minimumStockLevel
        ) || 0,

      location:
        form.location.trim() ||
        "Main Warehouse",

      assignedTo:
        form.assignedTo ||
        null,

      purchasePrice:
        Number(
          form.purchasePrice
        ) || 0,

      sellingPrice:
        Number(
          form.sellingPrice
        ) || 0,

      wholesalePrice:
        Number(
          form.wholesalePrice
        ) || 0,

      gst:
        Number(form.gst) ||
        0,

      hsnCode:
        form.hsnCode.trim(),

      description:
        form.description.trim(),

      status:
        form.status,
    };

    if (!product) {
      payload.openingStock =
        Number(
          form.openingStock
        ) || 0;
    }

    onSave(payload);
  };

  /*
   * Stock is counted in the converted unit whenever the
   * conversion factor is >= 1 (1 Sheet = 50 Piece -> Piece),
   * which is also the unit the minimum stock level uses.
   */
  const minimumStockUnit =
    form.conversionEnabled &&
    form.convertibleUnit &&
    Number(form.conversionFactor) >= 1
      ? form.convertibleUnit
      : form.unit;

  const minimumStockHint =
    minimumStockUnit !== form.unit &&
    Number(form.minimumStockLevel) > 0
      ? `= ${Number(
          (
            Number(
              form.minimumStockLevel
            ) /
            Number(
              form.conversionFactor
            )
          ).toFixed(3)
        ).toLocaleString("en-IN")} ${form.unit}`
      : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Package className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                {product
                  ? "Edit Product"
                  : "Create Product"}
              </h2>

              <p className="text-xs text-slate-500">
                Product master, specification and inventory settings
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="flex-1 overflow-y-auto p-6"
        >
          {fileError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {fileError}
            </div>
          )}

          <div className="space-y-8">
            <Section
              number="01"
              title="Product Information"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Product Name"
                  name="name"
                  value={
                    form.name
                  }
                  onChange={
                    handleInput
                  }
                  required
                />

                <Field
                  label="SKU / Product Code"
                  name="sku"
                  value={
                    form.sku
                  }
                  onChange={
                    handleInput
                  }
                  required
                />

                <Field
                  label="Category"
                  name="category"
                  value={
                    form.category
                  }
                  onChange={
                    handleInput
                  }
                  required
                  placeholder="e.g. Photo Frame, Glass, Metal"
                />

                <Field
                  label="Sub Category"
                  name="subCategory"
                  value={
                    form.subCategory
                  }
                  onChange={
                    handleInput
                  }
                />

                <Select
                  label="Product Type"
                  name="type"
                  value={
                    form.type
                  }
                  onChange={
                    handleInput
                  }
                  options={[
                    "Finished Product",
                    "Raw Material",
                    "Accessory",
                    "Printing Material",
                    "Packaging Material",
                    "Machine",
                  ]}
                />

                <Field
                  label="Material"
                  name="material"
                  value={
                    form.material
                  }
                  onChange={
                    handleInput
                  }
                  placeholder="Glass, MDF, Metal..."
                />
              </div>
            </Section>

            <Section
              number="02"
              title="Unit & Conversion"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  label="Primary Unit"
                  name="unit"
                  value={
                    form.unit
                  }
                  onChange={
                    handleInput
                  }
                  options={
                    UNITS
                  }
                />

                <div className="flex items-end">
                  <label className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4">
                    <input
                      type="checkbox"
                      name="conversionEnabled"
                      checked={
                        form.conversionEnabled
                      }
                      onChange={
                        handleInput
                      }
                    />

                    <span className="text-sm font-medium text-slate-700">
                      Enable unit conversion
                    </span>
                  </label>
                </div>
              </div>

              {form.conversionEnabled && (
                <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Select
                      label="Convertible Unit"
                      name="convertibleUnit"
                      value={
                        form.convertibleUnit
                      }
                      onChange={
                        handleInput
                      }
                      options={
                        UNITS.filter(
                          (unit) =>
                            unit !==
                            form.unit
                        )
                      }
                    />

                    <Field
                      label={`1 ${form.unit} = how many ${form.convertibleUnit}?`}
                      name="conversionFactor"
                      type="number"
                      value={
                        form.conversionFactor
                      }
                      onChange={
                        handleInput
                      }
                    />

                    <Field
                      label="Conversion Note"
                      name="conversionDescription"
                      value={
                        form.conversionDescription
                      }
                      onChange={
                        handleInput
                      }
                      placeholder="e.g. 10 × 10 cut pieces"
                    />
                  </div>

                  {Number(
                    form.conversionFactor
                  ) > 0 && (
                    <p className="mt-3 text-sm font-medium text-indigo-700">
                      1 {form.unit} ={" "}
                      {
                        form.conversionFactor
                      }{" "}
                      {
                        form.convertibleUnit
                      }
                    </p>
                  )}

                  {Number(
                    form.conversionFactor
                  ) > 0 &&
                    (Number(
                      form.conversionFactor
                    ) >= 1 ? (
                      <p className="mt-1 text-xs text-indigo-600">
                        Stock, stock movements and the minimum stock
                        level are all counted in{" "}
                        {
                          form.convertibleUnit
                        }
                        . 10 {form.unit} is stored as{" "}
                        {Number(
                          form.conversionFactor
                        ) * 10}{" "}
                        {
                          form.convertibleUnit
                        }
                        .
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-amber-600">
                        The converted unit is larger than{" "}
                        {form.unit}, so stock stays counted in{" "}
                        {form.unit}.
                      </p>
                    ))}
                </div>
              )}
            </Section>

            <Section
              number="03"
              title="Size & Physical Specification"
            >
              <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  name="isFrame"
                  checked={
                    form.isFrame
                  }
                  onChange={
                    handleInput
                  }
                />

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    This is a frame product
                  </p>

                  <p className="text-xs text-slate-500">
                    Enable searchable frame size information.
                  </p>
                </div>
              </label>

              {form.isFrame && (
                <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-800">
                    Frame Size
                  </p>

                  <div className="grid gap-4 md:grid-cols-3">
                    <Field
                      label="Width"
                      name="frameWidth"
                      type="number"
                      value={
                        form.frameWidth
                      }
                      onChange={
                        handleInput
                      }
                    />

                    <Field
                      label="Height"
                      name="frameHeight"
                      type="number"
                      value={
                        form.frameHeight
                      }
                      onChange={
                        handleInput
                      }
                    />

                    <Select
                      label="Unit"
                      name="frameUnit"
                      value={
                        form.frameUnit
                      }
                      onChange={
                        handleInput
                      }
                      options={[
                        "mm",
                        "cm",
                        "inch",
                        "feet",
                      ]}
                    />
                  </div>
                </div>
              )}

              <p className="mb-3 text-sm font-semibold text-slate-800">
                Physical Dimensions
              </p>

              <div className="grid gap-4 md:grid-cols-4">
                <Field
                  label="Length"
                  name="dimensionLength"
                  type="number"
                  value={
                    form.dimensionLength
                  }
                  onChange={
                    handleInput
                  }
                />

                <Field
                  label="Width"
                  name="dimensionWidth"
                  type="number"
                  value={
                    form.dimensionWidth
                  }
                  onChange={
                    handleInput
                  }
                />

                <Field
                  label="Height"
                  name="dimensionHeight"
                  type="number"
                  value={
                    form.dimensionHeight
                  }
                  onChange={
                    handleInput
                  }
                />

                <Select
                  label="Dimension Unit"
                  name="dimensionUnit"
                  value={
                    form.dimensionUnit
                  }
                  onChange={
                    handleInput
                  }
                  options={[
                    "mm",
                    "cm",
                    "inch",
                    "feet",
                    "meter",
                  ]}
                />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field
                  label="Weight"
                  name="weightValue"
                  type="number"
                  value={
                    form.weightValue
                  }
                  onChange={
                    handleInput
                  }
                />

                <Select
                  label="Weight Unit"
                  name="weightUnit"
                  value={
                    form.weightUnit
                  }
                  onChange={
                    handleInput
                  }
                  options={[
                    "g",
                    "kg",
                    "lb",
                  ]}
                />
              </div>
            </Section>

            <Section
              number="04"
              title="Product Media & Documents"
            >
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 px-6 py-8 hover:border-slate-300 hover:bg-slate-50">
                <Upload className="h-6 w-6 text-slate-400" />

                <p className="mt-2 text-sm font-medium text-slate-700">
                  Upload images, videos or documents
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Maximum 3 MB per file and approximately 8 MB total
                </p>

                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={
                    handleFiles
                  }
                />
              </label>

              {form.media.length >
                0 && (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {form.media.map(
                    (
                      media,
                      index
                    ) => (
                      <div
                        key={`${media.fileName}-${index}`}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                          {media.type ===
                          "image" ? (
                            <Image className="h-5 w-5 text-slate-500" />
                          ) : media.type ===
                            "video" ? (
                            <Video className="h-5 w-5 text-slate-500" />
                          ) : (
                            <FileText className="h-5 w-5 text-slate-500" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-700">
                            {
                              media.fileName
                            }
                          </p>

                          <p className="text-xs capitalize text-slate-400">
                            {
                              media.type
                            }
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeMedia(
                              index
                            )
                          }
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </Section>

            <Section
              number="05"
              title="Inventory Settings"
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Field
                    label={`Minimum Stock Level (${minimumStockUnit})`}
                    name="minimumStockLevel"
                    type="number"
                    value={
                      form.minimumStockLevel
                    }
                    onChange={
                      handleInput
                    }
                  />

                  {minimumStockHint && (
                    <p className="mt-1 text-xs text-slate-400">
                      {
                        minimumStockHint
                      }
                    </p>
                  )}
                </div>

                <Field
                  label="Storage Location"
                  name="location"
                  value={
                    form.location
                  }
                  onChange={
                    handleInput
                  }
                />

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Responsible Staff
                  </label>

                  <select
                    name="assignedTo"
                    value={
                      form.assignedTo
                    }
                    onChange={
                      handleInput
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                  >
                    <option value="">
                      Not assigned
                    </option>

                    {staff.map((user) => (
                          <option
                            key={user.id}
                            value={user.id}
                          >
                            {user.name} — {user.role}
                            {user.department
                              ? ` (${user.department})`
                              : ""}
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              {!product && (
                <div className="mt-4">
                  <Field
                    label={`Opening Stock (${form.unit})`}
                    name="openingStock"
                    type="number"
                    value={
                      form.openingStock
                    }
                    onChange={
                      handleInput
                    }
                    placeholder="Optional"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Opening stock creates the first Inventory
                    transaction.
                    {minimumStockUnit !==
                      form.unit &&
                      Number(
                        form.openingStock
                      ) > 0 &&
                      ` Stored as ${Number(
                        (
                          Number(
                            form.openingStock
                          ) *
                          Number(
                            form.conversionFactor
                          )
                        ).toFixed(3)
                      ).toLocaleString("en-IN")} ${minimumStockUnit}.`}
                  </p>
                </div>
              )}
            </Section>

            <Section
              number="06"
              title="Pricing & Tax"
            >
              <div className="grid gap-4 md:grid-cols-5">
                <Field
                  label="Purchase Price"
                  name="purchasePrice"
                  type="number"
                  value={
                    form.purchasePrice
                  }
                  onChange={
                    handleInput
                  }
                />

                <Field
                  label="Selling Price"
                  name="sellingPrice"
                  type="number"
                  value={
                    form.sellingPrice
                  }
                  onChange={
                    handleInput
                  }
                />

                <Field
                  label="Wholesale Price"
                  name="wholesalePrice"
                  type="number"
                  value={
                    form.wholesalePrice
                  }
                  onChange={
                    handleInput
                  }
                />

                <Field
                  label="GST %"
                  name="gst"
                  type="number"
                  value={
                    form.gst
                  }
                  onChange={
                    handleInput
                  }
                />

                <Field
                  label="HSN Code"
                  name="hsnCode"
                  value={
                    form.hsnCode
                  }
                  onChange={
                    handleInput
                  }
                />
              </div>
            </Section>

            <Section
              number="07"
              title="Description & Status"
            >
              <textarea
                name="description"
                value={
                  form.description
                }
                onChange={
                  handleInput
                }
                rows={4}
                placeholder="Product description, specification or internal information..."
                className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-400"
              />

              <div className="mt-4 max-w-xs">
                <Select
                  label="Status"
                  name="status"
                  value={
                    form.status
                  }
                  onChange={
                    handleInput
                  }
                  options={[
                    "Active",
                    "Inactive",
                  ]}
                />
              </div>
            </Section>
          </div>
        </form>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              handleSubmit
            }
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Save className="h-4 w-4" />

            {product
              ? "Save Changes"
              : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  number,
  title,
  children,
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-bold text-white">
          {number}
        </div>

        <h3 className="text-sm font-semibold text-slate-900">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={
          onChange
        }
        required={
          required
        }
        min={
          type ===
          "number"
            ? 0
            : undefined
        }
        step={
          type ===
          "number"
            ? "any"
            : undefined
        }
        placeholder={
          placeholder
        }
        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </div>
  );
}

function Select({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={
          onChange
        }
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
      >
        {options.map(
          (option) => (
            <option
              key={
                option
              }
              value={
                option
              }
            >
              {option}
            </option>
          )
        )}
      </select>
    </div>
  );
}