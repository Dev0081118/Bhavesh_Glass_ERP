import {
  useEffect,
  useMemo,
  useState,
} from "react";

import ProductHeader from "./ProductHeader";
import ProductSummary from "./ProductSummary";
import ProductFilters from "./ProductFilters";
import ProductTable from "./ProductTable";
import ProductForm from "./ProductForm";
import ProductDetails from "./ProductDetails";
import DeleteProductModal from "./DeleteProductModal";

import {
  createResource,
  deleteResource,
  listResource,
  updateResource,
  listStaff,
} from "../../lib/api";

const normalizeProduct = (
  product
) => ({
  ...product,

  id:
    product._id ||
    product.id,
});

export default function Product({
  token,
}) {
  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    staff,
    setStaff,
  ] = useState([]);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("All");

  const [
    type,
    setType,
  ] = useState("All");

  const [
    status,
    setStatus,
  ] = useState("All");

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    editingProduct,
    setEditingProduct,
  ] = useState(null);

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState(null);

  const [
    deleteProduct,
    setDeleteProduct,
  ] = useState(null);

  const loadProducts =
    async () => {
      try {
        const result =
          await listResource(
            token,
            "products"
          );

        setProducts(
          result.data
            .filter(
              (item) =>
                item &&
                item._id &&
                item.name
            )
            .map(
              normalizeProduct
            )
        );
      } catch (loadError) {
        setError(
          loadError.message
        );
      }
    };

  useEffect(() => {
    if (!token) return;

    loadProducts();

    listStaff(token)
  .then((result) => {
    const rows =
      result.staff || [];

    const assignableStaff =
      rows.filter(
        (user) =>
          user.status === "Active" &&
          [
            "Manager",
            "Employee",
          ].includes(user.role)
      );

    setStaff(
      assignableStaff
    );
  })
  .catch((error) => {
    console.error(
      "Unable to load staff:",
      error
    );

    setStaff([]);
  });
  }, [token]);

  const filteredProducts =
    useMemo(() => {
      const query =
        search
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
              product.material,
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

          const matchesType =
            type === "All" ||
            product.type ===
              type;

          const matchesStatus =
            status === "All" ||
            product.status ===
              status;

          return (
            matchesSearch &&
            matchesCategory &&
            matchesType &&
            matchesStatus
          );
        }
      );
    }, [
      products,
      search,
      category,
      type,
      status,
    ]);

  const categories = [
    ...new Set(
      products
        .map(
          (item) =>
            item.category
        )
        .filter(Boolean)
    ),
  ];

  const types = [
    ...new Set(
      products
        .map(
          (item) =>
            item.type
        )
        .filter(Boolean)
    ),
  ];

  const handleSave =
    async (
      productData
    ) => {
      try {
        setError("");

        const result =
          editingProduct
            ? await updateResource(
                token,
                "products",
                editingProduct.id,
                productData
              )
            : await createResource(
                token,
                "products",
                productData
              );

        const saved =
          normalizeProduct(
            result.data
          );

        setProducts(
          (current) =>
            editingProduct
              ? current.map(
                  (item) =>
                    item.id ===
                    editingProduct.id
                      ? saved
                      : item
                )
              : [
                  saved,
                  ...current,
                ]
        );

        setShowForm(false);
        setEditingProduct(
          null
        );
      } catch (saveError) {
        setError(
          saveError.message
        );
      }
    };

  const handleToggleStatus =
    async (product) => {
      try {
        const newStatus =
          product.status ===
          "Active"
            ? "Inactive"
            : "Active";

        const result =
          await updateResource(
            token,
            "products",
            product.id,
            {
              status:
                newStatus,
            }
          );

        const updated =
          normalizeProduct(
            result.data
          );

        setProducts(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                product.id
                  ? updated
                  : item
            )
        );
      } catch (toggleError) {
        setError(
          toggleError.message
        );
      }
    };

  const handleDelete =
    async () => {
      if (!deleteProduct) {
        return;
      }

      try {
        await deleteResource(
          token,
          "products",
          deleteProduct.id
        );

        setProducts(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                deleteProduct.id
            )
        );

        setDeleteProduct(
          null
        );

        setSelectedProduct(
          null
        );
      } catch (deleteError) {
        setError(
          deleteError.message
        );
      }
    };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6">
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <ProductHeader
        onAdd={() => {
          setEditingProduct(
            null
          );

          setShowForm(true);
        }}
      />

      <ProductSummary
        products={products}
      />

      <ProductFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={
          setCategory
        }
        type={type}
        setType={setType}
        status={status}
        setStatus={
          setStatus
        }
        categories={
          categories
        }
        types={types}
      />

      <ProductTable
        products={
          filteredProducts
        }
        onView={
          setSelectedProduct
        }
        onEdit={(product) => {
          setSelectedProduct(
            null
          );

          setEditingProduct(
            product
          );

          setShowForm(true);
        }}
        onDelete={
          setDeleteProduct
        }
        onToggleStatus={
          handleToggleStatus
        }
      />

      {showForm && (
        <ProductForm
          product={
            editingProduct
          }
          staff={staff}
          onClose={() => {
            setShowForm(false);

            setEditingProduct(
              null
            );
          }}
          onSave={
            handleSave
          }
        />
      )}

      {selectedProduct && (
        <ProductDetails
          product={
            selectedProduct
          }
          onClose={() =>
            setSelectedProduct(
              null
            )
          }
          onEdit={(
            product
          ) => {
            setSelectedProduct(
              null
            );

            setEditingProduct(
              product
            );

            setShowForm(true);
          }}
          onDelete={
            setDeleteProduct
          }
        />
      )}

      {deleteProduct && (
        <DeleteProductModal
          product={
            deleteProduct
          }
          onCancel={() =>
            setDeleteProduct(
              null
            )
          }
          onConfirm={
            handleDelete
          }
        />
      )}
    </div>
  );
}