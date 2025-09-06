import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Pill,
  Edit,
  CalendarPlus,
} from "lucide-react";
import { Database } from "../types/database.types";
import { useAppointments } from "../hooks/useAppointments";
import { useMedicalRecords } from "../hooks/useMedicalRecords";
import { usePrescriptions } from "../hooks/usePrescriptions";
import { useDoctors } from "../hooks/useDoctors";

type Patient = Database["public"]["Tables"]["patients"]["Row"];
type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
type MedicalRecord = Database["public"]["Tables"]["medical_records"]["Row"];
type Prescription = Database["public"]["Tables"]["prescriptions"]["Row"];

interface PatientDetailsProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (patient: Patient) => void;
  onBookAppointment: () => void;
}

const PatientDetails: React.FC<PatientDetailsProps> = ({
  patient,
  isOpen,
  onClose,
  onEdit,
  onBookAppointment,
}) => {
  const { appointments } = useAppointments();
  const { records } = useMedicalRecords();
  const { prescriptions } = usePrescriptions();
  const { doctors } = useDoctors();

  // Filter data for current patient
  const patientAppointments = appointments.filter(
    (app) => app.patient_id === patient.id
  );
  const patientMedicalRecords = records.filter(
    (record) => record.patient_id === patient.id
  );
  const patientPrescriptions = prescriptions.filter(
    (presc) => presc.patient_id === patient.id
  );

  // Helper function to get doctor name by ID
  const getDoctorName = (doctorId: string | null) => {
    if (!doctorId) return "Unknown Doctor";
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor ? doctor.name : `Doctor ${doctorId}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Patient Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Basic Info */}
          <Card className="ios-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={patient.photo_url || ""}
                    alt={patient.name}
                  />
                  <AvatarFallback className="text-lg">
                    {patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Patient ID
                      </p>
                      <p className="font-semibold">{patient.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-semibold">{patient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Age & Gender
                      </p>
                      <p className="font-semibold">
                        {patient.age} years, {patient.gender}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ABHA ID</p>
                      <p className="font-semibold">
                        {patient.abha_id || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{patient.contact || "Not provided"}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{patient.email || "Not provided"}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                      <span>{patient.address || "Not provided"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment History */}
          <Card className="ios-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Appointment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patientAppointments && patientAppointments.length > 0 ? (
                <div className="space-y-3">
                  {patientAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex justify-between items-center p-3 bg-accent/30 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{appointment.type}</p>
                        <p className="text-sm text-muted-foreground">
                          with {getDoctorName(appointment.doctor_id)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(appointment.date).toLocaleDateString()} at{" "}
                          {appointment.time}
                        </p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "Cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No appointment history available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Medical History */}
          <Card className="ios-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Medical History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patientMedicalRecords && patientMedicalRecords.length > 0 ? (
                <div className="space-y-3">
                  {patientMedicalRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-3 bg-accent/30 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{record.condition}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {record.notes || "No additional notes"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Doctor: {getDoctorName(record.doctor_id)}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No medical history available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Prescription History */}
          <Card className="ios-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="h-5 w-5 mr-2" />
                Prescription History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patientPrescriptions && patientPrescriptions.length > 0 ? (
                <div className="space-y-3">
                  {patientPrescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="p-3 bg-accent/30 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {prescription.medication}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {prescription.dosage}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Prescribed by:{" "}
                            {getDoctorName(prescription.doctor_id)}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(prescription.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No prescription history available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onEdit(patient)}
              className="rounded-xl"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Patient
            </Button>
            <Button onClick={onBookAppointment} className="ios-button">
              <CalendarPlus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientDetails;
