import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { toast } from "./use-toast";
import { Database } from "../types/database.types";

type Doctor = Database["public"]["Tables"]["doctors"]["Row"];
type DoctorInsert = Database["public"]["Tables"]["doctors"]["Insert"];
type DoctorUpdate = Database["public"]["Tables"]["doctors"]["Update"];

export function useDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data, error } = await api.doctors.getAll();

      if (error) throw new Error(error);
      setDoctors(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to fetch doctors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addDoctor = async (doctor: DoctorInsert) => {
    try {
      const { data, error } = await api.doctors.create(doctor);

      if (error) throw new Error(error);

      setDoctors((prev) => [data, ...prev]);
      toast({
        title: "Success",
        description: "Doctor added successfully",
      });
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to add doctor",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateDoctor = async (id: string, updates: DoctorUpdate) => {
    try {
      const { data, error } = await api.doctors.update(id, updates);

      if (error) throw new Error(error);

      setDoctors((prev) => prev.map((d) => (d.id === id ? data : d)));
      toast({
        title: "Success",
        description: "Doctor updated successfully",
      });
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to update doctor",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteDoctor = async (id: string) => {
    try {
      const { error } = await api.doctors.delete(id);

      if (error) throw new Error(error);

      setDoctors((prev) => prev.filter((d) => d.id !== id));
      toast({
        title: "Success",
        description: "Doctor deleted successfully",
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to delete doctor",
        variant: "destructive",
      });
      return false;
    }
  };

  const getDoctorById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await api.doctors.getById(id);

      if (error) throw error;

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDoctorsBySpecialization = async (specialization: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await api.doctors.getBySpecialization(
        specialization
      );

      if (error) throw error;

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchDoctors = async (searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await api.doctors.search(searchTerm);

      if (error) throw error;

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshDoctors = async () => {
    await fetchDoctors();
  };

  return {
    doctors,
    loading,
    error,
    fetchDoctors,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctorById,
    getDoctorsBySpecialization,
    searchDoctors,
    refreshDoctors,
  };
}
