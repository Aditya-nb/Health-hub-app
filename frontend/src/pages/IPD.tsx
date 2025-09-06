import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Bed,
  User,
  Clock,
  Heart,
  Thermometer,
  Activity,
  UserPlus,
} from "lucide-react";
import IPDPatientDetails from "../components/IPDPatientDetails";
import AddIPDPatientModal from "../components/AddIPDPatientModal";
import { useIPDPatients } from "../hooks/useIPDPatients";
import { usePatients } from "../hooks/usePatients";
import { useDoctors } from "../hooks/useDoctors";
import { Database } from "../types/database.types";

type IPDPatient = Database["public"]["Tables"]["ipd_patients"]["Row"];
type IPDPatientInsert = Database["public"]["Tables"]["ipd_patients"]["Insert"];
type IPDPatientUpdate = Database["public"]["Tables"]["ipd_patients"]["Update"];

const IPD = () => {
  const {
    patients: ipdPatients,
    loading,
    error,
    addIPDPatient,
    updateIPDPatient,
    deleteIPDPatient,
    getIPDPatientById,
    getIPDPatientsByDoctor,
    getIPDPatientsBySeverity,
    getIPDPatientsByRoom,
    searchIPDPatients,
    refreshIPDPatients,
  } = useIPDPatients();
  const { patients } = usePatients();
  const { doctors } = useDoctors();

  const [selectedPatient, setSelectedPatient] = useState<IPDPatient | null>(
    null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Helper functions to get names
  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.name : `Patient ${patientId}`;
  };

  const getDoctorName = (doctorId: string | null) => {
    if (!doctorId) return "No doctor assigned";
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor ? doctor.name : `Doctor ${doctorId}`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "Stable":
        return "bg-green-100 text-green-800";
      case "Recovering":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePatientClick = (patient: IPDPatient) => {
    setSelectedPatient(patient);
  };

  const handleCloseDetails = () => {
    setSelectedPatient(null);
  };

  const handleAddPatient = async (patientData: IPDPatientInsert) => {
    try {
      await addIPDPatient(patientData);
      setIsAddModalOpen(false);
      refreshIPDPatients();
    } catch (error) {
      console.error("Error adding IPD patient:", error);
    }
  };

  if (selectedPatient) {
    return (
      <IPDPatientDetails
        patient={selectedPatient}
        onBack={handleCloseDetails}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">
          In-Patient Department (IPD)
        </h1>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="text-sm">
            <Bed className="h-4 w-4 mr-1" />
            {ipdPatients.length} Admitted Patients
          </Badge>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Admit Patient
          </Button>
        </div>
      </div>

      {/* IPD Patients List */}
      <div className="grid grid-cols-1 gap-4">
        {ipdPatients.map((patient) => (
          <Card
            key={patient.id}
            className="ios-card hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => handlePatientClick(patient)}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                        {getPatientName(patient.patient_id)}
                      </h3>
                      <Badge className={getSeverityColor(patient.severity)}>
                        {patient.severity}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p className="font-medium">Patient ID</p>
                        <p>{patient.id}</p>
                      </div>
                      <div>
                        <p className="font-medium">Room/Bed</p>
                        <p>
                          {patient.room_number}/{patient.bed_number}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Admitted</p>
                        <p>
                          {new Date(
                            patient.admission_date
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Doctor</p>
                        <p>{getDoctorName(patient.assigned_doctor_id)}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium text-foreground">
                        Condition: {patient.condition}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-2">
                    <div className="flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      N/A bpm
                    </div>
                    <div className="flex items-center">
                      <Thermometer className="h-3 w-3 mr-1" />
                      N/A°F
                    </div>
                    <div className="flex items-center">
                      <Activity className="h-3 w-3 mr-1" />
                      N/A%
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Last vitals: N/A
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ipdPatients.length === 0 && (
        <Card className="ios-card">
          <CardContent className="text-center py-8">
            <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No patients currently admitted
            </p>
            <Button onClick={() => setIsAddModalOpen(true)} variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Admit First Patient
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add IPD Patient Modal */}
      <AddIPDPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddPatient}
        patients={patients}
        doctors={doctors}
      />
    </div>
  );
};

export default IPD;
