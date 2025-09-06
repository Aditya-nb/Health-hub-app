import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Database } from "../types/database.types";
import { toast } from "./use-toast";

type IPDPatient = Database["public"]["Tables"]["ipd_patients"]["Row"];
type IPDPatientInsert = Database["public"]["Tables"]["ipd_patients"]["Insert"];
type IPDPatientUpdate = Database["public"]["Tables"]["ipd_patients"]["Update"];

export function useIPDPatients() {
  const [patients, setPatients] = useState<IPDPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIPDPatients();
  }, []);

  const fetchIPDPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await api.ipdPatients.getAll();

      if (error) throw new Error(error);

      setPatients(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to fetch IPD patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addIPDPatient = async (patient: IPDPatientInsert) => {
    try {
      setError(null);

      const { data, error } = await api.ipdPatients.create(patient);

      if (error) throw new Error(error);

      setPatients((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const updateIPDPatient = async (id: string, updates: IPDPatientUpdate) => {
    try {
      setError(null);

      const { data, error } = await api.ipdPatients.update(id, updates);

      if (error) throw new Error(error);

      setPatients((prev) =>
        prev.map((patient) =>
          patient.id === id ? { ...patient, ...data } : patient
        )
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const deleteIPDPatient = async (id: string) => {
    try {
      setError(null);

      const { error } = await api.ipdPatients.delete(id);

      if (error) throw new Error(error);

      setPatients((prev) => prev.filter((patient) => patient.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const getIPDPatientById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await api.ipdPatients.getById(id);

      if (error) throw new Error(error);

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getIPDPatientsByDoctor = async (doctorId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await api.ipdPatients.getAll({ doctorId });

      if (error) throw new Error(error);

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getIPDPatientsBySeverity = async (
    severity: "Critical" | "Stable" | "Recovering"
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await api.ipdPatients.getAll({ severity });

      if (error) throw new Error(error);

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getIPDPatientsByRoom = async (roomNumber: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await api.ipdPatients.getAll({ roomNumber });

      if (error) throw new Error(error);

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchIPDPatients = async (searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await api.ipdPatients.getAll({ search: searchTerm });

      if (error) throw new Error(error);

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshIPDPatients = async () => {
    await fetchIPDPatients();
  };

  return {
    patients,
    loading,
    error,
    fetchIPDPatients,
    addIPDPatient,
    updateIPDPatient,
    deleteIPDPatient,
    getIPDPatientById,
    getIPDPatientsByDoctor,
    getIPDPatientsBySeverity,
    getIPDPatientsByRoom,
    searchIPDPatients,
    refreshIPDPatients,
  };
}
