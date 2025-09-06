import React, { useState, useEffect } from "react";
import { useBills } from "../hooks/useBills";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { format } from "date-fns";
import { toast } from "sonner";

interface BillManagementProps {
  patientId: string;
}

export function BillManagement({ patientId }: BillManagementProps) {
  const { bills, loading, error, fetchBills, markBillAsPaid } = useBills();

  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    fetchBills(patientId);
  }, [patientId]);

  const handlePayment = async () => {
    try {
      if (!selectedBill) return;

      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid payment amount");
        return;
      }

      if (!paymentMethod) {
        toast.error("Please select a payment method");
        return;
      }

      await markBillAsPaid(selectedBill.id, {
        amount,
        payment_method: paymentMethod,
        transaction_id: transactionId || undefined,
      });

      toast.success("Payment recorded successfully");
      setIsPaymentDialogOpen(false);
      setPaymentAmount("");
      setPaymentMethod("");
      setTransactionId("");
      setSelectedBill(null);
    } catch (error) {
      toast.error("Failed to record payment");
    }
  };

  if (loading) return <div>Loading bills...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Bills</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Paid Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills.map((bill) => (
            <TableRow key={bill.id}>
              <TableCell>
                {format(new Date(bill.created_at), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>{bill.bill_items?.length || 0} items</TableCell>
              <TableCell>₹{bill.total_amount.toFixed(2)}</TableCell>
              <TableCell>₹{(bill.paid_amount || 0).toFixed(2)}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    bill.status === "Paid"
                      ? "bg-green-100 text-green-800"
                      : bill.status === "Partially Paid"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {bill.status}
                </span>
              </TableCell>
              <TableCell>
                <Dialog
                  open={isPaymentDialogOpen && selectedBill?.id === bill.id}
                  onOpenChange={setIsPaymentDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedBill(bill)}
                      disabled={bill.status === "Paid"}
                    >
                      {bill.status === "Paid" ? "Paid" : "Make Payment"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Make Payment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Bill Amount</Label>
                        <Input
                          value={`₹${bill.total_amount.toFixed(2)}`}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Amount Paid</Label>
                        <Input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder="Enter amount"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <Select
                          value={paymentMethod}
                          onValueChange={setPaymentMethod}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Card">Card</SelectItem>
                            <SelectItem value="UPI">UPI</SelectItem>
                            <SelectItem value="Bank Transfer">
                              Bank Transfer
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Transaction ID (Optional)</Label>
                        <Input
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="Enter transaction ID"
                        />
                      </div>
                      <Button className="w-full" onClick={handlePayment}>
                        Record Payment
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
