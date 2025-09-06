import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Badge } from "./ui/badge";
import { ArrowLeft, Clock, User, Calendar as CalendarIcon } from "lucide-react";
import { useAppointments } from "../hooks/useAppointments";
import { useDoctors } from "../hooks/useDoctors";
import { usePatients } from "../hooks/usePatients";
import { Database } from "../types/database.types";

type Doctor = Database["public"]["Tables"]["doctors"]["Row"];
type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
type Patient = Database["public"]["Tables"]["patients"]["Row"];

interface DoctorScheduleProps {
  doctor: Doctor;
  onBack: () => void;
}

const DoctorSchedule: React.FC<DoctorScheduleProps> = ({ doctor, onBack }) => {
  const { appointments, loading, getAppointmentsByDoctor } = useAppointments();
  const { doctors } = useDoctors();
  const { patients } = usePatients();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  // Helper function to get patient name by ID
  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.name : `Patient ${patientId}`;
  };

  // Fetch appointments for the doctor and selected date
  const todaysAppointments = appointments.filter(
    (a) =>
      a.doctor_id === doctor.id &&
      (!selectedDate || a.date === selectedDate.toISOString().split("T")[0])
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Select a date";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Doctors
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {doctor.name}
            </h1>
            <p className="text-muted-foreground">
              {doctor.specialization} Schedule
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <Card className="ios-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full p-3"
              />
              <div className="px-3 pb-3">
                <div className="text-xs space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-100 rounded border border-green-200"></div>
                    <span className="text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-100 rounded border border-red-200"></div>
                    <span className="text-muted-foreground">Unavailable</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments for Selected Date */}
        <div className="lg:col-span-2">
          <Card className="ios-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Appointments
                </div>
                <Badge variant="secondary">
                  {todaysAppointments.length} appointments
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatDate(selectedDate)}
              </p>
            </CardHeader>
            <CardContent>
              {todaysAppointments.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {todaysAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {getPatientName(appointment.patient_id)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {appointment.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium">
                          {appointment.time}
                        </span>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No appointments scheduled for this date
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Doctor Info Summary */}
      <Card className="ios-card">
        <CardHeader>
          <CardTitle>Doctor Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Specialization</p>
              <p className="font-medium">{doctor.specialization}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Experience</p>
              <p className="font-medium">{doctor.experience || "N/A"} years</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              <p className="font-medium">{doctor.contact || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{doctor.email || "Not provided"}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Availability</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {doctor.availability && doctor.availability.length > 0 ? (
                doctor.availability.map((day, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {day}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  Not specified
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorSchedule;
