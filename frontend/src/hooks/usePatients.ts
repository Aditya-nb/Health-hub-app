import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { toast } from "./use-toast";
import { Database } from "../types/database.types";

type Patient = Database["public"]["Tables"]["patients"]["Row"];
type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"];
type PatientUpdate = Database["public"]["Tables"]["patients"]["Update"];

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await api.patients.getAll();

      if (error) throw new Error(error);
      setPatients(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchPatients = async (searchTerm: string) => {
    try {
      setLoading(true);
      const { data, error } = await api.patients.getAll(searchTerm);

      if (error) throw new Error(error);
      setPatients(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to search patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPatient = async (patient: PatientInsert) => {
    try {
      const { data, error } = await api.patients.create(patient);

      if (error) throw new Error(error);

      setPatients((prev) => [data, ...prev]);
      toast({
        title: "Success",
        description: "Patient added successfully",
      });
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to add patient",
        variant: "destructive",
      });
      return null;
    }
  };

  const updatePatient = async (id: string, updates: PatientUpdate) => {
    try {
      const { data, error } = await api.patients.update(id, updates);

      if (error) throw new Error(error);

      setPatients((prev) => prev.map((p) => (p.id === id ? data : p)));
      toast({
        title: "Success",
        description: "Patient updated successfully",
      });
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to update patient",
        variant: "destructive",
      });
      return null;
    }
  };

  const deletePatient = async (id: string) => {
    try {
      const { error } = await api.patients.delete(id);

      if (error) throw new Error(error);

      setPatients((prev) => prev.filter((p) => p.id !== id));
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    patients,
    loading,
    error,
    fetchPatients,
    searchPatients,
    addPatient,
    updatePatient,
    deletePatient,
  };
}
