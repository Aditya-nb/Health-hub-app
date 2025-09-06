import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Database } from "../types/database.types";

type Vital = Database["public"]["Tables"]["vitals"]["Row"];

export function useVitals() {
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVitals = async (ipdPatientId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await api.vitals.getAll({ ipdPatientId });

      if (error) throw new Error(error);

      setVitals(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addVital = async (vital: Omit<Vital, "id" | "created_at">) => {
    try {
      setError(null);

      const { data, error } = await api.vitals.create(vital);

      if (error) throw new Error(error);

      setVitals((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const updateVital = async (id: string, updates: Partial<Vital>) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from("vitals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setVitals((prev) =>
        prev.map((vital) => (vital.id === id ? { ...vital, ...data } : vital))
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const deleteVital = async (id: string) => {
    try {
      setError(null);

      const { error } = await supabase.from("vitals").delete().eq("id", id);

      if (error) throw error;

      setVitals((prev) => prev.filter((vital) => vital.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const getVitalById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("vitals")
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

  const getVitalsByDateRange = async (
    ipdPatientId: string,
    startDate: string,
    endDate: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("vitals")
        .select("*")
        .eq("ipd_patient_id", ipdPatientId)
        .gte("time", startDate)
        .lte("time", endDate)
        .order("time", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getLatestVitals = async (ipdPatientId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await api.vitals.getAll({
        ipdPatientId,
        latest: true,
      });

      if (error) throw new Error(error);

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getVitalsByTimeRange = async (ipdPatientId: string, hours: number) => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const startTime = new Date(
        now.getTime() - hours * 60 * 60 * 1000
      ).toISOString();

      const { data, error } = await supabase
        .from("vitals")
        .select("*")
        .eq("ipd_patient_id", ipdPatientId)
        .gte("time", startTime)
        .order("time", { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    vitals,
    loading,
    error,
    fetchVitals,
    addVital,
    updateVital,
    deleteVital,
    getVitalById,
    getVitalsByDateRange,
    getLatestVitals,
    getVitalsByTimeRange,
  };
}
