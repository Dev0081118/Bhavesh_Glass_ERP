import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  Image as ImageIcon,
  MessageCircle,
  Package,
  Search,
  Send,
  Users,
} from "lucide-react";

import {
  getWhatsAppCustomers,
  getWhatsAppProducts,
  getWhatsAppShareHistory,
  shareProductsOnWhatsApp,
} from "../../lib/api";

import {
  useToast,
} from "../../components/ToastProvider";

export default function WhatsAppAI({
  token,
}) {
  const { showToast } =
    useToast();

  const [
    customers,
    setCustomers,
  ] = useState([]);

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    shares,
    setShares,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    sharing,
    setSharing,
  ] = useState(false);

  const [
    customerSearch,
    setCustomerSearch,
  ] = useState("");

  const [
    productSearch,
    setProductSearch,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("All");

  const [
    selectedCustomers,
    setSelectedCustomers,
  ] = useState([]);

  const [
    selectedProducts,
    setSelectedProducts,
  ] = useState([]);

  const loadAll =
    async () => {
      try {
        setLoading(true);

        const [
          customerResult,
          productResult,
          historyResult,
        ] =
          await Promise.all([
            getWhatsAppCustomers(
              token
            ),

            getWhatsAppProducts(
              token
            ),

            getWhatsAppShareHistory(
              token
            ),
          ]);

        setCustomers(
          customerResult.data ||
            []
        );

        setProducts(
          productResult.data ||
            []
        );

        setShares(
          historyResult.data ||
            []
        );
      } catch (error) {
        showToast(
          "error",
          "Unable to load WhatsApp AI",
          error.message
        );
      } finally {
        setLoading(false);
      }
    };

  const reloadHistory =
    async () => {
      try {
        const result =
          await getWhatsAppShareHistory(
            token
          );

        setShares(
          result.data || []
        );
      } catch {
        // Main action succeeded.
        // History refresh failure
        // does not need another error toast.
      }
    };

  useEffect(() => {
    if (token) {
      loadAll();
    }
  }, [token]);

  const filteredCustomers =
    useMemo(() => {
      const query =
        customerSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return customers;
      }

      return customers.filter(
        (customer) =>
          [
            customer.name,
            customer.companyName,
            customer.phone,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query)
      );
    }, [
      customers,
      customerSearch,
    ]);

  const categories =
    useMemo(
      () => [
        ...new Set(
          products
            .map(
              (product) =>
                product.category
            )
            .filter(Boolean)
        ),
      ],
      [products]
    );

  const filteredProducts =
    useMemo(() => {
      const query =
        productSearch
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {
          const matchesSearch =
            !query ||
            [
              product.name,
              product.sku,
              product.category,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(query);

          const matchesCategory =
            category ===
              "All" ||
            product.category ===
              category;

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );
    }, [
      products,
      productSearch,
      category,
    ]);

  const toggleCustomer = (
    customerId
  ) => {
    setSelectedCustomers(
      (current) =>
        current.includes(
          customerId
        )
          ? current.filter(
              (id) =>
                id !==
                customerId
            )
          : [
              ...current,
              customerId,
            ]
    );
  };

  const toggleProduct = (
    productId
  ) => {
    setSelectedProducts(
      (current) =>
        current.includes(
          productId
        )
          ? current.filter(
              (id) =>
                id !==
                productId
            )
          : [
              ...current,
              productId,
            ]
    );
  };

  const selectAllCustomers =
    () => {
      setSelectedCustomers(
        filteredCustomers.map(
          (customer) =>
            customer._id
        )
      );
    };

  const selectAllProducts =
    () => {
      setSelectedProducts(
        filteredProducts.map(
          (product) =>
            product._id
        )
      );
    };

  const selectedCustomerObjects =
    customers.filter(
      (customer) =>
        selectedCustomers.includes(
          customer._id
        )
    );

  const selectedProductObjects =
    products.filter(
      (product) =>
        selectedProducts.includes(
          product._id
        )
    );

  const handleShare =
    async () => {
      if (
        selectedCustomers.length ===
          0 ||
        selectedProducts.length ===
          0 ||
        sharing
      ) {
        return;
      }

      try {
        setSharing(true);

        const result =
          await shareProductsOnWhatsApp(
            token,
            selectedCustomers,
            selectedProducts
          );

        showToast(
          "success",
          "Products shared",
          `Products shared with ${result.customerCount} customer${
            result.customerCount ===
            1
              ? ""
              : "s"
          } successfully.`
        );

        setSelectedCustomers(
          []
        );

        setSelectedProducts(
          []
        );

        await reloadHistory();
      } catch (error) {
        showToast(
          "error",
          "Unable to share products",
          error.message ||
            "Please try again."
        );
      } finally {
        setSharing(false);
      }
    };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
        Loading WhatsApp AI...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <MessageCircle
            size={21}
          />
        </div>

        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            WhatsApp AI
          </h1>

          <p className="mt-0.5 text-sm text-slate-500">
            Select customers and products to share product information through WhatsApp.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SelectionCard
          title="Customers"
          icon={Users}
          count={
            selectedCustomers.length
          }
          selectedLabel="customers selected"
          onSelectAll={
            selectAllCustomers
          }
          onClear={() =>
            setSelectedCustomers(
              []
            )
          }
        >
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={
                customerSearch
              }
              onChange={(
                event
              ) =>
                setCustomerSearch(
                  event.target
                    .value
                )
              }
              placeholder="Search customers..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none"
            />
          </div>

          <div className="max-h-[470px] space-y-2 overflow-y-auto pr-1">
            {filteredCustomers.length ===
            0 ? (
              <Empty text="No active customers available." />
            ) : (
              filteredCustomers.map(
                (
                  customer
                ) => (
                  <CustomerOption
                    key={
                      customer._id
                    }
                    customer={
                      customer
                    }
                    selected={selectedCustomers.includes(
                      customer._id
                    )}
                    onClick={() =>
                      toggleCustomer(
                        customer._id
                      )
                    }
                  />
                )
              )
            )}
          </div>
        </SelectionCard>

        <SelectionCard
          title="Products"
          icon={Package}
          count={
            selectedProducts.length
          }
          selectedLabel="products selected"
          onSelectAll={
            selectAllProducts
          }
          onClear={() =>
            setSelectedProducts(
              []
            )
          }
        >
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={
                  productSearch
                }
                onChange={(
                  event
                ) =>
                  setProductSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search products..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none"
              />
            </div>

            <select
              value={
                category
              }
              onChange={(
                event
              ) =>
                setCategory(
                  event.target
                    .value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
            >
              <option value="All">
                All Categories
              </option>

              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="max-h-[470px] space-y-2 overflow-y-auto pr-1">
            {filteredProducts.length ===
            0 ? (
              <Empty text="No active products available." />
            ) : (
              filteredProducts.map(
                (
                  product
                ) => (
                  <ProductOption
                    key={
                      product._id
                    }
                    product={
                      product
                    }
                    selected={selectedProducts.includes(
                      product._id
                    )}
                    onClick={() =>
                      toggleProduct(
                        product._id
                      )
                    }
                  />
                )
              )
            )}
          </div>
        </SelectionCard>
      </div>

      <ShareSummary
        customers={
          selectedCustomerObjects
        }
        products={
          selectedProductObjects
        }
        sharing={sharing}
        onShare={
          handleShare
        }
      />

      <ShareHistory
        shares={shares}
      />
    </div>
  );
}

function SelectionCard({
  title,
  icon: Icon,
  count,
  selectedLabel,
  onSelectAll,
  onClear,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Icon size={17} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              {title}
            </h2>

            <p className="text-xs text-slate-400">
              {count}{" "}
              {
                selectedLabel
              }
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={
              onSelectAll
            }
            className="text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            Select All
          </button>

          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-slate-400 hover:text-slate-700"
          >
            Clear
          </button>
        </div>
      </div>

      {children}
    </section>
  );
}

function CustomerOption({
  customer,
  selected,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
        selected
          ? "border-emerald-300 bg-emerald-50"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <Checkbox
        selected={
          selected
        }
      />

      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-900">
          {customer.name}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {customer.companyName ||
            "Individual Customer"}
        </p>

        <p className="mt-1 text-xs font-medium text-slate-600">
          {customer.phone}
        </p>

        {customer
          .assignedTo
          ?.name && (
          <p className="mt-1 text-xs text-slate-400">
            Assigned to{" "}
            {
              customer
                .assignedTo
                .name
            }
          </p>
        )}
      </div>
    </button>
  );
}

function ProductOption({
  product,
  selected,
  onClick,
}) {
  const image =
    product.media?.find(
      (item) =>
        item.type ===
        "image"
    );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full gap-3 rounded-xl border p-3 text-left transition ${
        selected
          ? "border-emerald-300 bg-emerald-50"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        {image?.dataUrl ? (
          <img
            src={image.dataUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <ImageIcon
              size={20}
            />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-slate-900">
              {product.name}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              {product.sku} •{" "}
              {
                product.category
              }
            </p>
          </div>

          <Checkbox
            selected={
              selected
            }
          />
        </div>

        <p className="mt-2 text-sm font-semibold text-slate-700">
          ₹
          {Number(
            product.sellingPrice ||
              0
          ).toLocaleString(
            "en-IN"
          )}
        </p>

        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
            {
              product.description
            }
          </p>
        )}
      </div>
    </button>
  );
}

function Checkbox({
  selected,
}) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
        selected
          ? "border-emerald-600 bg-emerald-600 text-white"
          : "border-slate-300 bg-white"
      }`}
    >
      {selected && (
        <Check size={13} />
      )}
    </span>
  );
}

function ShareSummary({
  customers,
  products,
  sharing,
  onShare,
}) {
  const disabled =
    customers.length === 0 ||
    products.length === 0 ||
    sharing;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <h2 className="font-semibold text-slate-900">
              Share Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Customers:{" "}
              {
                customers.length
              }{" "}
              • Products:{" "}
              {
                products.length
              }
            </p>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Recipients
            </p>

            <div className="mt-2 space-y-1">
              {customers.length >
              0 ? (
                customers.map(
                  (
                    customer
                  ) => (
                    <p
                      key={
                        customer._id
                      }
                      className="text-sm text-slate-600"
                    >
                      •{" "}
                      {
                        customer.name
                      }{" "}
                      —{" "}
                      {
                        customer.phone
                      }
                    </p>
                  )
                )
              ) : (
                <p className="text-sm text-slate-400">
                  No customers selected.
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 md:mt-12">
              Products
            </p>

            <div className="mt-2 space-y-1">
              {products.length >
              0 ? (
                products.map(
                  (
                    product
                  ) => (
                    <p
                      key={
                        product._id
                      }
                      className="text-sm text-slate-600"
                    >
                      •{" "}
                      {
                        product.name
                      }
                    </p>
                  )
                )
              ) : (
                <p className="text-sm text-slate-400">
                  No products selected.
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          disabled={disabled}
          onClick={onShare}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={17} />

          {sharing
            ? "Sharing..."
            : "Share on WhatsApp"}
        </button>
      </div>
    </section>
  );
}

function ShareHistory({
  shares,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900">
          Recent Shares
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Latest WhatsApp product sharing activity.
        </p>
      </div>

      {shares.length ===
      0 ? (
        <div className="p-10 text-center text-sm text-slate-400">
          No WhatsApp shares yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-4">
                  Date / Time
                </th>

                <th className="px-5 py-4">
                  Customers
                </th>

                <th className="px-5 py-4">
                  Products
                </th>

                <th className="px-5 py-4">
                  Shared By
                </th>

                <th className="px-5 py-4">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {shares.map(
                (share) => (
                  <tr
                    key={
                      share._id
                    }
                  >
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {new Date(
                        share.createdAt
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {
                        share.customerCount
                      }
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {
                        share.productCount
                      }
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {share
                        .requestedBy
                        ?.name ||
                        "—"}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        status={
                          share.status
                        }
                      />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function StatusBadge({
  status,
}) {
  const styles = {
    Sent:
      "bg-emerald-50 text-emerald-700",

    Failed:
      "bg-red-50 text-red-700",

    Pending:
      "bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

function Empty({
  text,
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}