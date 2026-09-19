import { useMemo, useState } from "react";
import PaymentHeader from "./PaymentHeader";
import PaymentSummary from "./PaymentSummary";
import PaymentFilters from "./PaymentFilters";
import PaymentTable from "./PaymentTable";
import PaymentForm from "./PaymentForm";
import PaymentDetails from "./PaymentDetails";
import DeletePaymentModal from "./DeletePaymentModal";

const saleBills = [
  {
    id: "SB-001",
    customerId: "CUS-001",
    customerName: "Rajkot Photo House",
    grandTotal: 15687,
    paidAmount: 10000,
    outstanding: 5687,
  },
  {
    id: "SB-002",
    customerId: "CUS-002",
    customerName: "Shreeji Frames",
    grandTotal: 16536,
    paidAmount: 16536,
    outstanding: 0,
  },
  {
    id: "SB-003",
    customerId: "CUS-003",
    customerName: "Royal Photo Studio",
    grandTotal: 6218,
    paidAmount: 0,
    outstanding: 6218,
  },
];

const customers = [
  {
    id: "CUS-001",
    name: "Rajkot Photo House",
    phone: "+91 98765 43210",
    city: "Rajkot",
  },
  {
    id: "CUS-002",
    name: "Shreeji Frames",
    phone: "+91 98254 12345",
    city: "Ahmedabad",
  },
  {
    id: "CUS-003",
    name: "Royal Photo Studio",
    phone: "+91 99045 67890",
    city: "Jamnagar",
  },
];

const initialPayments = [
  {
    id: "PAY-001",
    saleBillId: "SB-001",
    customerId: "CUS-001",
    customerName: "Rajkot Photo House",
    paymentDate: "2026-09-18",
    amount: 10000,
    paymentMode: "Bank Transfer",
    referenceNumber: "UTR928374",
    status: "Completed",
    notes: "Advance payment received.",
  },
  {
    id: "PAY-002",
    saleBillId: "SB-002",
    customerId: "CUS-002",
    customerName: "Shreeji Frames",
    paymentDate: "2026-09-18",
    amount: 16536,
    paymentMode: "UPI",
    referenceNumber: "UPI92837465",
    status: "Completed",
    notes: "Full payment received.",
  },
  {
    id: "PAY-003",
    saleBillId: "SB-003",
    customerId: "CUS-003",
    customerName: "Royal Photo Studio",
    paymentDate: "2026-09-19",
    amount: 0,
    paymentMode: "Cash",
    referenceNumber: "",
    status: "Pending",
    notes: "",
  },
];

export default function Payment() {
  const [payments, setPayments] = useState(initialPayments);

  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    paymentMode: "All",
    date: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deletePayment, setDeletePayment] = useState(null);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const search = filters.search.toLowerCase();

      const matchesSearch =
        !search ||
        payment.id.toLowerCase().includes(search) ||
        payment.saleBillId.toLowerCase().includes(search) ||
        payment.customerName.toLowerCase().includes(search) ||
        payment.referenceNumber
          ?.toLowerCase()
          .includes(search);

      const matchesStatus =
        filters.status === "All" ||
        payment.status === filters.status;

      const matchesMode =
        filters.paymentMode === "All" ||
        payment.paymentMode === filters.paymentMode;

      const matchesDate =
        !filters.date ||
        payment.paymentDate === filters.date;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMode &&
        matchesDate
      );
    });
  }, [payments, filters]);

  const summary = useMemo(() => {
    const totalReceived = payments
      .filter((payment) => payment.status === "Completed")
      .reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      );

    const pendingAmount = payments
      .filter((payment) => payment.status === "Pending")
      .reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      );

    const completedCount = payments.filter(
      (payment) => payment.status === "Completed"
    ).length;

    const pendingCount = payments.filter(
      (payment) => payment.status === "Pending"
    ).length;

    return {
      totalPayments: payments.length,
      totalReceived,
      pendingAmount,
      completedCount,
      pendingCount,
    };
  }, [payments]);

  const handleSave = (formData) => {
    if (editingPayment) {
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === editingPayment.id
            ? {
                ...payment,
                ...formData,
              }
            : payment
        )
      );
    } else {
      const newId = `PAY-${String(
        payments.length + 1
      ).padStart(3, "0")}`;

      setPayments((prev) => [
        ...prev,
        {
          id: newId,
          ...formData,
        },
      ]);
    }

    setShowForm(false);
    setEditingPayment(null);
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (!deletePayment) return;

    setPayments((prev) =>
      prev.filter(
        (payment) => payment.id !== deletePayment.id
      )
    );

    if (selectedPayment?.id === deletePayment.id) {
      setSelectedPayment(null);
    }

    setDeletePayment(null);
  };

  const handleExport = () => {
    console.log("Payment export:", filteredPayments);
  };

  return (
    <div className="space-y-6">
      <PaymentHeader
        onAdd={() => {
          setEditingPayment(null);
          setShowForm(true);
        }}
        onExport={handleExport}
      />

      <PaymentSummary summary={summary} />

      <PaymentFilters
        filters={filters}
        setFilters={setFilters}
      />

      <PaymentTable
        payments={filteredPayments}
        onView={setSelectedPayment}
        onEdit={handleEdit}
        onDelete={setDeletePayment}
      />

      {showForm && (
        <PaymentForm
          payment={editingPayment}
          saleBills={saleBills}
          customers={customers}
          onClose={() => {
            setShowForm(false);
            setEditingPayment(null);
          }}
          onSave={handleSave}
        />
      )}

      {selectedPayment && (
        <PaymentDetails
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onEdit={() => {
            handleEdit(selectedPayment);
            setSelectedPayment(null);
          }}
        />
      )}

      {deletePayment && (
        <DeletePaymentModal
          payment={deletePayment}
          onClose={() => setDeletePayment(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}