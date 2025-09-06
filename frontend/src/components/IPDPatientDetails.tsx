import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ArrowLeft,
  User,
  Heart,
  Thermometer,
  Activity,
  Clock,
  Pill,
  Stethoscope,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  VitalsEditModal,
  MedicineEditModal,
  IVEditModal,
  DoctorVisitEditModal,
  VitalRecord,
  MedicineRecord,
  IVRecord,
  DoctorVisit,
} from "./IPDEditModals";
import { useVitals } from "../hooks/useVitals";
import { useDoctorVisits } from "../hooks/useDoctorVisits";
import { useMedicineSchedule } from "../hooks/useMedicineSchedule";
import { useIVSchedule } from "../hooks/useIVSchedule";
import { Database } from "../types/database.types";

type IPDPatient = Database["public"]["Tables"]["ipd_patients"]["Row"];

interface IPDPatientDetailsProps {
  patient: IPDPatient;
  onBack: () => void;
}

const IPDPatientDetails: React.FC<IPDPatientDetailsProps> = ({
  patient,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  const {
    vitals,
    loading: vitalsLoading,
    fetchVitals,
    addVital,
    updateVital,
    deleteVital,
  } = useVitals();
  const {
    visits: doctorVisits,
    loading: visitsLoading,
    fetchVisits,
    addVisit,
    updateVisit,
    deleteVisit,
  } = useDoctorVisits();
  const {
    schedules: medicineSchedules,
    loading: medicineLoading,
    fetchSchedules: fetchMedicineSchedules,
    addSchedule: addMedicineSchedule,
    updateSchedule: updateMedicineSchedule,
    deleteSchedule: deleteMedicineSchedule,
  } = useMedicineSchedule();
  const {
    schedules: ivSchedules,
    loading: ivLoading,
    fetchSchedules: fetchIVSchedules,
    addSchedule: addIVSchedule,
    updateSchedule: updateIVSchedule,
    deleteSchedule: deleteIVSchedule,
  } = useIVSchedule();

  useEffect(() => {
    if (patient?.id) {
      fetchVitals(patient.id);
      fetchVisits(patient.id);
      fetchMedicineSchedules(patient.id);
      fetchIVSchedules(patient.id);
    }
  }, [patient?.id]);

  // Convert vitals for chart
  const chartData = vitals.map((vital) => ({
    time: vital.time,
    heartRate: vital.heart_rate,
    temperature: vital.temperature,
    oxygen: vital.oxygen_saturation,
    bp: parseInt(vital.blood_pressure.split("/")[0]), // systolic BP
  }));

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Given":
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Running":
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Missed":
      case "Stopped":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper functions to refresh data after modal updates
  const handleVitalsUpdate = () => {
    fetchVitals(patient.id);
  };

  const handleMedicineUpdate = () => {
    fetchMedicineSchedules(patient.id);
  };

  const handleIVUpdate = () => {
    fetchIVSchedules(patient.id);
  };

  const handleVisitsUpdate = () => {
    fetchVisits(patient.id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to IPD List
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {patient.patient_id}
            </h1>
            <p className="text-muted-foreground">
              Room {patient.room_number}, Bed {patient.bed_number}
            </p>
          </div>
        </div>
        <Badge className={getSeverityColor(patient.severity)}>
          {patient.severity}
        </Badge>
      </div>

      {/* Patient Info Card */}
      <Card className="ios-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Patient ID</p>
                <p className="font-semibold">{patient.id}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Condition</p>
              <p className="font-semibold">{patient.condition}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admission Date</p>
              <p className="font-semibold">
                {new Date(patient.admission_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assigned Doctor</p>
              <p className="font-semibold">
                {patient.assigned_doctor_id || "Not assigned"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tabs with Edit Buttons */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="medicines">Medicines</TabsTrigger>
          <TabsTrigger value="iv">IV Fluids</TabsTrigger>
          <TabsTrigger value="visits">Doctor Visits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="ios-card">
              <CardHeader>
                <CardTitle>Current Vitals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Heart Rate
                      </p>
                      <p className="font-semibold">
                        {vitals[0]?.heart_rate || "N/A"} bpm
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Temperature
                      </p>
                      <p className="font-semibold">
                        {vitals[0]?.temperature || "N/A"}°F
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Oxygen Saturation
                      </p>
                      <p className="font-semibold">
                        {vitals[0]?.oxygen_saturation || "N/A"}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Last Updated
                      </p>
                      <p className="font-semibold">
                        {vitals[0]?.time
                          ? new Date(vitals[0].time).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-6">
          <Card className="ios-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Vitals Chart - Today</CardTitle>
              <VitalsEditModal
                vitals={vitals}
                onUpdate={handleVitalsUpdate}
                ipdPatientId={patient.id}
              />
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="heartRate"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Heart Rate (bpm)"
                    />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#f97316"
                      strokeWidth={2}
                      name="Temperature (°F)"
                    />
                    <Line
                      type="monotone"
                      dataKey="oxygen"
                      stroke="#22c55e"
                      strokeWidth={2}
                      name="Oxygen Sat (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Vitals Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2">Time</th>
                      <th className="text-left p-2">Heart Rate</th>
                      <th className="text-left p-2">Temperature</th>
                      <th className="text-left p-2">Blood Pressure</th>
                      <th className="text-left p-2">O2 Sat</th>
                      <th className="text-left p-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vitals.map((vital) => (
                      <tr key={vital.id} className="border-b border-border/50">
                        <td className="p-2 font-medium">{vital.time}</td>
                        <td className="p-2">{vital.heart_rate} bpm</td>
                        <td className="p-2">{vital.temperature}°F</td>
                        <td className="p-2">{vital.blood_pressure}</td>
                        <td className="p-2">{vital.oxygen_saturation}%</td>
                        <td className="p-2 text-muted-foreground">
                          {vital.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medicines" className="space-y-6">
          <Card className="ios-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Pill className="h-5 w-5 mr-2" />
                Medicine Schedule
              </CardTitle>
              <MedicineEditModal
                medicines={medicineSchedules}
                onUpdate={handleMedicineUpdate}
                ipdPatientId={patient.id}
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medicineSchedules.map((med) => (
                  <div
                    key={med.id}
                    className="flex justify-between items-center p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium">{med.medicine}</p>
                        <Badge className={getStatusColor(med.status)}>
                          {med.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {med.dosage} • {med.frequency} • {med.time} •{" "}
                        {med.nurse}
                      </p>
                      {med.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {med.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="iv" className="space-y-6">
          <Card className="ios-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                IV Fluid Schedule
              </CardTitle>
              <IVEditModal
                ivRecords={ivSchedules}
                onUpdate={handleIVUpdate}
                ipdPatientId={patient.id}
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ivSchedules.map((iv) => (
                  <div
                    key={iv.id}
                    className="flex justify-between items-center p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium">{iv.fluid}</p>
                        <Badge className={getStatusColor(iv.status)}>
                          {iv.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {iv.volume} • {iv.rate} • {iv.time} • {iv.nurse}
                      </p>
                      {iv.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {iv.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits" className="space-y-6">
          <Card className="ios-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Stethoscope className="h-5 w-5 mr-2" />
                Doctor Visits Today
              </CardTitle>
              <DoctorVisitEditModal
                visits={doctorVisits}
                onUpdate={handleVisitsUpdate}
                ipdPatientId={patient.id}
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctorVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium">{visit.doctor_id}</p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {visit.time} • {visit.visit_type}
                        </p>
                      </div>
                      <Badge variant="secondary">{visit.vitals_status}</Badge>
                    </div>
                    <p className="text-sm mb-2">{visit.notes}</p>
                    {visit.prescription && (
                      <div className="p-2 bg-primary/10 rounded text-sm">
                        <p className="font-medium text-primary">
                          Prescription:
                        </p>
                        <p>{visit.prescription}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IPDPatientDetails;
