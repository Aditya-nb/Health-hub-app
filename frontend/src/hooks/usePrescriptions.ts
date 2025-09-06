import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Database } from "../types/database.types";

type Prescription = Database["public"]["Tables"]["prescriptions"]["Row"];

export function usePrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrescriptions = async (patientId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await api.prescriptions.getAll({ patientId });

      if (error) throw new Error(error);

      setPrescriptions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addPrescription = async (
    prescription: Omit<Prescription, "id" | "created_at">
  ) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from("prescriptions")
        .insert([prescription])
        .select()
        .single();

      if (error) throw error;

      setPrescriptions((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const updatePrescription = async (
    id: string,
    updates: Partial<Prescription>
  ) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from("prescriptions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setPrescriptions((prev) =>
        prev.map((prescription) =>
          prescription.id === id ? { ...prescription, ...data } : prescription
        )
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const deletePrescription = async (id: string) => {
    try {
      setError(null);

      const { error } = await supabase
        .from("prescriptions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPrescriptions((prev) =>
        prev.filter((prescription) => prescription.id !== id)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const getPrescriptionById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPrescriptionsByDateRange = async (
    patientId: string,
    startDate: string,
    endDate: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", patientId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPrescriptionsByDoctor = async (doctorId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("doctor_id", doctorId)
        .order("date", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchPrescriptions = async (patientId: string, searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await api.prescriptions.getAll({
        patientId,
        search: searchTerm,
      });

      if (error) throw new Error(error);

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    prescriptions,
    loading,
    error,
    fetchPrescriptions,
    addPrescription,
    updatePrescription,
    deletePrescription,
    getPrescriptionById,
    getPrescriptionsByDateRange,
    getPrescriptionsByDoctor,
    searchPrescriptions,
  };
}
