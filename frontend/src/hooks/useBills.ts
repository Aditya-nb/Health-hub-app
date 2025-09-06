import { useState, useEffect } from "react";
import { api } from "../lib/api";

interface BillItem {
  id: string;
  description: string;
  amount: number;
}

interface Bill {
  id: string;
  patient_id: string;
  total_amount: number;
  paid_amount: number;
  status: "Paid" | "Partially Paid" | "Unpaid";
  created_at: string;
  bill_items: BillItem[];
}

interface PaymentDetails {
  amount: number;
  payment_method: string;
  transaction_id?: string;
}

export function useBills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = async (patientId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await api.bills.getAll({ patientId });

      if (fetchError) throw new Error(fetchError);

      setBills(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bills");
    } finally {
      setLoading(false);
    }
  };

  const markBillAsPaid = async (
    billId: string,
    paymentDetails: PaymentDetails
  ) => {
    try {
      setError(null);

      // Get the current bill
      const { data: currentBill, error: fetchError } = await api.bills.getById(
        billId
      );

      if (fetchError) throw new Error(fetchError);

      const newPaidAmount =
        (currentBill.paid_amount || 0) + paymentDetails.amount;
      const newStatus =
        newPaidAmount >= currentBill.total_amount
          ? "Paid"
          : newPaidAmount > 0
          ? "Partially Paid"
          : "Unpaid";

      // Update the bill
      const { error: updateError } = await api.bills.update(billId, {
        paid_amount: newPaidAmount,
        status: newStatus,
      });

      if (updateError) throw new Error(updateError);

      // Note: Payment recording would need a separate API endpoint
      // For now, just refresh the bills list
      if (currentBill.patient_id) {
        await fetchBills(currentBill.patient_id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment");
      throw err;
    }
  };

  return {
    bills,
    loading,
    error,
    fetchBills,
    markBillAsPaid,
  };
}
