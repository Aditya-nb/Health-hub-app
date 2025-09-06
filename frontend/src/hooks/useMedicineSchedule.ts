import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Database } from "../types/database.types";

type MedicineSchedule =
  Database["public"]["Tables"]["medicine_schedule"]["Row"];

export function useMedicineSchedule() {
  const [schedules, setSchedules] = useState<MedicineSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async (ipdPatientId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await api.medicineSchedule.getAll({
        ipdPatientId,
      });

      if (error) throw new Error(error);

      setSchedules(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addSchedule = async (
    schedule: Omit<MedicineSchedule, "id" | "created_at">
  ) => {
    try {
      setError(null);

      const { data, error } = await api.medicineSchedule.create(schedule);

      if (error) throw new Error(error);

      setSchedules((prev) => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const updateSchedule = async (
    id: string,
    updates: Partial<MedicineSchedule>
  ) => {
    try {
      setError(null);

      const { data, error } = await api.medicineSchedule.update(id, updates);

      if (error) throw new Error(error);

      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === id ? { ...schedule, ...data } : schedule
        )
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      setError(null);

      const { error } = await api.medicineSchedule.delete(id);

      if (error) throw new Error(error);

      setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const getScheduleById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await api.medicineSchedule.getById(id);

      if (error) throw new Error(error);

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSchedulesByDate = async (ipdPatientId: string, date: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await api.medicineSchedule.getAll({
        ipdPatientId,
        date,
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

  const getSchedulesByStatus = async (
    ipdPatientId: string,
    status: "Given" | "Pending" | "Scheduled" | "Missed"
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("medicine_schedule")
        .select("*")
        .eq("ipd_patient_id", ipdPatientId)
        .eq("status", status)
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

  const getSchedulesByNurse = async (nurse: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("medicine_schedule")
        .select("*")
        .eq("nurse", nurse)
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

  const searchSchedules = async (ipdPatientId: string, searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("medicine_schedule")
        .select("*")
        .eq("ipd_patient_id", ipdPatientId)
        .or(
          `medicine.ilike.%${searchTerm}%,dosage.ilike.%${searchTerm}%,frequency.ilike.%${searchTerm}%`
        )
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
    schedules,
    loading,
    error,
    fetchSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    getScheduleById,
    getSchedulesByDate,
    getSchedulesByStatus,
    getSchedulesByNurse,
    searchSchedules,
  };
}
