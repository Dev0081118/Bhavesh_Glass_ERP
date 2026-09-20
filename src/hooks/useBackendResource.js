import { useCallback, useEffect, useState } from "react";
import {
  createResource,
  deleteResource,
  listResource,
  updateResource,
} from "../lib/api";

const referenceFields = [
  ["supplier", "supplierId", "supplierName"],
  ["product", "productId", "productName"],
  ["customer", "customerId", "customerName"],
  ["manager", "managerId", "managerName"],
  ["saleBill", "saleBillId"],
  ["dispatch", "dispatchId"],
  ["lr", "lrId"],
  ["party", "partyId", "partyName"],
];

const mapRecord = (record) => {
  const mapped = { ...record, id: record._id || record.id };

  referenceFields.forEach(([source, idField, nameField]) => {
    const reference = record[source];
    if (!reference) return;
    mapped[idField] = reference._id || reference;
    if (nameField && typeof reference === "object") {
      mapped[nameField] = reference.name || reference.email || "";
    }
  });

  if (Array.isArray(record.items)) {
    mapped.items = record.items.map((item) => ({
      ...item,
      productId: item.product?._id || item.productId || item.product,
      name: item.product?.name || item.name,
      sku: item.product?.sku || item.sku,
    }));
  }

  if (Array.isArray(record.rawMaterials)) {
    mapped.rawMaterials = record.rawMaterials.map((item) => ({
      ...item,
      productId: item.product?._id || item.productId || item.product,
      name: item.product?.name || item.name,
    }));
  }

  return mapped;
};

export default function useBackendResource(token, resource, initialData = []) {
  const [records, setRecords] = useState(token ? [] : initialData);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!token) return;
    try {
      const result = await listResource(token, resource);
      setRecords(result.data.map(mapRecord));
    } catch (loadError) {
      setError(loadError.message);
    }
  }, [token, resource]);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = async (data, id) => {
    if (!token) return null;
    try {
      const result = id
        ? await updateResource(token, resource, id, data)
        : await createResource(token, resource, data);
      const record = mapRecord(result.data);
      setRecords((current) => id
        ? current.map((item) => item.id === id ? record : item)
        : [record, ...current]
      );
      return record;
    } catch (saveError) {
      setError(saveError.message);
      throw saveError;
    }
  };

  const remove = async (id) => {
    if (!token) return;
    try {
      await deleteResource(token, resource, id);
      setRecords((current) => current.filter((item) => item.id !== id));
    } catch (deleteError) {
      setError(deleteError.message);
      throw deleteError;
    }
  };

  return { records, setRecords, error, save, remove, reload };
}
