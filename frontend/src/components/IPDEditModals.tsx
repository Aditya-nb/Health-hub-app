import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Heart,
  Thermometer,
  Activity,
  Pill,
  Stethoscope,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Database } from "../types/database.types";
import { useVitals } from "../hooks/useVitals";
import { useMedicineSchedule } from "../hooks/useMedicineSchedule";
import { useIVSchedule } from "../hooks/useIVSchedule";
import { useDoctorVisits } from "../hooks/useDoctorVisits";

// Types for all the data structures
export type VitalRecord = Database["public"]["Tables"]["vitals"]["Row"];
export type MedicineRecord =
  Database["public"]["Tables"]["medicine_schedule"]["Row"];
export type IVRecord = Database["public"]["Tables"]["iv_schedule"]["Row"];
export type DoctorVisit = Database["public"]["Tables"]["doctor_visits"]["Row"];

// Vitals Edit Modal
interface VitalsEditModalProps {
  vitals: VitalRecord[];
  onUpdate: () => void;
  ipdPatientId: string;
}

export const VitalsEditModal: React.FC<VitalsEditModalProps> = ({
  vitals,
  onUpdate,
  ipdPatientId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingVital, setEditingVital] = useState<VitalRecord | null>(null);
  const [formData, setFormData] = useState<Partial<VitalRecord>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addVital, updateVital, deleteVital } = useVitals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const vitalData = {
        ipd_patient_id: ipdPatientId,
        time: formData.time || "",
        heart_rate: formData.heart_rate || 0,
        temperature: formData.temperature || 0,
        blood_pressure: formData.blood_pressure || "",
        oxygen_saturation: formData.oxygen_saturation || 0,
        notes: formData.notes || "",
      };

      if (editingVital) {
        await updateVital(editingVital.id, vitalData);
      } else {
        await addVital(vitalData);
      }

      onUpdate();
      setEditingVital(null);
      setFormData({});
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving vital:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVital(id);
      onUpdate();
    } catch (error) {
      console.error("Error deleting vital:", error);
    }
  };

  const openEdit = (vital?: VitalRecord) => {
    setEditingVital(vital || null);
    setFormData(vital || {});
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Edit className="h-4 w-4 mr-2" />
          Edit Vitals
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Vitals</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Button */}
          <Button onClick={() => openEdit()} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add New Vital Record
          </Button>

          {/* Existing Vitals List */}
          <div className="space-y-4">
            {vitals.map((vital) => (
              <Card key={vital.id} className="border border-border/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{vital.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <div>
                          <p className="text-sm font-medium">
                            {vital.heart_rate} bpm
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Thermometer className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="text-sm font-medium">
                            {vital.temperature}°F
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">
                            {vital.blood_pressure}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {vital.oxygen_saturation}% O2
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(vital)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(vital.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {vital.notes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {vital.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">
              {editingVital ? "Edit Vital Record" : "Add New Vital Record"}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
                <Input
                  id="heart_rate"
                  type="number"
                  value={formData.heart_rate || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      heart_rate: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="temperature">Temperature (°F)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={formData.temperature || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      temperature: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="blood_pressure">Blood Pressure</Label>
                <Input
                  id="blood_pressure"
                  placeholder="120/80"
                  value={formData.blood_pressure || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      blood_pressure: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="oxygen_saturation">Oxygen Saturation (%)</Label>
                <Input
                  id="oxygen_saturation"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.oxygen_saturation || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      oxygen_saturation: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setEditingVital(null);
                  setFormData({});
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingVital ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Medicine Edit Modal
interface MedicineEditModalProps {
  medicines: MedicineRecord[];
  onUpdate: () => void;
  ipdPatientId: string;
}

export const MedicineEditModal: React.FC<MedicineEditModalProps> = ({
  medicines,
  onUpdate,
  ipdPatientId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineRecord | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<MedicineRecord>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addSchedule, updateSchedule, deleteSchedule } = useMedicineSchedule();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const medicineData = {
        ipd_patient_id: ipdPatientId,
        time: formData.time || "",
        medicine: formData.medicine || "",
        dosage: formData.dosage || "",
        frequency: formData.frequency || "",
        status:
          (formData.status as "Given" | "Pending" | "Scheduled" | "Missed") ||
          "Scheduled",
        nurse: formData.nurse || "",
        notes: formData.notes || "",
      };

      if (editingMedicine) {
        await updateSchedule(editingMedicine.id, medicineData);
      } else {
        await addSchedule(medicineData);
      }

      onUpdate();
      setEditingMedicine(null);
      setFormData({});
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving medicine:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSchedule(id);
      onUpdate();
    } catch (error) {
      console.error("Error deleting medicine:", error);
    }
  };

  const openEdit = (medicine?: MedicineRecord) => {
    setEditingMedicine(medicine || null);
    setFormData(medicine || {});
    setIsOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Given":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Missed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Edit className="h-4 w-4 mr-2" />
          Edit Medicines
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Medicine Schedule</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Button onClick={() => openEdit()} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add New Medicine
          </Button>

          <div className="space-y-4">
            {medicines.map((med) => (
              <Card key={med.id} className="border border-border/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Pill className="h-4 w-4 text-blue-500" />
                        <p className="font-medium">{med.medicine}</p>
                        <Badge className={getStatusColor(med.status)}>
                          {med.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {med.dosage} • {med.frequency} • {med.time}
                      </p>
                      {med.nurse && (
                        <p className="text-sm text-muted-foreground">
                          Nurse: {med.nurse}
                        </p>
                      )}
                      {med.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {med.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(med)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(med.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">
              {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="medicine">Medicine Name</Label>
                <Input
                  id="medicine"
                  value={formData.medicine || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, medicine: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={formData.dosage || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, dosage: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Input
                  id="frequency"
                  value={formData.frequency || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || "Scheduled"}
                  onValueChange={(
                    value: "Given" | "Pending" | "Scheduled" | "Missed"
                  ) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Given">Given</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Missed">Missed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nurse">Nurse</Label>
                <Input
                  id="nurse"
                  value={formData.nurse || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, nurse: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setEditingMedicine(null);
                  setFormData({});
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editingMedicine
                  ? "Update"
                  : "Add"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// IV Edit Modal
interface IVEditModalProps {
  ivRecords: IVRecord[];
  onUpdate: () => void;
  ipdPatientId: string;
}

export const IVEditModal: React.FC<IVEditModalProps> = ({
  ivRecords,
  onUpdate,
  ipdPatientId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingIV, setEditingIV] = useState<IVRecord | null>(null);
  const [formData, setFormData] = useState<Partial<IVRecord>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addSchedule, updateSchedule, deleteSchedule } = useIVSchedule();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const ivData = {
        ipd_patient_id: ipdPatientId,
        time: formData.time || "",
        fluid: formData.fluid || "",
        volume: formData.volume || "",
        rate: formData.rate || "",
        status:
          (formData.status as
            | "Scheduled"
            | "Running"
            | "Completed"
            | "Stopped") || "Scheduled",
        nurse: formData.nurse || "",
        notes: formData.notes || "",
      };

      if (editingIV) {
        await updateSchedule(editingIV.id, ivData);
      } else {
        await addSchedule(ivData);
      }

      onUpdate();
      setEditingIV(null);
      setFormData({});
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving IV:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSchedule(id);
      onUpdate();
    } catch (error) {
      console.error("Error deleting IV:", error);
    }
  };

  const openEdit = (iv?: IVRecord) => {
    setEditingIV(iv || null);
    setFormData(iv || {});
    setIsOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Running":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      case "Scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "Stopped":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Edit className="h-4 w-4 mr-2" />
          Edit IV Fluids
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage IV Fluid Schedule</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Button onClick={() => openEdit()} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add New IV Fluid
          </Button>

          <div className="space-y-4">
            {ivRecords.map((iv) => (
              <Card key={iv.id} className="border border-border/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <p className="font-medium">{iv.fluid}</p>
                        <Badge className={getStatusColor(iv.status)}>
                          {iv.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {iv.volume} • {iv.rate} • {iv.time}
                      </p>
                      {iv.nurse && (
                        <p className="text-sm text-muted-foreground">
                          Nurse: {iv.nurse}
                        </p>
                      )}
                      {iv.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {iv.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(iv)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(iv.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">
              {editingIV ? "Edit IV Fluid" : "Add New IV Fluid"}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fluid">Fluid Type</Label>
                <Input
                  id="fluid"
                  value={formData.fluid || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, fluid: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="volume">Volume</Label>
                <Input
                  id="volume"
                  value={formData.volume || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, volume: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="rate">Rate</Label>
                <Input
                  id="rate"
                  value={formData.rate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, rate: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || "Scheduled"}
                  onValueChange={(
                    value: "Scheduled" | "Running" | "Completed" | "Stopped"
                  ) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Running">Running</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Stopped">Stopped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nurse">Nurse</Label>
                <Input
                  id="nurse"
                  value={formData.nurse || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, nurse: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setEditingIV(null);
                  setFormData({});
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingIV ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Doctor Visit Edit Modal
interface DoctorVisitEditModalProps {
  visits: DoctorVisit[];
  onUpdate: () => void;
  ipdPatientId: string;
}

export const DoctorVisitEditModal: React.FC<DoctorVisitEditModalProps> = ({
  visits,
  onUpdate,
  ipdPatientId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<DoctorVisit | null>(null);
  const [formData, setFormData] = useState<Partial<DoctorVisit>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addVisit, updateVisit, deleteVisit } = useDoctorVisits();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const visitData = {
        ipd_patient_id: ipdPatientId,
        doctor_id: formData.doctor_id || null,
        time: formData.time || "",
        visit_type: formData.visit_type || "",
        notes: formData.notes || null,
        vitals_status:
          (formData.vitals_status as
            | "Stable"
            | "Improving"
            | "Critical"
            | "Declining") || "Stable",
        prescription: formData.prescription || null,
      };

      if (editingVisit) {
        await updateVisit(editingVisit.id, visitData);
      } else {
        await addVisit(visitData);
      }

      onUpdate();
      setEditingVisit(null);
      setFormData({});
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving visit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVisit(id);
      onUpdate();
    } catch (error) {
      console.error("Error deleting visit:", error);
    }
  };

  const openEdit = (visit?: DoctorVisit) => {
    setEditingVisit(visit || null);
    setFormData(visit || {});
    setIsOpen(true);
  };

  const getVitalsStatusColor = (status: string) => {
    switch (status) {
      case "Stable":
        return "bg-green-100 text-green-800";
      case "Improving":
        return "bg-blue-100 text-blue-800";
      case "Critical":
        return "bg-red-100 text-red-800";
      case "Declining":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Edit className="h-4 w-4 mr-2" />
          Edit Visits
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Doctor Visits</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Button onClick={() => openEdit()} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add New Visit
          </Button>

          <div className="space-y-4">
            {visits.map((visit) => (
              <Card key={visit.id} className="border border-border/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Stethoscope className="h-4 w-4 text-blue-500" />
                        <p className="font-medium">Dr. {visit.doctor_id}</p>
                        <Badge
                          className={getVitalsStatusColor(
                            visit.vitals_status || "Stable"
                          )}
                        >
                          {visit.vitals_status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {visit.time} • {visit.visit_type}
                      </p>
                      {visit.notes && (
                        <p className="text-sm mt-1">{visit.notes}</p>
                      )}
                      {visit.prescription && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <p className="font-medium text-blue-700">
                            Prescription:
                          </p>
                          <p className="text-blue-600">{visit.prescription}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(visit)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(visit.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">
              {editingVisit ? "Edit Visit" : "Add New Visit"}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="doctor_id">Doctor ID</Label>
                <Input
                  id="doctor_id"
                  value={formData.doctor_id || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, doctor_id: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="visit_type">Visit Type</Label>
                <Input
                  id="visit_type"
                  value={formData.visit_type || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, visit_type: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="vitals_status">Vitals Status</Label>
                <Select
                  value={formData.vitals_status || "Stable"}
                  onValueChange={(
                    value: "Stable" | "Improving" | "Critical" | "Declining"
                  ) => setFormData({ ...formData, vitals_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Stable">Stable</SelectItem>
                    <SelectItem value="Improving">Improving</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="Declining">Declining</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="prescription">Prescription</Label>
                <Textarea
                  id="prescription"
                  value={formData.prescription || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, prescription: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setEditingVisit(null);
                  setFormData({});
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingVisit ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
