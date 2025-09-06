import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
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
import { FileText, Plus, Search, Calendar, User } from "lucide-react";
import { toast } from "../hooks/use-toast";
import { useMedicalRecords } from "../hooks/useMedicalRecords";
import { usePrescriptions } from "../hooks/usePrescriptions";
import { usePatients } from "../hooks/usePatients";
import { useDoctors } from "../hooks/useDoctors";
import { Database } from "../types/database.types";

type MedicalRecord = Database["public"]["Tables"]["medical_records"]["Row"];
type MedicalRecordInsert =
  Database["public"]["Tables"]["medical_records"]["Insert"];
type MedicalRecordUpdate =
  Database["public"]["Tables"]["medical_records"]["Update"];
type Prescription = Database["public"]["Tables"]["prescriptions"]["Row"];
type PrescriptionInsert =
  Database["public"]["Tables"]["prescriptions"]["Insert"];
type Patient = Database["public"]["Tables"]["patients"]["Row"];
type Doctor = Database["public"]["Tables"]["doctors"]["Row"];

const EMR = () => {
  const {
    records,
    loading: recordsLoading,
    error: recordsError,
    addRecord,
    updateRecord,
    deleteRecord,
    searchRecords,
    fetchRecords,
  } = useMedicalRecords();
  const {
    prescriptions,
    loading: prescriptionsLoading,
    error: prescriptionsError,
    addPrescription,
    updatePrescription,
    deletePrescription,
    searchPrescriptions,
    fetchPrescriptions,
  } = usePrescriptions();
  const { patients } = usePatients();
  const { doctors } = useDoctors();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<MedicalRecordInsert>>({
    patient_id: "",
    doctor_id: "",
    date: new Date().toISOString().split("T")[0],
    condition: "",
    notes: "",
  });

  useEffect(() => {
    // Fetch all records for all patients initially
    // In a real app, you might want to implement a different strategy
    // For now, we'll just fetch when user selects a specific patient
  }, []);

  // Helper function to get patient name by ID
  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.name : `Patient ${patientId}`;
  };

  // Helper function to get doctor name by ID
  const getDoctorName = (doctorId: string | null) => {
    if (!doctorId) return "Unknown Doctor";
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor ? doctor.name : `Doctor ${doctorId}`;
  };

  // Helper function to get patient ABHA ID
  const getPatientAbhaId = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.abha_id || "Not provided" : "Unknown";
  };

  const filteredRecords = records.filter((record) => {
    const patient = patients.find((p) => p.id === record.patient_id);
    const matchesSearch =
      patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.abha_id?.includes(searchTerm) ||
      record.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPatient =
      selectedPatient === "all" || record.patient_id === selectedPatient;
    return matchesSearch && matchesPatient;
  });

  const handleAddRecord = async () => {
    if (!newRecord.patient_id || !newRecord.condition) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await addRecord({
        patient_id: newRecord.patient_id,
        doctor_id: newRecord.doctor_id || null,
        date: newRecord.date || new Date().toISOString().split("T")[0],
        condition: newRecord.condition,
        notes: newRecord.notes || null,
      });

      setNewRecord({
        patient_id: "",
        doctor_id: "",
        date: new Date().toISOString().split("T")[0],
        condition: "",
        notes: "",
      });
      setIsAddDialogOpen(false);
      toast({
        title: "EMR Record Added",
        description: `Medical record created for ${getPatientName(
          newRecord.patient_id
        )}`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add medical record",
        variant: "destructive",
      });
    }
  };

  const handlePatientSelect = (patientId: string) => {
    setNewRecord((prev) => ({
      ...prev,
      patient_id: patientId,
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">
          Electronic Medical Records
        </h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="ios-button">
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl ios-card max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Medical Record</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient">Patient *</Label>
                  <Select
                    value={newRecord.patient_id}
                    onValueChange={handlePatientSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} ({patient.abha_id || "No ABHA ID"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="doctor">Doctor</Label>
                  <Select
                    value={newRecord.doctor_id || ""}
                    onValueChange={(value) =>
                      setNewRecord({ ...newRecord, doctor_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newRecord.date}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="condition">Condition/Diagnosis *</Label>
                  <Input
                    id="condition"
                    value={newRecord.condition}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, condition: e.target.value })
                    }
                    placeholder="e.g., Hypertension, Diabetes"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newRecord.notes || ""}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, notes: e.target.value })
                  }
                  placeholder="Additional notes, treatment plan, observations..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button onClick={handleAddRecord} className="ios-button">
                  Add Record
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name, ABHA ID, or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedPatient} onValueChange={setSelectedPatient}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by patient" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Patients</SelectItem>
            {patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <Card key={record.id} className="ios-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {getPatientName(record.patient_id)}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          ABHA: {getPatientAbhaId(record.patient_id)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-foreground">
                            Condition
                          </p>
                          <p className="text-muted-foreground">
                            {record.condition}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Doctor</p>
                          <p className="text-muted-foreground">
                            {getDoctorName(record.doctor_id)}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Date</p>
                          <p className="text-muted-foreground">
                            {new Date(record.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {record.notes && (
                        <div className="mt-3">
                          <p className="font-medium text-foreground text-sm">
                            Notes
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {record.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Created:{" "}
                        {new Date(record.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="ios-card">
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || selectedPatient !== "all"
                  ? "No medical records found matching your criteria"
                  : "No medical records available"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EMR;
