import {
  useEffect,
  useMemo,
  useState,
} from "react";

import ProductionHeader from "./ProductionHeader";
import ProductionSummary from "./ProductionSummary";
import ProductionFilters from "./ProductionFilters";
import ProductionTable from "./ProductionTable";
import ProductionForm from "./ProductionForm";
import ProductionDetails from "./ProductionDetails";
import DeleteProductionModal from "./DeleteProductionModal";

import useBackendResource from "../../hooks/useBackendResource";

import {
  createQuickFinishedProduct,
  getProductionLookups,
} from "../../lib/purchaseProductionApi";

import {
  useToast,
} from "../../components/ToastProvider";

export default function Production({
  token,
}) {
  const {
    showToast,
  } =
    useToast();

  const {
    records:
      productions,

    save,
    remove,

    loading,
  } =
    useBackendResource(
      token,
      "production"
    );

  const [
    products,
    setProducts,
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
    filters,
    setFilters,
  ] = useState({
    search:
      "",

    status:
      "All",

    date:
      "",
  });

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    editingProduction,
    setEditingProduction,
  ] = useState(null);

  const [
    viewingProduction,
    setViewingProduction,
  ] = useState(null);

  const [
    deletingProduction,
    setDeletingProduction,
  ] = useState(null);

  const loadLookups =
    async () => {
      try {
        setLookupLoading(
          true
        );

        const result =
          await getProductionLookups(
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
          "Unable to load production data",
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

  const filtered =
    useMemo(
      () =>
        productions.filter(
          (production) => {
            const query =
              filters.search
                .trim()
                .toLowerCase();

            const searchMatch =
              !query ||
              String(
                production.productionNumber ||
                  production.id ||
                  ""
              )
                .toLowerCase()
                .includes(
                  query
                ) ||
              String(
                production.productName ||
                  ""
              )
                .toLowerCase()
                .includes(
                  query
                );

            const statusMatch =
              filters.status ===
                "All" ||
              production.status ===
                filters.status;

            const dateMatch =
              !filters.date ||
              String(
                production.startDate ||
                  ""
              ).slice(
                0,
                10
              ) ===
                filters.date;

            return (
              searchMatch &&
              statusMatch &&
              dateMatch
            );
          }
        ),
      [
        productions,
        filters,
      ]
    );

  const createFinishedProduct =
    async (
      payload
    ) => {
      const result =
        await createQuickFinishedProduct(
          token,
          payload
        );

      const product = {
        ...result.data,

        id:
          result.data._id,

        available:
          Number(
            result.data
              .availableQuantity ||
              0
          ),
      };

      setProducts(
        (current) => [
          ...current,
          product,
        ].sort(
          (
            first,
            second
          ) =>
            first.name.localeCompare(
              second.name
            )
        )
      );

      showToast(
        "success",
        "Finished product created",
        `${product.name} and its Inventory record are ready.`
      );

      return product;
    };

  const handleSave =
    async (
      data
    ) => {
      try {
        await save(
          data,
          editingProduction
            ?.id
        );

        showToast(
          "success",
          editingProduction
            ? "Production updated"
            : "Production created",
          "Production saved successfully."
        );

        setFormOpen(
          false
        );

        setEditingProduction(
          null
        );

        /*
         * Refresh stock shown in lookups
         * after production stock movement.
         */
        await loadLookups();
      } catch (error) {
        showToast(
          "error",
          "Unable to save production",
          error.message
        );

        throw error;
      }
    };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <ProductionHeader
          onAdd={() => {
            setEditingProduction(
              null
            );

            setFormOpen(
              true
            );
          }}
        />

        <ProductionSummary
          productions={
            productions
          }
        />

        <ProductionFilters
          filters={
            filters
          }

          setFilters={
            setFilters
          }
        />

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Loading production...
          </div>
        ) : (
          <ProductionTable
            productions={
              filtered
            }

            onView={
              setViewingProduction
            }

            onEdit={(
              production
            ) => {
              setEditingProduction(
                production
              );

              setFormOpen(
                true
              );
            }}

            onDelete={
              setDeletingProduction
            }
          />
        )}
      </div>

      {formOpen && (
        <ProductionForm
          production={
            editingProduction
          }

          products={
            products
          }

          staff={
            staff
          }

          loading={
            lookupLoading
          }

          onCreateFinishedProduct={
            createFinishedProduct
          }

          onClose={() => {
            setFormOpen(
              false
            );

            setEditingProduction(
              null
            );
          }}

          onSave={
            handleSave
          }
        />
      )}

      {viewingProduction && (
        <ProductionDetails
          production={
            viewingProduction
          }

          onClose={() =>
            setViewingProduction(
              null
            )
          }

          onEdit={() => {
            setEditingProduction(
              viewingProduction
            );

            setViewingProduction(
              null
            );

            setFormOpen(
              true
            );
          }}
        />
      )}

      {deletingProduction && (
        <DeleteProductionModal
          production={
            deletingProduction
          }

          onClose={() =>
            setDeletingProduction(
              null
            )
          }

          onConfirm={async () => {
            try {
              await remove(
                deletingProduction.id
              );

              setDeletingProduction(
                null
              );
            } catch (error) {
              showToast(
                "error",
                "Unable to delete production",
                error.message
              );
            }
          }}
        />
      )}
    </div>
  );
}