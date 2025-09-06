import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Database } from "../types/database.types";

type IVSchedule = Database["public"]["Tables"]["iv_schedule"]["Row"];

export function useIVSchedule() {
  const [schedules, setSchedules] = useState<IVSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async (ipdPatientId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("iv_schedule")
        .select("*")
        .eq("ipd_patient_id", ipdPatientId)
        .order("time", { ascending: true });

      if (error) throw error;

      setSchedules(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addSchedule = async (
    schedule: Omit<IVSchedule, "id" | "created_at">
  ) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from("iv_schedule")
        .insert([schedule])
        .select()
        .single();

      if (error) throw error;

      setSchedules((prev) => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const updateSchedule = async (id: string, updates: Partial<IVSchedule>) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from("iv_schedule")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

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

      const { error } = await supabase
        .from("iv_schedule")
        .delete()
        .eq("id", id);

      if (error) throw error;

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

      const { data, error } = await supabase
        .from("iv_schedule")
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

  const getSchedulesByDate = async (ipdPatientId: string, date: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("iv_schedule")
        .select("*")
        .eq("ipd_patient_id", ipdPatientId)
        .eq("time", date)
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

  const getSchedulesByStatus = async (
    ipdPatientId: string,
    status: "Running" | "Completed" | "Scheduled" | "Stopped"
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("iv_schedule")
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
        .from("iv_schedule")
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
        .from("iv_schedule")
        .select("*")
        .eq("ipd_patient_id", ipdPatientId)
        .or(
          `fluid.ilike.%${searchTerm}%,volume.ilike.%${searchTerm}%,rate.ilike.%${searchTerm}%`
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
