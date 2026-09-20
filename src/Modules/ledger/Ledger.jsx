import { useMemo, useState } from "react";
import LedgerHeader from "./LedgerHeader";
import LedgerSummary from "./LedgerSummary";
import LedgerFilters from "./LedgerFilters";
import LedgerTable from "./LedgerTable";
import LedgerForm from "./LedgerForm";
import LedgerDetails from "./LedgerDetails";
import DeleteLedgerModal from "./DeleteLedgerModal";
import useBackendResource from "../../hooks/useBackendResource";

const initialEntries = [
  {
    id: "LED-001",
    transactionDate: "2026-09-18",
    partyId: "CUS-001",
    partyName: "Rajkot Photo House",
    partyType: "Customer",
    transactionType: "Sale",
    referenceType: "Sale Bill",
    referenceId: "SB-001",
    debit: 15687,
    credit: 0,
    balance: 15687,
    narration: "Sale bill generated for photo frames.",
    status: "Posted",
  },
  {
    id: "LED-002",
    transactionDate: "2026-09-18",
    partyId: "CUS-001",
    partyName: "Rajkot Photo House",
    partyType: "Customer",
    transactionType: "Payment Received",
    referenceType: "Payment",
    referenceId: "PAY-001",
    debit: 0,
    credit: 10000,
    balance: 5687,
    narration: "Advance payment received through bank transfer.",
    status: "Posted",
  },
  {
    id: "LED-003",
    transactionDate: "2026-09-18",
    partyId: "CUS-002",
    partyName: "Shreeji Frames",
    partyType: "Customer",
    transactionType: "Sale",
    referenceType: "Sale Bill",
    referenceId: "SB-002",
    debit: 16536,
    credit: 0,
    balance: 16536,
    narration: "Sale bill generated for premium frames.",
    status: "Posted",
  },
  {
    id: "LED-004",
    transactionDate: "2026-09-18",
    partyId: "CUS-002",
    partyName: "Shreeji Frames",
    partyType: "Customer",
    transactionType: "Payment Received",
    referenceType: "Payment",
    referenceId: "PAY-002",
    debit: 0,
    credit: 16536,
    balance: 0,
    narration: "Full payment received through UPI.",
    status: "Posted",
  },
  {
    id: "LED-005",
    transactionDate: "2026-09-17",
    partyId: "SUP-001",
    partyName: "Rajkot MDF Traders",
    partyType: "Supplier",
    transactionType: "Purchase",
    referenceType: "Purchase",
    referenceId: "PUR-001",
    debit: 0,
    credit: 10000,
    balance: 10000,
    narration: "MDF board purchase recorded.",
    status: "Posted",
  },
  {
    id: "LED-006",
    transactionDate: "2026-09-17",
    partyId: "SUP-001",
    partyName: "Rajkot MDF Traders",
    partyType: "Supplier",
    transactionType: "Payment Made",
    referenceType: "Payment",
    referenceId: "PAY-SUP-001",
    debit: 5000,
    credit: 0,
    balance: 5000,
    narration: "Partial payment made to supplier.",
    status: "Posted",
  },
  {
    id: "LED-007",
    transactionDate: "2026-09-16",
    partyId: "CUS-003",
    partyName: "Royal Photo Studio",
    partyType: "Customer",
    transactionType: "Sale",
    referenceType: "Sale Bill",
    referenceId: "SB-003",
    debit: 6218,
    credit: 0,
    balance: 6218,
    narration: "Sale bill generated.",
    status: "Posted",
  },
  {
    id: "LED-008",
    transactionDate: "2026-09-15",
    partyId: "SUP-002",
    partyName: "Glass Materials Supplier",
    partyType: "Supplier",
    transactionType: "Purchase",
    referenceType: "Purchase",
    referenceId: "PUR-002",
    debit: 0,
    credit: 7500,
    balance: 7500,
    narration: "Glass sheet purchase recorded.",
    status: "Pending",
  },
  {
    id: "LED-009",
    transactionDate: "2026-09-14",
    partyId: "CUS-003",
    partyName: "Royal Photo Studio",
    partyType: "Customer",
    transactionType: "Adjustment",
    referenceType: "Manual",
    referenceId: "ADJ-001",
    debit: 0,
    credit: 500,
    balance: 5718,
    narration: "Customer discount adjustment.",
    status: "Posted",
  },
];

const customers = [
  {
    id: "CUS-001",
    name: "Rajkot Photo House",
    type: "Customer",
  },
  {
    id: "CUS-002",
    name: "Shreeji Frames",
    type: "Customer",
  },
  {
    id: "CUS-003",
    name: "Royal Photo Studio",
    type: "Customer",
  },
];

const suppliers = [
  {
    id: "SUP-001",
    name: "Rajkot MDF Traders",
    type: "Supplier",
  },
  {
    id: "SUP-002",
    name: "Glass Materials Supplier",
    type: "Supplier",
  },
  {
    id: "SUP-003",
    name: "Frame Accessories India",
    type: "Supplier",
  },
];

const emptyFilters = {
  search: "",
  partyType: "All",
  transactionType: "All",
  status: "All",
  referenceType: "All",
  dateFrom: "",
  dateTo: "",
};

function Ledger({ token }) {
  const resource = useBackendResource(token, "ledger", initialEntries);
  const { records: entries, save, remove } = resource;

  const [filters, setFilters] = useState(emptyFilters);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const [selectedEntry, setSelectedEntry] = useState(null);

  const [deleteEntry, setDeleteEntry] = useState(null);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const search = filters.search.toLowerCase();

      const matchesSearch =
        !search ||
        entry.id.toLowerCase().includes(search) ||
        entry.partyName.toLowerCase().includes(search) ||
        entry.referenceId.toLowerCase().includes(search) ||
        entry.transactionType.toLowerCase().includes(search);

      const matchesPartyType =
        filters.partyType === "All" ||
        entry.partyType === filters.partyType;

      const matchesTransactionType =
        filters.transactionType === "All" ||
        entry.transactionType === filters.transactionType;

      const matchesStatus =
        filters.status === "All" ||
        entry.status === filters.status;

      const matchesReference =
        filters.referenceType === "All" ||
        entry.referenceType === filters.referenceType;

      const matchesDateFrom =
        !filters.dateFrom || entry.transactionDate >= filters.dateFrom;

      const matchesDateTo =
        !filters.dateTo || entry.transactionDate <= filters.dateTo;

      return (
        matchesSearch &&
        matchesPartyType &&
        matchesTransactionType &&
        matchesStatus &&
        matchesReference &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [entries, filters]);

  const summary = useMemo(() => {
    const totalDebit = entries.reduce(
      (sum, entry) => sum + Number(entry.debit || 0),
      0
    );

    const totalCredit = entries.reduce(
      (sum, entry) => sum + Number(entry.credit || 0),
      0
    );

    const customerReceivable = entries
      .filter((entry) => entry.partyType === "Customer")
      .reduce(
        (balance, entry) =>
          balance + Number(entry.debit || 0) - Number(entry.credit || 0),
        0
      );

    const supplierPayable = entries
      .filter((entry) => entry.partyType === "Supplier")
      .reduce(
        (balance, entry) =>
          balance + Number(entry.credit || 0) - Number(entry.debit || 0),
        0
      );

    return {
      totalEntries: entries.length,
      totalDebit,
      totalCredit,
      customerReceivable,
      supplierPayable,
    };
  }, [entries]);

  const handleAdd = () => {
    setEditingEntry(null);
    setIsFormOpen(true);
  };

  const handleEdit = (entry) => {
    setSelectedEntry(null);
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleSave = async (formData) => {
    await save(formData, editingEntry?.id);
    setIsFormOpen(false);
    setEditingEntry(null);
  };

  const handleDelete = async () => {
    if (!deleteEntry) return;

    await remove(deleteEntry.id);

    if (selectedEntry?.id === deleteEntry.id) {
      setSelectedEntry(null);
    }

    setDeleteEntry(null);
  };

  const handleClearFilters = () => {
    setFilters(emptyFilters);
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <LedgerHeader onAdd={handleAdd} />

        <LedgerSummary summary={summary} />

        <LedgerFilters
          filters={filters}
          setFilters={setFilters}
          onClear={handleClearFilters}
        />

        <LedgerTable
          entries={filteredEntries}
          onView={setSelectedEntry}
          onEdit={handleEdit}
          onDelete={setDeleteEntry}
        />
      </div>

      {isFormOpen && (
        <LedgerForm
          entry={editingEntry}
          customers={customers}
          suppliers={suppliers}
          onClose={() => {
            setIsFormOpen(false);
            setEditingEntry(null);
          }}
          onSave={handleSave}
        />
      )}

      {selectedEntry && (
        <LedgerDetails
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onEdit={handleEdit}
        />
      )}

      {deleteEntry && (
        <DeleteLedgerModal
          entry={deleteEntry}
          onCancel={() => setDeleteEntry(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

export default Ledger;