import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Calendar } from "../components/ui/calendar";
import { Button } from "../components/ui/button";
import {
  User,
  Calendar as CalendarIcon,
  FileText,
  Building2,
  TrendingUp,
  Clock,
  Bed,
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePatients } from "../hooks/usePatients";
import { useDoctors } from "../hooks/useDoctors";
import { useAppointments } from "../hooks/useAppointments";
import { useIPDPatients } from "../hooks/useIPDPatients";
import { Database } from "../types/database.types";

type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
type Patient = Database["public"]["Tables"]["patients"]["Row"];
type Doctor = Database["public"]["Tables"]["doctors"]["Row"];

const Dashboard = () => {
  const { patients, loading: patientsLoading } = usePatients();
  const { doctors, loading: doctorsLoading } = useDoctors();
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { patients: ipdPatients, loading: ipdLoading } = useIPDPatients();
  console.log("appointments", appointments);
  // Get today's date for filtering today's appointments
  const today = new Date().toISOString().split("T")[0];
  const todaysAppointments = appointments.filter(
    (appointment) => appointment.date === today
  );

  // Calculate stats from fetched data
  const stats = [
    {
      title: "Total Patients",
      value: patients.length,
      icon: User,
      color: "bg-blue-500",
      link: "/patients",
    },
    {
      title: "Today's Appointments",
      value: todaysAppointments.length,
      icon: CalendarIcon,
      color: "bg-green-500",
      link: "/appointments",
    },
    {
      title: "IPD Patients",
      value: ipdPatients.length,
      icon: Bed,
      color: "bg-purple-500",
      link: "/ipd",
    },
    {
      title: "Active Doctors",
      value: doctors.length,
      icon: FileText,
      color: "bg-orange-500",
      link: "/doctors",
    },
  ];

  // Get recent appointments (last 4)
  const recentAppointments = todaysAppointments.slice(-4);
  console.log("recentAppointments", recentAppointments);

  // Calendar data with appointment-based coloring
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date()
  );

  // Group appointments by date and count them
  const appointmentsByDate = React.useMemo(() => {
    const grouped: { [key: string]: number } = {};
    appointments.forEach((appointment) => {
      const date = appointment.date;
      grouped[date] = (grouped[date] || 0) + 1;
    });
    return grouped;
  }, [appointments]);

  // Helper function to get appointment count for a specific date
  const getAppointmentCount = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return appointmentsByDate[dateString] || 0;
  };

  // Calendar modifiers based on appointment counts
  const calendarModifiers = {
    highLoad: (date: Date) => getAppointmentCount(date) > 10, // Red for >10
    mediumLoad: (date: Date) => {
      const count = getAppointmentCount(date);
      return count >= 5 && count <= 10; // Orange for 5-10
    },
    lowLoad: (date: Date) => {
      const count = getAppointmentCount(date);
      return count > 0 && count < 5; // Grey for <5
    },
  };

  // Helper function to get patient name by ID
  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.name : `Patient ${patientId}`;
  };

  // Helper function to get doctor name by ID
  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor ? doctor.name : `Doctor ${doctorId}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="flex space-x-3">
          <Button asChild className="ios-button">
            <Link to="/patients">Add Patient</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/appointments">Book Appointment</Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="ios-card hover:shadow-lg transition-all duration-200"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-xl ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {stat.link ? (
                <Link to={stat.link} className="block">
                  <div className="text-2xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer">
                    {stat.value}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% from last month
                  </div>
                </Link>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% from last month
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Appointments and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments - More Compact */}
        <div className="lg:col-span-2">
          <Card className="ios-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Clock className="h-5 w-5 mr-2" />
                Today's Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAppointments.length > 0 ? (
                  recentAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {getPatientName(appointment.patient_id)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            with {getDoctorName(appointment.doctor_id)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-medium text-foreground">
                          {appointment.time}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No appointments scheduled for today
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Button asChild variant="outline" className="w-full rounded-xl">
                  <Link to="/appointments">View All Appointments</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <div>
          <Card className="ios-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full p-3"
                modifiers={calendarModifiers}
                modifiersStyles={{
                  highLoad: { backgroundColor: "#fecaca", color: "#dc2626" }, // Red for >10
                  mediumLoad: { backgroundColor: "#fed7aa", color: "#ea580c" }, // Orange for 5-10
                  lowLoad: { backgroundColor: "#f3f4f6", color: "#6b7280" }, // Grey for <5
                }}
              />
              <div className="px-3 pb-3">
                <div className="text-xs space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-white rounded border border-gray-200"></div>
                    <span className="text-muted-foreground">
                      No appointments
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-100 rounded border border-gray-300"></div>
                    <span className="text-muted-foreground">
                      &lt;5 appointments
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-100 rounded border border-orange-200"></div>
                    <span className="text-muted-foreground">
                      5-10 appointments
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-100 rounded border border-red-200"></div>
                    <span className="text-muted-foreground">
                      &gt;10 appointments
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
