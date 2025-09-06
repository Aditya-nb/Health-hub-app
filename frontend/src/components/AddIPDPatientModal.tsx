import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { UserPlus, Calendar, User, Stethoscope } from "lucide-react";
import { Database } from "../types/database.types";

type Patient = Database["public"]["Tables"]["patients"]["Row"];
type Doctor = Database["public"]["Tables"]["doctors"]["Row"];
type IPDPatientInsert = Database["public"]["Tables"]["ipd_patients"]["Insert"];

interface AddIPDPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IPDPatientInsert) => Promise<void>;
  patients: Patient[];
  doctors: Doctor[];
}

const AddIPDPatientModal: React.FC<AddIPDPatientModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  patients,
  doctors,
}) => {
  const [formData, setFormData] = useState<IPDPatientInsert>({
    patient_id: "",
    room_number: "",
    bed_number: "",
    admission_date: new Date().toISOString().split("T")[0],
    condition: "",
    severity: "Stable",
    assigned_doctor_id: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patient_id) {
      newErrors.patient_id = "Please select a patient";
    }
    if (!formData.room_number.trim()) {
      newErrors.room_number = "Room number is required";
    }
    if (!formData.bed_number.trim()) {
      newErrors.bed_number = "Bed number is required";
    }
    if (!formData.admission_date) {
      newErrors.admission_date = "Admission date is required";
    }
    if (!formData.condition.trim()) {
      newErrors.condition = "Condition is required";
    }
    if (!formData.severity) {
      newErrors.severity = "Severity is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      patient_id: "",
      room_number: "",
      bed_number: "",
      admission_date: new Date().toISOString().split("T")[0],
      condition: "",
      severity: "Stable",
      assigned_doctor_id: null,
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (
    field: keyof IPDPatientInsert,
    value: string | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Admit New Patient</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label htmlFor="patient_id" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Select Patient</span>
            </Label>
            <Select
              value={formData.patient_id}
              onValueChange={(value) => handleInputChange("patient_id", value)}
            >
              <SelectTrigger
                className={errors.patient_id ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Choose a patient..." />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} - {patient.age} years, {patient.gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.patient_id && (
              <p className="text-sm text-red-500">{errors.patient_id}</p>
            )}
          </div>

          {/* Room and Bed */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room_number">Room Number</Label>
              <Input
                id="room_number"
                value={formData.room_number}
                onChange={(e) =>
                  handleInputChange("room_number", e.target.value)
                }
                placeholder="e.g., 101"
                className={errors.room_number ? "border-red-500" : ""}
              />
              {errors.room_number && (
                <p className="text-sm text-red-500">{errors.room_number}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bed_number">Bed Number</Label>
              <Input
                id="bed_number"
                value={formData.bed_number}
                onChange={(e) =>
                  handleInputChange("bed_number", e.target.value)
                }
                placeholder="e.g., A1"
                className={errors.bed_number ? "border-red-500" : ""}
              />
              {errors.bed_number && (
                <p className="text-sm text-red-500">{errors.bed_number}</p>
              )}
            </div>
          </div>

          {/* Admission Date */}
          <div className="space-y-2">
            <Label
              htmlFor="admission_date"
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Admission Date</span>
            </Label>
            <Input
              id="admission_date"
              type="date"
              value={formData.admission_date}
              onChange={(e) =>
                handleInputChange("admission_date", e.target.value)
              }
              className={errors.admission_date ? "border-red-500" : ""}
            />
            {errors.admission_date && (
              <p className="text-sm text-red-500">{errors.admission_date}</p>
            )}
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <Label htmlFor="condition">Medical Condition</Label>
            <Textarea
              id="condition"
              value={formData.condition}
              onChange={(e) => handleInputChange("condition", e.target.value)}
              placeholder="Describe the patient's condition..."
              className={errors.condition ? "border-red-500" : ""}
              rows={3}
            />
            {errors.condition && (
              <p className="text-sm text-red-500">{errors.condition}</p>
            )}
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label htmlFor="severity">Severity</Label>
            <Select
              value={formData.severity || "Stable"}
              onValueChange={(value) => handleInputChange("severity", value)}
            >
              <SelectTrigger
                className={errors.severity ? "border-red-500" : ""}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="Stable">Stable</SelectItem>
                <SelectItem value="Recovering">Recovering</SelectItem>
              </SelectContent>
            </Select>
            {errors.severity && (
              <p className="text-sm text-red-500">{errors.severity}</p>
            )}
          </div>

          {/* Assigned Doctor */}
          <div className="space-y-2">
            <Label
              htmlFor="assigned_doctor_id"
              className="flex items-center space-x-2"
            >
              <Stethoscope className="h-4 w-4" />
              <span>Assign Doctor (Optional)</span>
            </Label>
            <Select
              value={formData.assigned_doctor_id || ""}
              onValueChange={(value) =>
                handleInputChange("assigned_doctor_id", value || null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a doctor (optional)..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No doctor assigned</SelectItem>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    Dr. {doctor.name} - {doctor.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Admitting..." : "Admit Patient"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddIPDPatientModal;
