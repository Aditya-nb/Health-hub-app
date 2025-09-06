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
  Stethoscope,
  Plus,
  Phone,
  Mail,
  Clock,
  User,
  ArrowLeft,
} from "lucide-react";
import { toast } from "../hooks/use-toast";
import DoctorSchedule from "../components/DoctorSchedule";
import { useDoctors } from "../hooks/useDoctors";
import { Database } from "../types/database.types";

type Doctor = Database["public"]["Tables"]["doctors"]["Row"];
type DoctorInsert = Database["public"]["Tables"]["doctors"]["Insert"];
type DoctorUpdate = Database["public"]["Tables"]["doctors"]["Update"];

const Doctors = () => {
  const {
    doctors,
    loading,
    error,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    searchDoctors,
    refreshDoctors,
  } = useDoctors();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [newDoctor, setNewDoctor] = useState<Partial<DoctorInsert>>({
    name: "",
    specialization: "",
    contact: null,
    email: null,
    experience: null,
    availability: [],
  });

  const specializations = [
    "Cardiologist",
    "Pediatrician",
    "Orthopedic",
    "Neurologist",
    "Dermatologist",
    "Psychiatrist",
    "Gynecologist",
    "General Medicine",
  ];

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    refreshDoctors();
  }, []);

  const handleAddDoctor = async () => {
    try {
      await addDoctor({
        name: newDoctor.name || "",
        specialization: newDoctor.specialization || "",
        contact: newDoctor.contact,
        email: newDoctor.email,
        experience: newDoctor.experience,
        availability: newDoctor.availability,
      });
      setNewDoctor({
        name: "",
        specialization: "",
        contact: null,
        email: null,
        experience: null,
        availability: [],
      });
      setIsAddDialogOpen(false);
      toast({
        title: "Doctor Added",
        description: `${newDoctor.name} has been successfully added to the system.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add doctor",
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = (day: string) => {
    setNewDoctor((prev) => ({
      ...prev,
      availability: prev.availability?.includes(day)
        ? prev.availability.filter((d) => d !== day)
        : [...(prev.availability || []), day],
    }));
  };

  const handleViewSchedule = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleBackToList = () => {
    setSelectedDoctor(null);
  };

  if (selectedDoctor) {
    return <DoctorSchedule doctor={selectedDoctor} onBack={handleBackToList} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">
          Doctor Management
        </h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="ios-button">
              <Plus className="h-4 w-4 mr-2" />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl ios-card">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newDoctor.name || ""}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, name: e.target.value })
                  }
                  placeholder="Dr. John Doe"
                />
              </div>
              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Select
                  value={newDoctor.specialization || ""}
                  onValueChange={(value) =>
                    setNewDoctor({ ...newDoctor, specialization: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  value={newDoctor.contact || ""}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, contact: e.target.value })
                  }
                  placeholder="+91 9876543210"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newDoctor.email || ""}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, email: e.target.value })
                  }
                  placeholder="doctor@hospital.com"
                />
              </div>
              <div>
                <Label htmlFor="experience">Experience (Years)</Label>
                <Input
                  id="experience"
                  type="number"
                  value={newDoctor.experience || ""}
                  onChange={(e) =>
                    setNewDoctor({
                      ...newDoctor,
                      experience: parseInt(e.target.value) || null,
                    })
                  }
                  placeholder="5"
                />
              </div>
              <div className="col-span-2">
                <Label>Availability Days</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {weekDays.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={
                        newDoctor.availability?.includes(day)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => toggleAvailability(day)}
                      className="rounded-xl"
                    >
                      {day.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={handleAddDoctor}>Add Doctor</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <Card
            key={doctor.id}
            className="ios-card hover:shadow-lg transition-all duration-200"
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{doctor.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {doctor.specialization}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  {doctor.contact || "Not provided"}
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  {doctor.email || "Not provided"}
                </div>
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  {doctor.experience || "N/A"} years experience
                </div>
                <div className="mt-3">
                  <div className="flex items-center text-sm mb-2">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    Available Days:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {doctor.availability && doctor.availability.length > 0 ? (
                      doctor.availability.map((day) => (
                        <span
                          key={day}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {day.slice(0, 3)}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Not specified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  onClick={() => handleViewSchedule(doctor)}
                  className="w-full rounded-xl"
                >
                  View Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {doctors.length === 0 && (
        <Card className="ios-card">
          <CardContent className="text-center py-8">
            <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No doctors found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Doctors;
