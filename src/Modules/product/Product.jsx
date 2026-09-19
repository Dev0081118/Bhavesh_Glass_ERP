import { useMemo, useState } from "react";
import ProductHeader from "./ProductHeader";
import ProductSummary from "./ProductSummary";
import ProductFilters from "./ProductFilters";
import ProductTable from "./ProductTable";
import ProductForm from "./ProductForm";
import ProductDetails from "./ProductDetails";
import DeleteProductModal from "./DeleteProductModal";

const initialProducts = [
  {
    id: "PROD-001",
    name: "Classic Black Photo Frame",
    sku: "BG-FRM-001",
    category: "Photo Frame",
    subCategory: "Classic",
    type: "Finished Product",
    size: "1 Inch",
    material: "MDF",
    unit: "Piece",
    purchasePrice: 180,
    sellingPrice: 299,
    wholesalePrice: 250,
    gst: 18,
    hsnCode: "4414",
    stock: 72,
    reorderLevel: 20,
    location: "Main Warehouse",
    description: "Classic black photo frame for standard photo display.",
    status: "Active",
    image: null,
  },
  {
    id: "PROD-002",
    name: "Premium Wooden Frame",
    sku: "BG-FRM-002",
    category: "Photo Frame",
    subCategory: "Premium",
    type: "Finished Product",
    size: "2 Inch",
    material: "Wood",
    unit: "Piece",
    purchasePrice: 350,
    sellingPrice: 599,
    wholesalePrice: 500,
    gst: 18,
    hsnCode: "4414",
    stock: 34,
    reorderLevel: 15,
    location: "Main Warehouse",
    description: "Premium wooden photo frame with polished finish.",
    status: "Active",
    image: null,
  },
  {
    id: "PROD-003",
    name: "White MDF Frame",
    sku: "BG-FRM-003",
    category: "MDF Frame",
    subCategory: "Standard",
    type: "Finished Product",
    size: "1 Inch",
    material: "MDF",
    unit: "Piece",
    purchasePrice: 140,
    sellingPrice: 249,
    wholesalePrice: 210,
    gst: 18,
    hsnCode: "4414",
    stock: 12,
    reorderLevel: 20,
    location: "Production Store",
    description: "White MDF frame suitable for standard photo printing.",
    status: "Active",
    image: null,
  },
  {
    id: "PROD-004",
    name: "Golden Designer Frame",
    sku: "BG-FRM-004",
    category: "Designer Frame",
    subCategory: "Luxury",
    type: "Finished Product",
    size: "3 Inch",
    material: "Wood",
    unit: "Piece",
    purchasePrice: 500,
    sellingPrice: 899,
    wholesalePrice: 750,
    gst: 18,
    hsnCode: "4414",
    stock: 0,
    reorderLevel: 10,
    location: "Main Warehouse",
    description: "Decorative golden designer frame.",
    status: "Active",
    image: null,
  },
  {
    id: "PROD-005",
    name: "Frame Back Board",
    sku: "BG-BRD-001",
    category: "Raw Material",
    subCategory: "Board",
    type: "Raw Material",
    size: "12x18",
    material: "MDF",
    unit: "Piece",
    purchasePrice: 45,
    sellingPrice: 65,
    wholesalePrice: 55,
    gst: 18,
    hsnCode: "4411",
    stock: 145,
    reorderLevel: 50,
    location: "Raw Material Store",
    description: "MDF back board used in photo frame production.",
    status: "Active",
    image: null,
  },
  {
    id: "PROD-006",
    name: "Glass Sheet",
    sku: "BG-GLS-001",
    category: "Raw Material",
    subCategory: "Glass",
    type: "Raw Material",
    size: "12x18",
    material: "Glass",
    unit: "Sheet",
    purchasePrice: 80,
    sellingPrice: 120,
    wholesalePrice: 100,
    gst: 18,
    hsnCode: "7007",
    stock: 85,
    reorderLevel: 30,
    location: "Glass Store",
    description: "Clear glass sheet for photo frame production.",
    status: "Active",
    image: null,
  },
  {
    id: "PROD-007",
    name: "Metal Frame Clip",
    sku: "BG-CLP-001",
    category: "Accessories",
    subCategory: "Frame Parts",
    type: "Accessory",
    size: "Small",
    material: "Metal",
    unit: "Piece",
    purchasePrice: 4,
    sellingPrice: 8,
    wholesalePrice: 6,
    gst: 18,
    hsnCode: "8302",
    stock: 520,
    reorderLevel: 100,
    location: "Accessories Store",
    description: "Metal clip used to secure frame back panels.",
    status: "Active",
    image: null,
  },
  {
    id: "PROD-008",
    name: "Photo Printing Paper",
    sku: "BG-PPR-001",
    category: "Printing Material",
    subCategory: "Paper",
    type: "Printing Material",
    size: "A4",
    material: "Paper",
    unit: "Pack",
    purchasePrice: 180,
    sellingPrice: 250,
    wholesalePrice: 220,
    gst: 18,
    hsnCode: "4811",
    stock: 8,
    reorderLevel: 25,
    location: "Printing Store",
    description: "Premium photo printing paper.",
    status: "Active",
    image: null,
  },
];

export default function Product() {
  const [products, setProducts] = useState(initialProducts);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [deleteProduct, setDeleteProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(searchValue) ||
        product.sku.toLowerCase().includes(searchValue) ||
        product.id.toLowerCase().includes(searchValue);

      const matchesCategory =
        category === "All" || product.category === category;

      const matchesType =
        type === "All" || product.type === type;

      const matchesStatus =
        status === "All" || product.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesStatus
      );
    });
  }, [products, search, category, type, status]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(null);
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSaveProduct = (productData) => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((product) =>
          product.id === editingProduct.id
            ? { ...product, ...productData }
            : product
        )
      );
    } else {
      const newProduct = {
        ...productData,
        id: `PROD-${String(products.length + 1).padStart(3, "0")}`,
      };

      setProducts((prev) => [newProduct, ...prev]);
    }

    setShowForm(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = () => {
    if (!deleteProduct) return;

    setProducts((prev) =>
      prev.filter((product) => product.id !== deleteProduct.id)
    );

    setDeleteProduct(null);
    setSelectedProduct(null);
  };

  const handleToggleStatus = (product) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === product.id
          ? {
              ...item,
              status:
                item.status === "Active"
                  ? "Inactive"
                  : "Active",
            }
          : item
      )
    );
  };

  const categories = [
    ...new Set(products.map((product) => product.category)),
  ];

  const types = [
    ...new Set(products.map((product) => product.type)),
  ];

  return (
    <div className="min-h-full bg-slate-50 p-6">

      <ProductHeader onAdd={handleAddProduct} />

      <ProductSummary products={products} />

      <ProductFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        type={type}
        setType={setType}
        status={status}
        setStatus={setStatus}
        categories={categories}
        types={types}
      />

      <ProductTable
        products={filteredProducts}
        onView={setSelectedProduct}
        onEdit={handleEditProduct}
        onDelete={setDeleteProduct}
        onToggleStatus={handleToggleStatus}
      />

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={handleEditProduct}
          onDelete={setDeleteProduct}
        />
      )}

      {deleteProduct && (
        <DeleteProductModal
          product={deleteProduct}
          onCancel={() => setDeleteProduct(null)}
          onConfirm={handleDeleteProduct}
        />
      )}
    </div>
  );
}