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
import { DialogDescription, DialogFooter } from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import {
  User,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  Grid2x2,
  LayoutList,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "../hooks/use-toast";
import PatientDetails from "../components/PatientDetails";
import { usePatients } from "../hooks/usePatients";
import { Database } from "../types/database.types";

type Patient = Database["public"]["Tables"]["patients"]["Row"];
type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"];
type PatientUpdate = Database["public"]["Tables"]["patients"]["Update"];

const Patients = () => {
  const {
    patients,
    loading,
    error,
    addPatient,
    updatePatient,
    deletePatient,
    fetchPatients,
  } = usePatients();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortBy, setSortBy] = useState<"name" | "id">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientDetailsOpen, setIsPatientDetailsOpen] = useState(false);
  const [newPatient, setNewPatient] = useState<Partial<PatientInsert>>({
    name: "",
    age: 0,
    gender: "",
    contact: null,
    email: null,
    abha_id: null,
    address: null,
  });

  useEffect(() => {
    if (searchTerm) {
      // Filter patients locally since we don't have a searchPatients function
      fetchPatients();
    } else {
      fetchPatients();
    }
  }, [searchTerm]);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.contact &&
        patient.contact.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const aValue = sortBy === "name" ? a.name : a.id;
    const bValue = sortBy === "name" ? b.name : b.id;
    if (sortOrder === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const handleSort = (field: "name" | "id") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleAddPatient = async () => {
    if (!newPatient.name || !newPatient.age || !newPatient.gender) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    try {
      await addPatient({
        name: newPatient.name,
        age: newPatient.age,
        gender: newPatient.gender,
        contact: newPatient.contact,
        email: newPatient.email,
        abha_id: newPatient.abha_id,
        address: newPatient.address,
      });
      setNewPatient({
        name: "",
        age: 0,
        gender: "",
        contact: null,
        email: null,
        abha_id: null,
        address: null,
      });
      setIsAddDialogOpen(false);
      toast({
        title: "Patient Added",
        description: `${newPatient.name} has been successfully registered.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add patient",
        variant: "destructive",
      });
    }
  };

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsPatientDetailsOpen(true);
  };

  const handleBookAppointment = (patientId: string) => {
    toast({
      title: "Book Appointment",
      description: `Booking appointment for patient ${patientId}`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">
          Patient Management
        </h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="ios-button">
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border shadow-lg">
            <DialogHeader>
              <DialogTitle>Register New Patient</DialogTitle>
              <DialogDescription>
                Fill in the patient information below to register a new patient.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={newPatient.name}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, name: e.target.value })
                  }
                  placeholder="Enter patient name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="age">
                  Age <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={newPatient.age || ""}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      age: parseInt(e.target.value),
                    })
                  }
                  placeholder="Enter age"
                  required
                />
              </div>
              <div>
                <Label htmlFor="gender">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newPatient.gender || ""}
                  onValueChange={(value) =>
                    setNewPatient({ ...newPatient, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  value={newPatient.contact || ""}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, contact: e.target.value })
                  }
                  placeholder="Enter contact number"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPatient.email || ""}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="abhaId">ABHA ID</Label>
                <Input
                  id="abhaId"
                  value={newPatient.abha_id || ""}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, abha_id: e.target.value })
                  }
                  placeholder="Enter ABHA ID"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newPatient.address || ""}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, address: e.target.value })
                  }
                  placeholder="Enter address"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddPatient}>Add Patient</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) =>
              value && setViewMode(value as "grid" | "table")
            }
          >
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid2x2 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table view">
              <LayoutList className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort("name")}
            className="flex items-center"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort("id")}
            className="flex items-center"
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPatients.map((patient) => (
            <Card
              key={patient.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handlePatientClick(patient)}
            >
              <CardHeader className="flex flex-row items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{patient.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    ID: {patient.id}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Age: {patient.age}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Gender: {patient.gender}</span>
                  </div>
                  {patient.contact && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{patient.contact}</span>
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{patient.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPatients.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="cursor-pointer"
                  onClick={() => handlePatientClick(patient)}
                >
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.id}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.contact || "-"}</TableCell>
                  <TableCell>{patient.email || "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookAppointment(patient.id);
                      }}
                    >
                      Book Appointment
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedPatient && (
        <PatientDetails
          patient={selectedPatient}
          open={isPatientDetailsOpen}
          onOpenChange={setIsPatientDetailsOpen}
          onBookAppointment={() => handleBookAppointment(selectedPatient.id)}
        />
      )}
    </div>
  );
};

export default Patients;
