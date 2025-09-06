import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { toast } from "./use-toast";
import { Database } from "../types/database.types";

type MedicalRecord = Database["public"]["Tables"]["medical_records"]["Row"];
type MedicalRecordInsert =
  Database["public"]["Tables"]["medical_records"]["Insert"];
type MedicalRecordUpdate =
  Database["public"]["Tables"]["medical_records"]["Update"];

export function useMedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicalRecords = async (patientId?: string) => {
    try {
      setLoading(true);
      const { data, error } = await api.medicalRecords.getAll(patientId);

      if (error) throw new Error(error);
      setRecords(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to fetch medical records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMedicalRecord = async (record: MedicalRecordInsert) => {
    try {
      const { data, error } = await api.medicalRecords.create(record);

      if (error) throw new Error(error);

      setRecords((prev) => [data, ...prev]);
      toast({
        title: "Success",
        description: "Medical record added successfully",
      });
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to add medical record",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateMedicalRecord = async (
    id: string,
    updates: MedicalRecordUpdate
  ) => {
    try {
      const { data, error } = await api.medicalRecords.update(id, updates);

      if (error) throw new Error(error);

      setRecords((prev) => prev.map((r) => (r.id === id ? data : r)));
      toast({
        title: "Success",
        description: "Medical record updated successfully",
      });
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to update medical record",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteMedicalRecord = async (id: string) => {
    try {
      const { error } = await api.medicalRecords.delete(id);

      if (error) throw new Error(error);

      setRecords((prev) => prev.filter((r) => r.id !== id));
      toast({
        title: "Success",
        description: "Medical record deleted successfully",
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to delete medical record",
        variant: "destructive",
      });
      return false;
    }
  };

  const getRecordById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await api.medicalRecords.getById(id);

      if (error) throw error;

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getRecordsByDateRange = async (
    patientId: string,
    startDate: string,
    endDate: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await api.medicalRecords.getByDateRange(
        patientId,
        startDate,
        endDate
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

  const getRecordsByDoctor = async (doctorId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await api.medicalRecords.getByDoctor(doctorId);

      if (error) throw error;

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchRecords = async (patientId: string, searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await api.medicalRecords.search(
        patientId,
        searchTerm
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

  return {
    records,
    loading,
    error,
    fetchMedicalRecords,
    addMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    getRecordById,
    getRecordsByDateRange,
    getRecordsByDoctor,
    searchRecords,
  };
}
