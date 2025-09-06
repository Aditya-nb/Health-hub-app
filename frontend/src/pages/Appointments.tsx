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
import {
  Calendar,
  Clock,
  Plus,
  User,
  Search,
  Edit,
  MoreVertical,
} from "lucide-react";
import { toast } from "../hooks/use-toast";
import { useAppointments } from "../hooks/useAppointments";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { usePatients } from "../hooks/usePatients";
import { useDoctors } from "../hooks/useDoctors";
import { Database } from "../types/database.types";

type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
type AppointmentInsert = Database["public"]["Tables"]["appointments"]["Insert"];
type AppointmentUpdate = Database["public"]["Tables"]["appointments"]["Update"];

const Appointments = () => {
  const {
    appointments,
    loading,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDate,
    getAppointmentsByDoctor,
    getAppointmentsByPatient,
    refreshAppointments,
  } = useAppointments();
  const { patients } = usePatients();
  const { doctors } = useDoctors();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [newAppointment, setNewAppointment] = useState<
    Partial<AppointmentInsert>
  >({
    patient_id: "",
    doctor_id: "",
    date: "",
    time: "",
    type: "",
    status: "Scheduled",
  });

  useEffect(() => {
    refreshAppointments();
  }, []);

  // Helper functions to get names
  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.name : `Patient ${patientId}`;
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor ? doctor.name : `Doctor ${doctorId}`;
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const patientName = getPatientName(appointment.patient_id);
    const doctorName = getDoctorName(appointment.doctor_id);
    const matchesSearch =
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      appointment.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleBookAppointment = async () => {
    try {
      if (
        !newAppointment.patient_id ||
        !newAppointment.doctor_id ||
        !newAppointment.date ||
        !newAppointment.time ||
        !newAppointment.type
      ) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      await addAppointment({
        patient_id: newAppointment.patient_id,
        doctor_id: newAppointment.doctor_id,
        date: newAppointment.date,
        time: newAppointment.time,
        type: newAppointment.type,
        status: "Scheduled",
      });

      setNewAppointment({
        patient_id: "",
        doctor_id: "",
        date: "",
        time: "",
        type: "",
        status: "Scheduled",
      });
      setIsBookDialogOpen(false);
      toast({
        title: "Appointment Booked",
        description: "Appointment has been successfully scheduled",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive",
      });
    }
  };

  const updateAppointmentStatus = async (
    id: string,
    status: "Scheduled" | "Completed" | "Cancelled" | "Upcoming" | "In Progress"
  ) => {
    try {
      await updateAppointment(id, { status });
      toast({
        title: "Status Updated",
        description: `Appointment status changed to ${status}`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAppointment) return;

    try {
      await updateAppointment(editingAppointment.id, editingAppointment);
      setIsEditDialogOpen(false);
      setEditingAppointment(null);
      toast({
        title: "Appointment Updated",
        description: "Appointment has been successfully updated",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">
          Appointment Management
        </h1>
        <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
          <DialogTrigger asChild>
            <Button className="ios-button">
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-white dark:bg-gray-900 border shadow-lg">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="patient_id">Patient</Label>
                <Select
                  value={newAppointment.patient_id || ""}
                  onValueChange={(value) =>
                    setNewAppointment({ ...newAppointment, patient_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900">
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} - {patient.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="doctor_id">Doctor</Label>
                <Select
                  value={newAppointment.doctor_id || ""}
                  onValueChange={(value) =>
                    setNewAppointment({ ...newAppointment, doctor_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900">
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newAppointment.date || ""}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      date: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Select
                  value={newAppointment.time || ""}
                  onValueChange={(value) =>
                    setNewAppointment({ ...newAppointment, time: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900">
                    <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                    <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                    <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                    <SelectItem value="2:00 PM">2:00 PM</SelectItem>
                    <SelectItem value="3:00 PM">3:00 PM</SelectItem>
                    <SelectItem value="4:00 PM">4:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Appointment Type</Label>
                <Select
                  value={newAppointment.type || ""}
                  onValueChange={(value) =>
                    setNewAppointment({ ...newAppointment, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900">
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Check-up">Check-up</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={handleBookAppointment}>Book Appointment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Appointment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-gray-900 border shadow-lg">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>
          {editingAppointment && (
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="editDate">Date</Label>
                <Input
                  id="editDate"
                  type="date"
                  value={editingAppointment.date}
                  onChange={(e) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      date: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="editTime">Time</Label>
                <Select
                  value={editingAppointment.time}
                  onValueChange={(value) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      time: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900">
                    <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                    <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                    <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                    <SelectItem value="2:00 PM">2:00 PM</SelectItem>
                    <SelectItem value="3:00 PM">3:00 PM</SelectItem>
                    <SelectItem value="4:00 PM">4:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editDoctor">Doctor</Label>
                <Select
                  value={editingAppointment.doctor_id}
                  onValueChange={(value) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      doctor_id: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900">
                    <SelectItem value="1">Dr. Smith - Cardiologist</SelectItem>
                    <SelectItem value="2">
                      Dr. Johnson - Pediatrician
                    </SelectItem>
                    <SelectItem value="3">Dr. Brown - Orthopedic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editType">Appointment Type</Label>
                <Select
                  value={editingAppointment.type}
                  onValueChange={(value) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      type: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900">
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Regular Checkup">
                      Regular Checkup
                    </SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={editingAppointment.status}
                  onValueChange={(value) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      status: value as
                        | "Scheduled"
                        | "Completed"
                        | "Cancelled"
                        | "Upcoming"
                        | "In Progress",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900">
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="ios-button">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card className="ios-card">
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.map((appointment) => (
          <Card
            key={appointment.id}
            className="ios-card hover:shadow-lg transition-all duration-200"
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {getPatientName(appointment.patient_id)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      with {getDoctorName(appointment.doctor_id)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {appointment.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="flex items-center text-sm font-medium text-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {appointment.date}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {appointment.time}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${
                        appointment.status === "Scheduled"
                          ? "bg-yellow-100 text-yellow-800"
                          : ""
                      }
                      ${
                        appointment.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : ""
                      }
                      ${
                        appointment.status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : ""
                      }
                    `}
                    >
                      {appointment.status}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditAppointment(appointment)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateAppointmentStatus(appointment.id, "Completed")
                          }
                        >
                          Mark as Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateAppointmentStatus(appointment.id, "Cancelled")
                          }
                        >
                          Cancel Appointment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Appointments;
