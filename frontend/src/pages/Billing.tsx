import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { CreditCard, Plus, Search, Calendar, Trash2 } from "lucide-react";
import { toast } from "../hooks/use-toast";
import { BillManagement } from "../components/BillManagement";
import { usePatients } from "../hooks/usePatients";
import { Database } from "../types/database.types";

type Patient = Database["public"]["Tables"]["patients"]["Row"];
type Bill = Database["public"]["Tables"]["bills"]["Row"];
type BillItem = Database["public"]["Tables"]["bill_items"]["Row"];

const Billing = () => {
  const { patients } = usePatients();
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter patients based on search term
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.contact &&
        patient.contact.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">
          Billing Management
        </h1>
      </div>

      {/* Patient Selection */}
      <Card className="ios-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Patient Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients by name, ID, or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger className="w-80">
                <SelectValue placeholder="Select a patient for billing" />
              </SelectTrigger>
              <SelectContent>
                {filteredPatients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} - {patient.id}
                    {patient.contact && ` - ${patient.contact}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedPatient && (
            <div className="mt-4 p-4 bg-accent/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Selected Patient:</p>
              <p className="font-medium">
                {patients.find((p) => p.id === selectedPatient)?.name} (ID:{" "}
                {selectedPatient})
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bill Management Component */}
      {selectedPatient ? (
        <BillManagement patientId={selectedPatient} />
      ) : (
        <Card className="ios-card">
          <CardContent className="text-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Please select a patient to manage their billing
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Billing;
