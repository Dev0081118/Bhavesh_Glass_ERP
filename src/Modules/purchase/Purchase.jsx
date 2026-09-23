import {
  useEffect,
  useMemo,
  useState,
} from "react";

import PurchaseHeader from "./PurchaseHeader";
import PurchaseSummary from "./PurchaseSummary";
import PurchaseFilters from "./PurchaseFilters";
import PurchaseTable from "./PurchaseTable";
import PurchaseForm from "./PurchaseForm";
import PurchaseDetails from "./PurchaseDetails";
import DeletePurchaseModal from "./DeletePurchaseModal";

import useBackendResource from "../../hooks/useBackendResource";

import {
  getPurchaseLookups,
  createQuickSupplier,
} from "../../lib/purchaseProductionApi";

import {
  useToast,
} from "../../components/ToastProvider";

export default function Purchase({
  token,
}) {
  const {
    showToast,
  } =
    useToast();

  const {
    records:
      purchases,

    save,
    remove,

    loading,
  } =
    useBackendResource(
      token,
      "purchases"
    );

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    suppliers,
    setSuppliers,
  ] = useState([]);

  const [
    staff,
    setStaff,
  ] = useState([]);

  const [
    lookupLoading,
    setLookupLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    supplierFilter,
    setSupplierFilter,
  ] = useState("All");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [
    dateFilter,
    setDateFilter,
  ] = useState("");

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    editingPurchase,
    setEditingPurchase,
  ] = useState(null);

  const [
    selectedPurchase,
    setSelectedPurchase,
  ] = useState(null);

  const [
    deletePurchase,
    setDeletePurchase,
  ] = useState(null);

  const loadLookups =
    async () => {
      try {
        setLookupLoading(
          true
        );

        const result =
          await getPurchaseLookups(
            token
          );

        setProducts(
          (
            result.data
              ?.products ||
            []
          ).map(
            (product) => ({
              ...product,

              id:
                product._id,

              available:
                Number(
                  product.availableQuantity ||
                    0
                ),
            })
          )
        );

        setSuppliers(
          (
            result.data
              ?.suppliers ||
            []
          ).map(
            (supplier) => ({
              ...supplier,

              id:
                supplier._id,
            })
          )
        );

        setStaff(
          (
            result.data
              ?.staff ||
            []
          ).map(
            (person) => ({
              ...person,

              id:
                person._id,
            })
          )
        );
      } catch (error) {
        showToast(
          "error",
          "Unable to load purchase data",
          error.message
        );
      } finally {
        setLookupLoading(
          false
        );
      }
    };

  useEffect(() => {
    if (token) {
      loadLookups();
    }
  }, [token]);

  const filteredPurchases =
    useMemo(
      () =>
        purchases.filter(
          (purchase) => {
            const query =
              search
                .trim()
                .toLowerCase();

            const matchesSearch =
              !query ||
              String(
                purchase.purchaseNumber ||
                  purchase.id ||
                  ""
              )
                .toLowerCase()
                .includes(
                  query
                ) ||
              String(
                purchase.supplierName ||
                  ""
              )
                .toLowerCase()
                .includes(
                  query
                );

            const matchesSupplier =
              supplierFilter ===
                "All" ||
              String(
                purchase.supplierId
              ) ===
                String(
                  supplierFilter
                );

            const matchesStatus =
              statusFilter ===
                "All" ||
              purchase.status ===
                statusFilter;

            const matchesDate =
              !dateFilter ||
              String(
                purchase.purchaseDate ||
                  ""
              ).slice(
                0,
                10
              ) ===
                dateFilter;

            return (
              matchesSearch &&
              matchesSupplier &&
              matchesStatus &&
              matchesDate
            );
          }
        ),
      [
        purchases,
        search,
        supplierFilter,
        statusFilter,
        dateFilter,
      ]
    );

  const summary =
    useMemo(
      () => ({
        total:
          purchases.length,

        pending:
          purchases.filter(
            (purchase) =>
              [
                "Draft",
                "Pending",
                "Ordered",
              ].includes(
                purchase.status
              )
          ).length,

        received:
          purchases.filter(
            (purchase) =>
              purchase.status ===
              "Received"
          ).length,

        purchaseValue:
          purchases.reduce(
            (
              total,
              purchase
            ) =>
              total +
              Number(
                purchase.grandTotal ||
                  0
              ),
            0
          ),
      }),
      [
        purchases,
      ]
    );

  const createSupplier =
    async (
      payload
    ) => {
      const result =
        await createQuickSupplier(
          token,
          payload
        );

      const supplier = {
        ...result.data,

        id:
          result.data._id,
      };

      setSuppliers(
        (current) => {
          const exists =
            current.some(
              (item) =>
                String(
                  item.id
                ) ===
                String(
                  supplier.id
                )
            );

          if (exists) {
            return current;
          }

          return [
            ...current,
            supplier,
          ].sort(
            (
              first,
              second
            ) =>
              first.name.localeCompare(
                second.name
              )
          );
        }
      );

      showToast(
        "success",
        "Supplier ready",
        `${supplier.name} can now be used for this purchase.`
      );

      return supplier;
    };

  const handleSave =
    async (
      data
    ) => {
      try {
        await save(
          data,
          editingPurchase?.id
        );

        showToast(
          "success",
          editingPurchase
            ? "Purchase updated"
            : "Purchase created",
          "Purchase saved successfully."
        );

        setFormOpen(
          false
        );

        setEditingPurchase(
          null
        );
      } catch (error) {
        showToast(
          "error",
          "Unable to save purchase",
          error.message
        );

        throw error;
      }
    };

  return (
    <div className="min-h-full bg-slate-50/60 p-4 sm:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <PurchaseHeader
          onAdd={() => {
            setEditingPurchase(
              null
            );

            setFormOpen(
              true
            );
          }}
        />

        <PurchaseSummary
          summary={
            summary
          }
        />

        <PurchaseFilters
          search={
            search
          }
          setSearch={
            setSearch
          }

          supplierFilter={
            supplierFilter
          }
          setSupplierFilter={
            setSupplierFilter
          }

          statusFilter={
            statusFilter
          }
          setStatusFilter={
            setStatusFilter
          }

          dateFilter={
            dateFilter
          }
          setDateFilter={
            setDateFilter
          }

          suppliers={
            suppliers
          }

          onClear={() => {
            setSearch("");
            setSupplierFilter(
              "All"
            );
            setStatusFilter(
              "All"
            );
            setDateFilter("");
          }}
        />

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Loading purchases...
          </div>
        ) : (
          <PurchaseTable
            purchases={
              filteredPurchases
            }

            products={
              products
            }

            onView={
              setSelectedPurchase
            }

            onEdit={(
              purchase
            ) => {
              setEditingPurchase(
                purchase
              );

              setFormOpen(
                true
              );
            }}

            onDelete={
              setDeletePurchase
            }
          />
        )}
      </div>

      {formOpen && (
        <PurchaseForm
          purchase={
            editingPurchase
          }

          products={
            products
          }

          suppliers={
            suppliers
          }

          staff={
            staff
          }

          loading={
            lookupLoading
          }

          onCreateSupplier={
            createSupplier
          }

          onClose={() => {
            setFormOpen(
              false
            );

            setEditingPurchase(
              null
            );
          }}

          onSave={
            handleSave
          }
        />
      )}

      {selectedPurchase && (
        <PurchaseDetails
          purchase={
            selectedPurchase
          }

          products={
            products
          }

          suppliers={
            suppliers
          }

          onClose={() =>
            setSelectedPurchase(
              null
            )
          }

          onEdit={() => {
            setEditingPurchase(
              selectedPurchase
            );

            setSelectedPurchase(
              null
            );

            setFormOpen(
              true
            );
          }}
        />
      )}

      {deletePurchase && (
        <DeletePurchaseModal
          purchase={
            deletePurchase
          }

          onClose={() =>
            setDeletePurchase(
              null
            )
          }

          onConfirm={async () => {
            try {
              await remove(
                deletePurchase.id
              );

              setDeletePurchase(
                null
              );
            } catch (error) {
              showToast(
                "error",
                "Unable to delete purchase",
                error.message
              );
            }
          }}
        />
      )}
    </div>
  );
}