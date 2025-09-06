import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Database } from "../types/database.types";

type DoctorVisit = Database["public"]["Tables"]["doctor_visits"]["Row"];

export function useDoctorVisits() {
  const [visits, setVisits] = useState<DoctorVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVisits = async (ipdPatientId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("doctor_visits")
        .select("*")
        .eq("ipd_patient_id", ipdPatientId)
        .order("time", { ascending: false });

      if (error) throw error;

      setVisits(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addVisit = async (visit: Omit<DoctorVisit, "id" | "created_at">) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from("doctor_visits")
        .insert([visit])
        .select()
        .single();

      if (error) throw error;

      setVisits((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const updateVisit = async (id: string, updates: Partial<DoctorVisit>) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from("doctor_visits")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setVisits((prev) =>
        prev.map((visit) => (visit.id === id ? { ...visit, ...data } : visit))
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const deleteVisit = async (id: string) => {
    try {
      setError(null);

      const { error } = await supabase
        .from("doctor_visits")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setVisits((prev) => prev.filter((visit) => visit.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const getVisitById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("doctor_visits")
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

  const getVisitsByDate = async (ipdPatientId: string, date: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("doctor_visits")
        .select("*")
        .eq("ipd_patient_id", ipdPatientId)
        .eq("time", date)
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

  const getVisitsByDoctor = async (doctorId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("doctor_visits")
        .select("*")
        .eq("doctor_id", doctorId)
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

  const getVisitsByVitalsStatus = async (
    ipdPatientId: string,
    status: "Stable" | "Improving" | "Critical" | "Declining"
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("doctor_visits")
        .select("*")
        .eq("ipd_patient_id", ipdPatientId)
        .eq("vitals_status", status)
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

  const searchVisits = async (ipdPatientId: string, searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("doctor_visits")
        .select("*")
        .eq("ipd_patient_id", ipdPatientId)
        .or(
          `visit_type.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%,prescription.ilike.%${searchTerm}%`
        )
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

  return {
    visits,
    loading,
    error,
    fetchVisits,
    addVisit,
    updateVisit,
    deleteVisit,
    getVisitById,
    getVisitsByDate,
    getVisitsByDoctor,
    getVisitsByVitalsStatus,
    searchVisits,
  };
}
